import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { connect } from '../src/session.js';

test('official SDK completes discovery, dynamic registration, PKCE and a real MCP tool exchange', async () => {
  let authorization;
  let tokenExchanged = false;
  const request = async (input, options) => {
    const url = String(input);
    const headers = new Headers(options?.headers);
    if (url.includes('oauth-protected-resource'))
      return Response.json({
        resource: 'https://pubvero.example/mcp',
        authorization_servers: ['https://pubvero.example'],
        scopes_supported: ['mcp:use'],
      });
    if (url.includes('oauth-authorization-server'))
      return Response.json({
        issuer: 'https://pubvero.example',
        authorization_endpoint: 'https://pubvero.example/oauth/authorize',
        token_endpoint: 'https://pubvero.example/oauth/token',
        registration_endpoint: 'https://pubvero.example/oauth/register',
        response_types_supported: ['code'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none'],
      });
    if (url.endsWith('/oauth/register')) {
      const body = JSON.parse(options.body);
      return Response.json(
        { ...body, client_id: 'test-client' },
        { status: 201 },
      );
    }
    if (url.endsWith('/oauth/token')) {
      const body = new URLSearchParams(options.body);
      assert.equal(body.get('code'), 'test-code');
      assert.equal(
        createHash('sha256')
          .update(body.get('code_verifier'))
          .digest('base64url'),
        authorization.searchParams.get('code_challenge'),
      );
      tokenExchanged = true;
      return Response.json({
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'mcp:use',
      });
    }
    assert.equal(url, 'https://pubvero.example/mcp');
    if (headers.get('authorization') !== 'Bearer test-access-token')
      return new Response(null, {
        status: 401,
        headers: {
          'WWW-Authenticate':
            'Bearer resource_metadata="https://pubvero.example/.well-known/oauth-protected-resource/mcp"',
        },
      });
    if (options.method !== 'POST') return new Response(null, { status: 405 });
    const body = JSON.parse(options.body);
    if (!body.id) return new Response(null, { status: 202 });
    const result =
      body.method === 'initialize'
        ? {
            protocolVersion: '2025-11-25',
            capabilities: { tools: {} },
            serverInfo: { name: 'Pubvero', version: 'test' },
          }
        : {
            content: [
              { type: 'text', text: JSON.stringify({ workspaces: [] }) },
            ],
          };
    return Response.json({ jsonrpc: '2.0', id: body.id, result });
  };
  const session = await connect('https://pubvero.example/mcp', {
    signal: new AbortController().signal,
    callbackMessage: 'Return to terminal.',
    request,
    onAuthorize(url) {
      authorization = url;
      const callback = new URL(url.searchParams.get('redirect_uri'));
      callback.searchParams.set('state', url.searchParams.get('state'));
      callback.searchParams.set('code', 'test-code');
      void fetch(callback);
    },
  });
  try {
    assert.equal(tokenExchanged, true);
    assert.deepEqual(await session.call('get-context', {}), { workspaces: [] });
  } finally {
    await session.close();
  }
});
