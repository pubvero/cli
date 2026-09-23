import {
  Client,
  StreamableHTTPClientTransport,
  UnauthorizedError,
} from '@modelcontextprotocol/client';
import {
  createAuthorizationCallback,
  MemoryOAuthProvider,
  pinnedFetch,
} from './oauth.js';
import { CliError } from './errors.js';

/** @param {string} value */
export function serverUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.pathname !== '/mcp' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error();
    return url;
  } catch {
    throw new CliError('invalid_server');
  }
}

/** @param {string} server
 * @param {{signal: AbortSignal, callbackMessage: string, onAuthorize: (url: URL) => void, request?: typeof fetch}} options
 */
export async function connect(server, options) {
  const url = serverUrl(server);
  const callback = await createAuthorizationCallback(
    options.callbackMessage,
    options.signal,
  );
  const provider = new MemoryOAuthProvider(url, callback, options.onAuthorize);
  const client = new Client({ name: 'pubvero-cli', version: '0.1.0' });
  client.onerror = () => {};
  const transportOptions = {
    authProvider: provider,
    fetch: pinnedFetch(url, options.signal, options.request),
    onInsufficientScope: /** @type {const} */ ('throw'),
  };
  let transport = new StreamableHTTPClientTransport(url, transportOptions);
  try {
    try {
      await client.connect(transport);
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) throw error;
      const parameters = await callback.result;
      await transport.finishAuth(parameters);
      await transport.close();
      transport = new StreamableHTTPClientTransport(url, transportOptions);
      await client.connect(transport);
    }
  } catch (error) {
    provider.invalidateCredentials('all');
    await transport.close();
    throw error instanceof CliError ? error : new CliError('oauth_failed');
  } finally {
    await callback.close();
  }

  return {
    /** @param {string} name @param {Record<string, unknown>} args
     * @returns {Promise<Record<string, any>>}
     */
    async call(name, args) {
      try {
        const result = await client.callTool(
          { name, arguments: args },
          { timeout: 30_000, signal: options.signal },
        );
        if (result.isError) throw new CliError('remote_failed');
        const value =
          result.structuredContent ??
          JSON.parse(
            result.content
              .filter((item) => item.type === 'text')
              .map((item) => item.text)
              .join(''),
          );
        if (!value || typeof value !== 'object' || Array.isArray(value))
          throw new CliError('remote_failed');
        return value;
      } catch (error) {
        throw error instanceof CliError ? error : new CliError('remote_failed');
      }
    },
    async close() {
      provider.invalidateCredentials('all');
      await client.close();
    },
  };
}
