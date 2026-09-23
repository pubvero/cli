#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { messages, detectLocale } from '../src/messages.js';
import { CliError } from '../src/errors.js';
import { initializePage, checkPage } from '../src/pages.js';
import { doctor } from '../src/doctor.js';

let locale = detectLocale(
  process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG,
);
let json = process.argv.slice(2).includes('--json');

/** @param {string} code @param {boolean} ok @param {string[]} findings */
function report(code, ok, findings = []) {
  const message = messages[locale][code];
  if (json) {
    process.stdout.write(
      `${JSON.stringify({ ok, code, message, ...(findings.length ? { findings } : {}) })}\n`,
    );
  } else {
    const output = `${message}\n${findings.map((code) => `- ${code}: ${messages[locale][code]}\n`).join('')}`;
    (ok ? process.stdout : process.stderr).write(output);
  }
  process.exitCode = ok ? 0 : 1;
}

try {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        locale: { type: 'string' },
        json: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
        server: { type: 'string' },
      },
    });
  } catch {
    throw new CliError('invalid_arguments');
  }
  const { values, positionals } = parsed;
  if (values.locale !== undefined) {
    if (!['en', 'pt_BR'].includes(values.locale))
      throw new CliError('invalid_arguments');
    locale = values.locale;
  }
  json = values.json ?? false;
  const [command, file] = positionals;
  if (values.help || (!command && !values.version && !values.server)) {
    report('help', true);
  } else if (values.version && !command && !values.server) {
    const { version } = JSON.parse(
      await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    );
    process.stdout.write(
      json ? `${JSON.stringify({ version })}\n` : `${version}\n`,
    );
  } else if (
    values.version ||
    positionals.length > 2 ||
    (values.server && command !== 'doctor')
  ) {
    throw new CliError('invalid_arguments');
  } else if (command === 'init') {
    await initializePage(file ?? 'page.html', locale, messages[locale]);
    report('created', true);
  } else if (command === 'check' && file) {
    const findings = await checkPage(file);
    report(
      findings.length ? 'check_failed' : 'check_ok',
      findings.length === 0,
      findings,
    );
  } else if (command === 'doctor' && !file && values.server) {
    const result = await doctor(values.server);
    report(result.code, result.ok);
  } else if (command === 'skill' && !file) {
    const path = fileURLToPath(
      new URL('../skills/pubvero-authoring/SKILL.md', import.meta.url),
    );
    process.stdout.write(json ? `${JSON.stringify({ path })}\n` : `${path}\n`);
  } else {
    throw new CliError('invalid_arguments');
  }
} catch (error) {
  report(error instanceof CliError ? error.code : 'unexpected_error', false);
}
