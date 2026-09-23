import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const binary = fileURLToPath(new URL('../bin/pubvero.js', import.meta.url));
const run = (args, cwd) =>
  spawnSync(process.execPath, [binary, ...args], { cwd, encoding: 'utf8' });
async function directory(t) {
  const path = await mkdtemp(join(tmpdir(), 'pubvero-test-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test('help and version work without network or configuration', () => {
  assert.equal(run(['--version']).stdout.trim(), '0.1.0');
  for (const locale of ['en', 'pt_BR']) {
    const result = run(['--help', '--locale', locale]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /doctor/);
    assert.equal(result.stderr, '');
  }
});

test('invalid options fail without printing untrusted arguments', () => {
  for (const args of [
    ['--token=private-value'],
    ['dev'],
    ['--locale', 'fr'],
    ['check'],
    ['skill', 'extra'],
  ]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /private-value|Error:| at /);
  }
});

for (const locale of ['en', 'pt_BR']) {
  test(`init creates a complete localized page and check accepts it (${locale})`, async (t) => {
    const cwd = await directory(t);
    assert.equal(run(['init', '--locale', locale], cwd).status, 0);
    const html = await readFile(join(cwd, 'page.html'), 'utf8');
    assert.match(
      html,
      new RegExp(`lang="${locale === 'en' ? 'en' : 'pt-BR'}"`),
    );
    assert.doesNotMatch(html, /fetch\(|window\.page\s*=|https?:/);
    assert.equal(
      run(['check', 'page.html', '--locale', locale], cwd).status,
      0,
    );
  });
}

test('init never overwrites existing files or symlink targets', async (t) => {
  const cwd = await directory(t);
  await writeFile(join(cwd, 'original.html'), 'keep');
  await symlink('original.html', join(cwd, 'page.html'));
  assert.equal(
    JSON.parse(run(['init', '--json'], cwd).stdout).code,
    'file_exists',
  );
  assert.equal(await readFile(join(cwd, 'original.html'), 'utf8'), 'keep');
  assert.equal(
    JSON.parse(run(['init', 'original.html', '--json'], cwd).stdout).code,
    'file_exists',
  );
});

test('check reports only diagnostic codes, not source contents', async (t) => {
  const cwd = await directory(t);
  await writeFile(
    join(cwd, 'page.html'),
    '<script>fetch("https://secret.invalid/private-value")</script>',
  );
  const result = run(['check', 'page.html', '--json'], cwd);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, false);
  assert.ok(report.findings.includes('direct_network'));
  assert.doesNotMatch(result.stdout + result.stderr, /private-value/);
});

test('check rejects missing files, directories and oversized inputs', async (t) => {
  const cwd = await directory(t);
  assert.equal(
    JSON.parse(run(['check', 'missing.html', '--json'], cwd).stdout).code,
    'file_unreadable',
  );
  assert.equal(
    JSON.parse(run(['check', '.', '--json'], cwd).stdout).code,
    'invalid_file',
  );
  await writeFile(join(cwd, 'large.html'), 'a'.repeat(2 * 1024 * 1024 + 1));
  assert.equal(
    JSON.parse(run(['check', 'large.html', '--json'], cwd).stdout).code,
    'invalid_file',
  );
});

test('skill returns a readable bundled entrypoint', async () => {
  const result = run(['skill']);
  assert.equal(result.status, 0);
  assert.match(
    await readFile(result.stdout.trim(), 'utf8'),
    /name: pubvero-authoring/,
  );
});

test('doctor rejects insecure, credential-bearing and ambiguous URLs before requests', () => {
  for (const server of [
    'http://example.com/mcp',
    'https://user:private-value@example.com/mcp',
    'https://example.com/mcp?token=private-value',
    'https://example.com/mcp#fragment',
    'https://example.com/other',
  ]) {
    const result = run(['doctor', '--server', server, '--json']);
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stdout).code, 'invalid_server');
    assert.doesNotMatch(result.stdout + result.stderr, /private-value/);
  }
});

test('connected commands are discoverable and reject invalid servers before authorization', () => {
  for (const locale of ['en', 'pt_BR']) {
    const help = run(['--help', '--locale', locale]);
    for (const command of ['login', 'context', 'push', 'publish', 'dev'])
      assert.match(help.stdout, new RegExp(`pubvero ${command}`));
    for (const args of [
      ['login'],
      ['context'],
      ['push', 'page.html', '--page', '1'],
      ['dev', 'page.html', '--page', '1'],
      ['publish', '--page', '1', '--revision', '2', '--yes'],
    ]) {
      const result = run([
        ...args,
        '--server',
        'http://example.invalid/mcp',
        '--locale',
        locale,
        '--json',
      ]);
      assert.equal(JSON.parse(result.stdout).code, 'invalid_server');
    }
  }
});

test('command-specific flags cannot be silently ignored', () => {
  for (const args of [
    ['init', '--yes'],
    ['check', 'page.html', '--page', '1'],
    ['context', '--page', '1', '--server', 'https://example.invalid/mcp'],
    ['login', '--revision', '2', '--server', 'https://example.invalid/mcp'],
    [
      'push',
      'page.html',
      '--page',
      '1',
      '--yes',
      '--server',
      'https://example.invalid/mcp',
    ],
  ])
    assert.equal(
      JSON.parse(run([...args, '--json']).stdout).code,
      'invalid_arguments',
    );
});
