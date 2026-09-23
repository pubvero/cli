import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startPreview } from '../src/preview.js';
import { messages } from '../src/messages.js';

async function preview(t, locale = 'en') {
  const directory = await mkdtemp(join(tmpdir(), 'pubvero-preview-'));
  const file = join(directory, 'page.html');
  await writeFile(
    file,
    '<!doctype html><html><head><title>Local</title></head><body>Local file</body></html>',
  );
  const calls = [];
  let denied = false;
  const server = await startPreview({
    file,
    pageId: 7,
    server: 'https://pubvero.example/mcp',
    locale,
    session: {
      call: async (name, args) => {
        calls.push({ name, args });
        if (denied) throw new Error('private-database-password');
        if (name === 'get-page-runtime')
          return {
            page: {
              id: 7,
              version_id: 42,
              version_number: 3,
              title: '<script>private-title</script>',
            },
            bindings: [{ name: 'totals' }],
            viewer: { locale },
          };
        return { columns: ['total'], rows: [{ total: 12 }], truncated: false };
      },
    },
  });
  t.after(async () => {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  });
  const post = (path, body, headers = {}) =>
    fetch(server.url + path, {
      method: 'POST',
      headers: {
        Origin: new URL(server.url).origin,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  return {
    server,
    post,
    file,
    calls,
    deny: () => {
      denied = true;
    },
  };
}

for (const locale of ['en', 'pt_BR'])
  test(`preview isolates HTML, executes pinned bindings and reloads the file (${locale})`, async (t) => {
    const { server, post, file, calls } = await preview(t, locale);
    const shell = await fetch(server.url);
    assert.equal(shell.status, 200);
    assert.equal(shell.headers.get('cache-control'), 'no-store');
    assert.match(
      shell.headers.get('content-security-policy'),
      /frame-ancestors 'none'/,
    );
    const html = await shell.text();
    assert.match(html, /sandbox="allow-scripts"/);
    assert.doesNotMatch(html, /allow-same-origin|private-title|access_token/);
    const context = await (await post('prepare', {})).json();
    const frame = await fetch(server.url + 'frame/' + context.snapshot);
    assert.match(
      frame.headers.get('content-security-policy'),
      /connect-src 'none'/,
    );
    assert.match(
      frame.headers.get('content-security-policy'),
      /sandbox allow-scripts/,
    );
    assert.match(await frame.text(), /Local file/);
    const query = await post('query', {
      snapshot: context.snapshot,
      name: 'totals',
      parameters: {},
    });
    assert.deepEqual((await query.json()).rows, [{ total: 12 }]);
    assert.deepEqual(calls.at(-1), {
      name: 'execute-page-binding',
      args: { page_id: 7, version_id: 42, name: 'totals', parameters: {} },
    });
    await writeFile(file, '<h1>Edited locally</h1>');
    const next = await (await post('prepare', {})).json();
    assert.notEqual(next.snapshot, context.snapshot);
    assert.match(
      await (await fetch(server.url + 'frame/' + next.snapshot)).text(),
      /Edited locally/,
    );
  });

test('preview denies cross-origin requests, unexpected bindings and oversized bodies before contacting MCP', async (t) => {
  const { server, post, calls } = await preview(t);
  const context = await (await post('prepare', {})).json();
  for (const origin of ['https://attacker.invalid', 'null', ''])
    assert.equal((await post('query', {}, { Origin: origin })).status, 403);
  assert.equal((await fetch(server.url + 'query')).status, 405);
  assert.equal(
    (await post('query', {}, { 'Content-Type': 'text/plain' })).status,
    415,
  );
  assert.equal(
    (
      await post('query', {
        snapshot: context.snapshot,
        name: 'unknown',
        parameters: {},
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await post('query', {
        snapshot: context.snapshot,
        name: 'totals',
        parameters: [],
      })
    ).status,
    400,
  );
  assert.equal(
    (await post('query', { padding: 'a'.repeat(65537) })).status,
    413,
  );
  assert.equal(calls.length, 1);
});

test('revoked access fails explicitly without cached results or leaked remote errors', async (t) => {
  const { post, deny } = await preview(t);
  const context = await (await post('prepare', {})).json();
  deny();
  for (const [path, body] of [
    ['prepare', {}],
    ['query', { snapshot: context.snapshot, name: 'totals', parameters: {} }],
  ]) {
    const result = await post(path, body);
    assert.equal(result.status, 502);
    const error = await result.json();
    assert.equal(error.code, 'remote_failed');
    assert.equal(error.message, messages.en.preview_query_failed);
  }
});
