import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { CliError } from './errors.js';

/** @param {string} actual @param {string} expected */
function equalState(actual, expected) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** @param {string} message @param {AbortSignal} signal @param {number} timeout */
export async function createAuthorizationCallback(
  message,
  signal,
  timeout = 180_000,
) {
  let expectedState = '';
  let finished = false;
  const path = `/callback/${randomBytes(24).toString('hex')}`;
  /** @type {(value: URLSearchParams) => void} */
  let resolveResult;
  /** @type {(error: Error) => void} */
  let rejectResult;
  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  void result.catch(() => {});
  let origin = '';
  const server = createServer(
    { requestTimeout: 5000, headersTimeout: 5000 },
    (request, response) => {
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; frame-ancestors 'none'",
      );
      response.setHeader('Referrer-Policy', 'no-referrer');
      const end = (/** @type {number} */ status) => {
        response.writeHead(status);
        response.end(status === 200 ? message : '');
      };
      if (
        request.headers.host !== new URL(origin).host ||
        request.headers.origin
      )
        return end(403);
      if (request.method !== 'GET') return end(405);
      const url = new URL(request.url ?? '/', origin);
      if (url.pathname !== path) return end(404);
      if (finished) return end(410);
      const params = url.searchParams;
      if (
        !expectedState ||
        params.getAll('state').length !== 1 ||
        !equalState(params.get('state') ?? '', expectedState)
      )
        return end(403);
      if (params.has('error')) {
        finished = true;
        rejectResult(new CliError('oauth_cancelled'));
        return end(400);
      }
      if (
        params.getAll('code').length !== 1 ||
        !params.get('code') ||
        params.getAll('iss').length > 1
      )
        return end(400);
      finished = true;
      resolveResult(params);
      end(200);
    },
  );
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(undefined));
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new CliError('oauth_failed');
  origin = `http://127.0.0.1:${address.port}`;
  const cancel = () => rejectResult(new CliError('oauth_cancelled'));
  const timer = setTimeout(
    () => rejectResult(new CliError('oauth_timeout')),
    timeout,
  );
  signal.addEventListener('abort', cancel, { once: true });
  if (signal.aborted) cancel();
  return {
    url: origin + path,
    result,
    expectState(/** @type {string} */ state) {
      expectedState = state;
    },
    async close() {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      if (!finished) cancel();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(() => resolve(undefined)));
    },
  };
}

/** @typedef {import('@modelcontextprotocol/client').OAuthClientProvider} OAuthClientProvider */
/** @implements {OAuthClientProvider} */
export class MemoryOAuthProvider {
  /** @type {Map<string, import('@modelcontextprotocol/client').StoredOAuthClientInformation>} */
  credentials = new Map();
  /** @type {import('@modelcontextprotocol/client').StoredOAuthTokens | undefined} */
  storedTokens;
  /** @type {import('@modelcontextprotocol/client').OAuthDiscoveryState | undefined} */
  discovery;
  verifier = '';
  /** @param {URL} server @param {Awaited<ReturnType<typeof createAuthorizationCallback>>} callback @param {(url: URL) => void} redirect */
  constructor(server, callback, redirect) {
    this.server = server;
    this.callback = callback;
    this.redirect = redirect;
  }
  get redirectUrl() {
    return this.callback.url;
  }
  get clientMetadata() {
    return {
      client_name: 'Pubvero CLI',
      redirect_uris: [this.redirectUrl],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: 'mcp:use',
    };
  }
  state() {
    const state = randomBytes(32).toString('hex');
    this.callback.expectState(state);
    return state;
  }
  /** @param {import('@modelcontextprotocol/client').OAuthClientInformationContext} [context] */
  clientInformation(context) {
    return context ? this.credentials.get(context.issuer) : undefined;
  }
  /** @param {import('@modelcontextprotocol/client').StoredOAuthClientInformation} information @param {import('@modelcontextprotocol/client').OAuthClientInformationContext} [context] */
  saveClientInformation(information, context) {
    if (context) this.credentials.set(context.issuer, information);
  }
  tokens() {
    return this.storedTokens;
  }
  /** @param {import('@modelcontextprotocol/client').StoredOAuthTokens} tokens */
  saveTokens(tokens) {
    this.storedTokens = tokens;
  }
  /** @param {string} verifier */
  saveCodeVerifier(verifier) {
    this.verifier = verifier;
  }
  codeVerifier() {
    if (!this.verifier) throw new CliError('oauth_failed');
    return this.verifier;
  }
  /** @param {import('@modelcontextprotocol/client').OAuthDiscoveryState} state */
  saveDiscoveryState(state) {
    this.discovery = state;
  }
  discoveryState() {
    return this.discovery;
  }
  /** @param {URL} url */
  redirectToAuthorization(url) {
    if (url.origin !== this.server.origin)
      throw new CliError('oauth_untrusted_origin');
    this.redirect(url);
  }
  /** @param {string | URL} server @param {string} [resource] */
  async validateResourceURL(server, resource) {
    if (
      new URL(server).href !== this.server.href ||
      (resource && resource !== this.server.href)
    )
      throw new CliError('oauth_untrusted_origin');
    return this.server;
  }
  /** @param {'all' | 'client' | 'tokens' | 'verifier' | 'discovery'} scope */
  invalidateCredentials(scope) {
    if (scope === 'all' || scope === 'client') this.credentials.clear();
    if (scope === 'all' || scope === 'tokens') this.storedTokens = undefined;
    if (scope === 'all' || scope === 'verifier') this.verifier = '';
    if (scope === 'all' || scope === 'discovery') this.discovery = undefined;
  }
}

/** Pubvero serves its authorization endpoints on the instance origin.
 * @param {URL} server @param {AbortSignal} signal @param {typeof fetch} request
 * @returns {typeof fetch}
 */
export function pinnedFetch(server, signal, request = fetch) {
  return async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (
      url.origin !== server.origin ||
      url.username ||
      url.password ||
      url.protocol !== 'https:'
    )
      throw new CliError('oauth_untrusted_origin');
    return request(input, {
      ...options,
      redirect: 'error',
      credentials: 'omit',
      signal: AbortSignal.any([
        signal,
        AbortSignal.timeout(30_000),
        ...(options?.signal ? [options.signal] : []),
      ]),
    });
  };
}
