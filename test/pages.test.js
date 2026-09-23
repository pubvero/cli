import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { diagnoseHtml } from '../src/pages.js';

test('authoring diagnostics identify unsupported patterns without running scripts', () => {
  const findings = diagnoseHtml(
    '<script src="https://example.invalid/a.js"></script><script>window.page = {}; throw new Error("must not execute");</script>',
  );
  for (const code of [
    'document_structure',
    'document_language',
    'viewport',
    'external_resource',
    'runtime_override',
  ])
    assert.ok(findings.includes(code));
});

test(
  'check refuses named pipes without waiting for a writer',
  { skip: process.platform === 'win32' },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), 'pubvero-pipe-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const path = join(directory, 'page.html');
    assert.equal(spawnSync('mkfifo', [path]).status, 0);
    const binary = fileURLToPath(new URL('../bin/pubvero.js', import.meta.url));
    const result = spawnSync(
      process.execPath,
      [binary, 'check', path, '--json'],
      { timeout: 1500, encoding: 'utf8' },
    );
    assert.equal(result.error, undefined);
    assert.equal(JSON.parse(result.stdout).code, 'invalid_file');
  },
);
