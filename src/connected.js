import { connect, serverUrl } from './session.js';
import { readPage } from './pages.js';
import { CliError } from './errors.js';
import { startPreview } from './preview.js';

/** @param {string | undefined} value */
export function identifier(value) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  )
    throw new CliError('invalid_arguments');
  return Number(value);
}

/** @param {string} command @param {string | undefined} file
 * @param {{server: string, page?: string, revision?: string, yes?: boolean, signal: AbortSignal, callbackMessage: string, onAuthorize: (url: URL) => void, openSession?: typeof connect}} options
 */
export async function connectedCommand(command, file, options) {
  serverUrl(options.server);
  let tool;
  /** @type {Record<string, unknown>} */
  let args = {};
  if ((command === 'login' || command === 'context') && !file)
    tool = 'get-context';
  else if (command === 'push' && file) {
    const page = identifier(options.page);
    args = { page_id: page, html: await readPage(file) };
    tool = 'update-page';
  } else if (command === 'publish' && !file && options.yes) {
    args = {
      page_id: identifier(options.page),
      version_id: identifier(options.revision),
    };
    tool = 'publish-page';
  } else throw new CliError('invalid_arguments');
  const session = await (options.openSession ?? connect)(
    options.server,
    options,
  );
  try {
    return await session.call(tool, args);
  } finally {
    await session.close();
  }
}

/** @param {string} file
 * @param {Parameters<typeof connectedCommand>[2] & {locale: string, onPreview: (url: string) => void | Promise<void>}} options
 */
export async function develop(file, options) {
  serverUrl(options.server);
  const pageId = identifier(options.page);
  await readPage(file);
  const session = await (options.openSession ?? connect)(
    options.server,
    options,
  );
  let preview;
  try {
    preview = await startPreview({
      file,
      pageId,
      server: options.server,
      locale: options.locale,
      session,
    });
    await options.onPreview(preview.url);
    if (!options.signal.aborted)
      await new Promise((resolve) =>
        options.signal.addEventListener('abort', () => resolve(undefined), {
          once: true,
        }),
      );
  } finally {
    await preview?.close();
    await session.close();
  }
}
