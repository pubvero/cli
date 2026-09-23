import { open, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { CliError } from './errors.js';

const MAX_PAGE_BYTES = 2 * 1024 * 1024;

/** @param {string} path @param {string} locale @param {Record<string, string>} text */
export async function initializePage(path, locale, text) {
  const html = `<!doctype html>
<html lang="${locale === 'pt_BR' ? 'pt-BR' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${text.starter_title}</title>
</head>
<body>
  <main>
    <h1>${text.starter_title}</h1>
    <p>${text.starter_body}</p>
  </main>
</body>
</html>
`;
  try {
    await writeFile(path, html, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    throw new CliError(
      error instanceof Error && 'code' in error && error.code === 'EEXIST'
        ? 'file_exists'
        : 'file_unwritable',
    );
  }
}

/** @param {string} path */
export async function checkPage(path) {
  return diagnoseHtml(await readPage(path));
}

/** @param {string} path */
export async function readPage(path) {
  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > MAX_PAGE_BYTES)
      throw new CliError('invalid_file');
    const buffer = Buffer.alloc(MAX_PAGE_BYTES + 1);
    let total = 0;
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        total,
        buffer.length - total,
        null,
      );
      if (!bytesRead) break;
      total += bytesRead;
    }
    if (total > MAX_PAGE_BYTES) throw new CliError('invalid_file');
    return buffer.subarray(0, total).toString('utf8');
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError('file_unreadable');
  } finally {
    await handle?.close();
  }
}

/** Heuristics only: never execute or claim to sanitize authored HTML.
 * @param {string} html
 */
export function diagnoseHtml(html) {
  const findings = [];
  if (
    !/<!doctype\s+html\s*>/i.test(html) ||
    !['html', 'head', 'title', 'body'].every((tag) =>
      new RegExp(`<${tag}(?:\\s|>)`, 'i').test(html),
    )
  )
    findings.push('document_structure');
  if (!/<html\b[^>]*\blang\s*=\s*["'][\w-]+["']/i.test(html))
    findings.push('document_language');
  if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html))
    findings.push('viewport');
  if (
    /<(?:script|link|img|iframe)\b[^>]*(?:src|href)\s*=\s*["']?\s*(?:https?:)?\/\//i.test(
      html,
    ) ||
    /@import\b/i.test(html)
  )
    findings.push('external_resource');
  if (
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(
      html,
    )
  )
    findings.push('direct_network');
  if (/\bwindow\s*\.\s*page\s*=/.test(html)) findings.push('runtime_override');
  return findings;
}
