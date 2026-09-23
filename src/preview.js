import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readPage } from './pages.js';
import { CliError } from './errors.js';
import { messages } from './messages.js';
import { previewDocument, injectBridge } from './preview-view.js';

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_ACTIVE_REQUESTS = 8;
const MAX_SNAPSHOTS = 8;
export const PAGE_POLICY =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'self'; sandbox allow-scripts";

/** @param {{file: string, pageId: number, server: string, locale: string, session: Pick<Awaited<ReturnType<typeof import('./session.js').connect>>, 'call'>}} options */
export async function startPreview(options) {
  const root = `/preview/${randomBytes(24).toString('hex')}/`;
  const channel = randomBytes(24).toString('hex');
  const text = messages[options.locale];
  /** @type {Map<string, {html: string, version: number, bindings: Set<string>}>} */
  const snapshots = new Map();
  let origin = '';
  let active = 0;
  const server = createServer(
    { requestTimeout: 10_000, headersTimeout: 5000 },
    (request, response) => {
      void handle(request, response).catch(() => {
        if (!response.headersSent) response.writeHead(500);
        response.end();
      });
    },
  );

  /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
  async function handle(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'",
    );
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    const end = (
      /** @type {number} */ status,
      /** @type {unknown} */ body = {},
    ) => {
      response.writeHead(status);
      response.end(JSON.stringify(body));
    };
    if (
      request.headers.host !== new URL(origin).host ||
      request.headers['sec-fetch-site'] === 'cross-site'
    )
      return end(403);
    const url = new URL(request.url ?? '/', origin);
    if (!url.pathname.startsWith(root) || url.search) return end(404);
    const route = url.pathname.slice(root.length);
    if (request.method === 'GET' && route === '') {
      const nonce = randomBytes(24).toString('base64');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader(
        'Content-Security-Policy',
        `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      );
      response.end(
        previewDocument({
          nonce,
          channel,
          text,
          locale: options.locale,
          instance: new URL(options.server).host,
        }),
      );
      return;
    }
    if (request.method === 'GET' && route.startsWith('frame/')) {
      const snapshot = snapshots.get(route.slice(6));
      if (!snapshot) return end(404);
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Content-Security-Policy', PAGE_POLICY);
      response.end(
        injectBridge(snapshot.html, channel, text.preview_query_failed),
      );
      return;
    }
    if (!['prepare', 'query', 'viewer'].includes(route)) return end(404);
    if (request.method !== 'POST') return end(405);
    if (request.headers.origin !== origin) return end(403);
    if (request.headers['content-type'] !== 'application/json') return end(415);
    if (Number(request.headers['content-length'] ?? 0) > MAX_REQUEST_BYTES)
      return end(413);
    if (active >= MAX_ACTIVE_REQUESTS) return end(429);
    active++;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of request.iterator({ destroyOnReturn: false })) {
        size += chunk.length;
        if (size > MAX_REQUEST_BYTES) {
          request.resume();
          return end(413);
        }
        chunks.push(chunk);
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        return end(400);
      }
      if (!body || typeof body !== 'object' || Array.isArray(body))
        return end(400);
      if (route === 'prepare') {
        const runtime = await options.session.call('get-page-runtime', {
          page_id: options.pageId,
        });
        if (
          runtime.page?.id !== options.pageId ||
          !Number.isSafeInteger(runtime.page?.version_id) ||
          runtime.page.version_id < 1 ||
          !Array.isArray(runtime.bindings)
        )
          throw new CliError('remote_failed');
        const html = await readPage(options.file);
        const key = randomBytes(24).toString('hex');
        snapshots.set(key, {
          html,
          version: runtime.page.version_id,
          bindings: new Set(runtime.bindings.map((binding) => binding.name)),
        });
        if (snapshots.size > MAX_SNAPSHOTS)
          snapshots.delete(
            /** @type {string} */ (snapshots.keys().next().value),
          );
        return end(200, {
          snapshot: key,
          title: runtime.page.title,
          version: runtime.page.version_number,
        });
      }
      const snapshot = snapshots.get(body.snapshot);
      if (!snapshot) return end(400);
      if (route === 'viewer') {
        const runtime = await options.session.call('get-page-runtime', {
          page_id: options.pageId,
        });
        if (runtime.page?.version_id !== snapshot.version)
          throw new CliError('remote_failed');
        return end(200, { locale: runtime.viewer?.locale });
      }
      if (
        typeof body.name !== 'string' ||
        !snapshot.bindings.has(body.name) ||
        !body.parameters ||
        typeof body.parameters !== 'object' ||
        Array.isArray(body.parameters)
      )
        return end(400);
      const result = await options.session.call('execute-page-binding', {
        page_id: options.pageId,
        version_id: snapshot.version,
        name: body.name,
        parameters: body.parameters,
      });
      return end(200, result);
    } catch (error) {
      const code = error instanceof CliError ? error.code : 'remote_failed';
      return end(502, {
        code,
        message:
          code === 'file_unreadable' || code === 'invalid_file'
            ? text[code]
            : text.preview_query_failed,
      });
    } finally {
      active--;
    }
  }
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(undefined));
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new CliError('preview_failed');
  origin = `http://127.0.0.1:${address.port}`;
  return {
    url: origin + root,
    async close() {
      snapshots.clear();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(() => resolve(undefined)));
    },
  };
}
