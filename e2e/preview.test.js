import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { startPreview } from '../src/preview.js';
import { messages } from '../src/messages.js';

for (const locale of ['en', 'pt_BR'])
  for (const mobile of [false, true])
    test(
      `preview browser bridge, reload and access failure ${locale} ${mobile ? 'mobile' : 'desktop'}`,
      { timeout: 30_000 },
      async (t) => {
        const directory = await mkdtemp(join(tmpdir(), 'pubvero-browser-'));
        const file = join(directory, 'page.html');
        const text = messages[locale];
        const content =
          locale === 'en'
            ? {
                title: 'Release checklist',
                note: 'Illustrative test page · not customer data',
                item: 'Review deployment',
                ready: 'Ready',
                state: 'Status',
              }
            : {
                title: 'Checklist de publicação',
                note: 'Página ilustrativa de teste · não são dados de clientes',
                item: 'Revisar implantação',
                ready: 'Pronto',
                state: 'Status',
              };
        const html = `<!doctype html><html lang="${locale === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${content.title}</title><style>body{font:16px/1.6 system-ui;margin:0;padding:clamp(24px,5vw,64px);color:#20251f;background:#fffefa}h1{font-size:clamp(28px,3vw,40px);font-weight:550;margin:0 0 8px}p{color:#626659;margin:0 0 32px}table{border-collapse:collapse;width:100%;max-width:960px;text-align:left}th,td{padding:16px 0;border-bottom:1px solid #d7dbd0}th{font-weight:500}#result{color:#315f43;font-weight:600}</style></head><body><h1>${content.title}</h1><p>${content.note}</p><table><tr><th>${content.item}</th><th>${content.state}</th></tr><tr><td>page.query('totals')</td><td id="result">…</td></tr></table><script>page.query('totals').then(data=>document.querySelector('#result').textContent=data.rows[0].status);page.viewer().then(data=>document.body.dataset.locale=data.locale);</script></body></html>`;
        await writeFile(file, html);
        let denied = false;
        let queries = 0;
        const server = await startPreview({
          file,
          pageId: 7,
          server: 'https://pubvero.example/mcp',
          locale,
          session: {
            async call(name, args) {
              if (denied) throw new Error('do-not-print-secret');
              if (name === 'get-page-runtime')
                return {
                  page: {
                    id: 7,
                    version_id: 42,
                    version_number: 3,
                    title: content.title,
                  },
                  bindings: [{ name: 'totals' }],
                  viewer: { locale },
                };
              assert.equal(args.version_id, 42);
              queries++;
              return { rows: [{ status: content.ready }] };
            },
          },
        });
        const browser = await chromium.launch();
        t.after(async () => {
          await browser.close();
          await server.close();
          await rm(directory, { recursive: true, force: true });
        });
        const page = await browser.newPage({
          viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 900 },
          colorScheme: mobile ? 'dark' : 'light',
        });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(server.url);
        await page
          .frameLocator('iframe')
          .locator('#result')
          .filter({ hasText: content.ready })
          .waitFor();
        const frame = page
          .frames()
          .find((frame) => frame.url().includes('/frame/'));
        await frame.waitForFunction(
          (locale) => document.body.dataset.locale === locale,
          locale,
        );
        assert.equal(
          await frame.evaluate(() => {
            try {
              return parent.document.title;
            } catch {
              return 'isolated';
            }
          }),
          'isolated',
        );
        assert.equal(
          await frame.evaluate(async () => {
            try {
              await fetch('https://example.invalid');
              return 'allowed';
            } catch {
              return 'blocked';
            }
          }),
          'blocked',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        const bounds = await page.locator('iframe').boundingBox();
        assert.equal(bounds.width, mobile ? 390 : 1440);
        assert.ok(bounds.height >= (mobile ? 600 : 750));
        await mkdir('.impeccable/review', { recursive: true });
        await page.screenshot({
          path: `.impeccable/review/${mobile ? 'mobile' : 'desktop'}-${locale}.png`,
          fullPage: true,
        });
        await writeFile(
          file,
          html
            .replace(content.title, content.title + ' — updated')
            .replace('<h1>', '<h1 id="updated">'),
        );
        await page.getByRole('button', { name: text.preview_reload }).click();
        await page.frameLocator('iframe').locator('#updated').waitFor();
        await page
          .frameLocator('iframe')
          .locator('#result')
          .filter({ hasText: content.ready })
          .waitFor();
        assert.equal(queries, 2);
        denied = true;
        await page.getByRole('button', { name: text.preview_reload }).click();
        await page
          .locator('#notice')
          .filter({ hasText: text.preview_retry })
          .waitFor();
        assert.equal(await page.locator('iframe').isVisible(), false);
        assert.doesNotMatch(
          await page.locator('body').innerText(),
          /do-not-print-secret/,
        );
        await page.screenshot({
          path: `.impeccable/review/error-${mobile ? 'mobile' : 'desktop'}-${locale}.png`,
          fullPage: true,
        });
        await page.route('**/prepare', (route) => route.abort('failed'));
        await page.getByRole('button', { name: text.preview_reload }).click();
        await page.locator('#notice').waitFor({ state: 'visible' });
        assert.equal(
          await page.locator('#notice').innerText(),
          text.preview_query_failed + ' ' + text.preview_retry,
        );
        await page.screenshot({
          path: `.impeccable/review/network-${mobile ? 'mobile' : 'desktop'}-${locale}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
      },
    );
