import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { connectedCommand, develop } from '../src/connected.js';

test('connected commands authenticate, preserve exact publication version and always close', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'pubvero-connected-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'page.html');
  await writeFile(file, '<h1>Real report</h1>');
  const calls = [];
  let closed = 0;
  const openSession = async () => ({
    call: async (name, args) => {
      calls.push({ name, args });
      return { version_id: 42 };
    },
    close: async () => {
      closed++;
    },
  });
  const options = {
    server: 'https://pubvero.example/mcp',
    page: '7',
    signal: new AbortController().signal,
    callbackMessage: '',
    onAuthorize() {},
    openSession,
  };
  assert.deepEqual(await connectedCommand('push', file, options), {
    version_id: 42,
  });
  assert.deepEqual(calls.pop(), {
    name: 'update-page',
    args: { page_id: 7, html: '<h1>Real report</h1>' },
  });
  await connectedCommand('publish', undefined, {
    ...options,
    revision: '42',
    yes: true,
  });
  assert.deepEqual(calls.pop(), {
    name: 'publish-page',
    args: { page_id: 7, version_id: 42 },
  });
  await connectedCommand('context', undefined, options);
  assert.deepEqual(calls.pop(), { name: 'get-context', args: {} });
  assert.equal(closed, 3);
});

test('invalid or unconfirmed writes never start authentication', async () => {
  const options = {
    server: 'https://pubvero.example/mcp',
    signal: new AbortController().signal,
    callbackMessage: '',
    onAuthorize() {},
    openSession: async () => assert.fail('must not connect'),
  };
  for (const args of [
    ['publish', undefined, { page: '1', revision: '2' }],
    ['publish', undefined, { page: '1', yes: true }],
    ['publish', undefined, { page: '-1', revision: '2', yes: true }],
    [
      'publish',
      undefined,
      { page: '1', revision: '9007199254740992', yes: true },
    ],
    ['push', 'missing.html', { page: '1' }],
  ])
    await assert.rejects(
      connectedCommand(args[0], args[1], { ...options, ...args[2] }),
    );
});

test('remote failures close the session without retrying a write', async () => {
  let closed = 0;
  let calls = 0;
  await assert.rejects(
    connectedCommand('publish', undefined, {
      server: 'https://pubvero.example/mcp',
      page: '1',
      revision: '2',
      yes: true,
      signal: new AbortController().signal,
      callbackMessage: '',
      onAuthorize() {},
      openSession: async () => ({
        call: async () => {
          calls++;
          throw new Error('remote failure');
        },
        close: async () => {
          closed++;
        },
      }),
    }),
  );
  assert.equal(calls, 1);
  assert.equal(closed, 1);
});

test('dev starts its own loopback preview and closes both servers on cancellation', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'pubvero-dev-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'page.html');
  await writeFile(file, '<h1>Preview</h1>');
  const controller = new AbortController();
  let closed = false;
  let previewUrl;
  await develop(file, {
    server: 'https://pubvero.example/mcp',
    page: '7',
    locale: 'en',
    signal: controller.signal,
    callbackMessage: '',
    onAuthorize() {},
    openSession: async () => ({
      call: async () => ({}),
      close: async () => {
        closed = true;
      },
    }),
    async onPreview(url) {
      previewUrl = url;
      assert.equal((await fetch(url)).status, 200);
      controller.abort();
    },
  });
  assert.equal(closed, true);
  await assert.rejects(fetch(previewUrl));
});
