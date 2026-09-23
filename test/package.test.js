import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { messages, detectLocale } from '../src/messages.js';

test('translations have identical nonempty keys and environment locale resolution', () => {
  assert.deepEqual(
    Object.keys(messages.en).sort(),
    Object.keys(messages.pt_BR).sort(),
  );
  for (const entries of Object.values(messages)) {
    assert.ok(
      Object.values(entries).every(
        (value) => typeof value === 'string' && value.length > 0,
      ),
    );
  }
  assert.equal(detectLocale('pt_BR.UTF-8'), 'pt_BR');
  assert.equal(detectLocale('pt-BR'), 'pt_BR');
  assert.equal(detectLocale('fr_FR'), 'en');
});

test('tarball installs with its executable, complete documentation and skill but no development files', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'pubvero-package-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = fileURLToPath(new URL('..', import.meta.url));
  assert.ok(
    process.env.npm_execpath,
    'Run tests with npm test so the npm CLI path is available.',
  );
  const npm = (args, cwd) =>
    spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
      cwd,
      encoding: 'utf8',
      timeout: 60_000,
    });
  const pack = npm(
    ['pack', '--json', '--ignore-scripts', '--pack-destination', directory],
    root,
  );
  assert.equal(pack.status, 0, pack.stderr);
  const [manifest] = JSON.parse(pack.stdout);
  const paths = manifest.files.map((file) => file.path);
  for (const required of [
    'LICENSE',
    'README.md',
    'README.pt-BR.md',
    'SECURITY.md',
    'CONTRIBUTING.md',
    'docs/commands.md',
    'docs/commands.pt-BR.md',
    'skills/pubvero-authoring/references/runtime.md',
  ]) {
    assert.ok(paths.includes(required), `Missing packaged file: ${required}`);
  }
  assert.ok(
    paths.every(
      (path) =>
        !/^(?:test|node_modules|\.github)\/|\.env|forge_token|package-lock/.test(
          path,
        ),
    ),
  );
  const install = npm(
    [
      'install',
      '--prefix',
      directory,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      join(directory, manifest.filename),
    ],
    directory,
  );
  assert.equal(install.status, 0, install.stderr);
  const binary = join(
    directory,
    'node_modules',
    '@pubvero',
    'cli',
    'bin',
    'pubvero.js',
  );
  const execute = (args) =>
    spawnSync(process.execPath, [binary, ...args], {
      cwd: directory,
      encoding: 'utf8',
    });
  assert.equal(execute(['--version']).stdout.trim(), '0.1.0');
  assert.equal(execute(['init']).status, 0);
  assert.equal(execute(['check', 'page.html']).status, 0);
  assert.match(
    await readFile(execute(['skill']).stdout.trim(), 'utf8'),
    /name: pubvero-authoring/,
  );
});
