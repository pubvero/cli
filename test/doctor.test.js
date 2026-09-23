import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doctor } from '../src/doctor.js';

const server = 'https://pubvero.example/mcp';
const metadata = {
  resource: server,
  authorization_servers: ['https://pubvero.example'],
};

test('doctor checks public discovery without credentials, redirects or mutations', async () => {
  let calls = 0;
  const result = await doctor(server, async (url, options) => {
    calls++;
    assert.equal(
      String(url),
      'https://pubvero.example/.well-known/oauth-protected-resource/mcp',
    );
    assert.equal(options.redirect, 'error');
    assert.equal(options.method, 'GET');
    assert.equal(options.credentials, 'omit');
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(options.headers, { Accept: 'application/json' });
    return Response.json(metadata);
  });
  assert.equal(calls, 1);
  assert.equal(result.code, 'discovery_ok');
});

test('doctor rejects errors and untrusted or mismatched metadata', async () => {
  for (const body of [
    {},
    { ...metadata, resource: 'https://other.example/mcp' },
    { ...metadata, authorization_servers: [] },
    { ...metadata, authorization_servers: ['http://pubvero.example'] },
    {
      ...metadata,
      authorization_servers: ['https://user:secret@pubvero.example'],
    },
  ]) {
    await assert.rejects(
      doctor(server, async () => Response.json(body)),
      { message: 'invalid_metadata' },
    );
  }
  await assert.rejects(
    doctor(server, async () => new Response('secret', { status: 500 })),
    { message: 'discovery_failed' },
  );
  await assert.rejects(
    doctor(server, async () => {
      throw new Error('private-response');
    }),
    { message: 'discovery_failed' },
  );
  await assert.rejects(
    doctor(
      server,
      async () =>
        new Response('x'.repeat(65_537), {
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
    { message: 'invalid_metadata' },
  );
  await assert.rejects(
    doctor(server, async () => new Response('<html>secret</html>')),
    { message: 'invalid_metadata' },
  );
});
