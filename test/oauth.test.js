import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'node:http';
import {
  createAuthorizationCallback,
  MemoryOAuthProvider,
  pinnedFetch,
} from '../src/oauth.js';

test('callback rejects wrong state, method, path and Host before accepting one code', async (t) => {
  const callback = await createAuthorizationCallback(
    'Return to the terminal.',
    new AbortController().signal,
    5000,
  );
  t.after(() => callback.close());
  callback.expectState('expected-state');
  const target = new URL(callback.url);
  assert.equal(target.hostname, '127.0.0.1');
  assert.equal(
    (await fetch(callback.url + '?state=wrong&code=private-code')).status,
    403,
  );
  assert.equal((await fetch(callback.url, { method: 'POST' })).status, 405);
  assert.equal((await fetch(target.origin + '/wrong')).status, 404);
  const hostStatus = await new Promise((resolve, reject) => {
    get(
      callback.url + '?state=expected-state&code=private-code',
      { headers: { Host: 'attacker.invalid' } },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    ).on('error', reject);
  });
  assert.equal(hostStatus, 403);
  assert.equal(
    (await fetch(callback.url + '?state=expected-state&code=a&code=b')).status,
    400,
  );
  const response = await fetch(
    callback.url + '?state=expected-state&code=private-code',
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await response.text(), /private-code|expected-state/);
  assert.equal((await callback.result).get('code'), 'private-code');
});

test('callback rejects cancellation and expiry without reflecting remote errors', async () => {
  const controller = new AbortController();
  const callback = await createAuthorizationCallback(
    'Return.',
    controller.signal,
    5000,
  );
  const rejection = assert.rejects(callback.result, {
    code: 'oauth_cancelled',
  });
  controller.abort();
  await rejection;
  await callback.close();
  const expired = await createAuthorizationCallback(
    'Return.',
    new AbortController().signal,
    10,
  );
  await assert.rejects(expired.result, { code: 'oauth_timeout' });
  await expired.close();
});

test('provider keeps credentials issuer-scoped and clears tokens', async (t) => {
  const callback = await createAuthorizationCallback(
    'Return.',
    new AbortController().signal,
    5000,
  );
  t.after(() => callback.close());
  const provider = new MemoryOAuthProvider(
    new URL('https://pubvero.example/mcp'),
    callback,
    () => {},
  );
  provider.saveClientInformation(
    { client_id: 'a' },
    { issuer: 'https://a.example' },
  );
  assert.equal(
    provider.clientInformation({ issuer: 'https://b.example' }),
    undefined,
  );
  provider.saveTokens({ access_token: 'secret', token_type: 'Bearer' });
  assert.equal(provider.tokens().access_token, 'secret');
  provider.invalidateCredentials('tokens');
  assert.equal(provider.tokens(), undefined);
  await assert.rejects(
    provider.validateResourceURL(
      'https://pubvero.example/mcp',
      'https://other.example/mcp',
    ),
  );
});

test('network pin rejects cross-origin destinations and disallows redirects', async () => {
  let called = false;
  const request = pinnedFetch(
    new URL('https://pubvero.example/mcp'),
    new AbortController().signal,
    async (_url, options) => {
      called = true;
      assert.equal(options.redirect, 'error');
      return Response.json({});
    },
  );
  await assert.rejects(request('https://other.example/token'), {
    code: 'oauth_untrusted_origin',
  });
  assert.equal(called, false);
  await request('https://pubvero.example/oauth/token');
  assert.equal(called, true);
});
