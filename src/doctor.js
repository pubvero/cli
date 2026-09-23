import { CliError } from './errors.js';

const MAX_METADATA_BYTES = 65_536;
const REQUEST_TIMEOUT_MS = 10_000;

/** @param {string} value */
function secureUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('invalid_url');
  return url;
}

/** Only the user-selected instance is contacted. Never follow discovered URLs.
 * @param {string} server
 * @param {typeof fetch} request
 */
export async function doctor(server, request = fetch) {
  let url;
  try {
    url = secureUrl(server);
    if (url.pathname !== '/mcp') throw new Error('invalid_path');
  } catch {
    throw new CliError('invalid_server');
  }
  try {
    const response = await request(
      new URL('/.well-known/oauth-protected-resource/mcp', url),
      {
        method: 'GET',
        redirect: 'error',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      throw new CliError('discovery_failed');
    }
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        response.headers.get('content-type') ?? '',
      ) ||
      !response.body
    ) {
      await response.body?.cancel();
      throw new CliError('invalid_metadata');
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_METADATA_BYTES) throw new CliError('invalid_metadata');
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (
        body.resource !== url.href ||
        !Array.isArray(body.authorization_servers) ||
        body.authorization_servers.length === 0
      )
        throw new Error('invalid_metadata');
      for (const issuer of body.authorization_servers) {
        if (typeof issuer !== 'string') throw new Error('invalid_issuer');
        secureUrl(issuer);
      }
    } catch {
      throw new CliError('invalid_metadata');
    }
    return { ok: true, code: 'discovery_ok' };
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError('discovery_failed');
  }
}
