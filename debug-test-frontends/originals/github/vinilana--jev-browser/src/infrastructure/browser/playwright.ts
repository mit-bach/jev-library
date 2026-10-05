import { chromium, type Browser, type Page } from 'playwright';
import type { BrowserPort, EventSink } from '../../domain/ports.js';
import { observe, execute } from './dom.js';
import { errorMessage } from '../../domain/errors.js';

/** Wrapping an existing page does not transfer ownership unless close is supplied. */
export function browserFromPage(
  page: Page,
  close: () => Promise<void> = async () => {},
): BrowserPort {
  return {
    url: () => page.url(),
    navigate: async (url) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    },
    observe: async () => {
      const { observation, targets } = await observe(page);
      return {
        observation,
        execute: (action) => execute(page, action, targets),
        release: async () => {
          await Promise.all(
            [...targets.values()].map((handle) => handle.dispose().catch(() => {})),
          );
        },
      };
    },
    screenshot: async (path) => {
      await page.screenshot({ path, timeout: 5000 });
    },
    stopTrace: (path) => page.context().tracing.stop({ path }),
    close,
  };
}

export async function openBrowser({
  headed = false,
  launch,
  event,
}: {
  headed?: boolean;
  launch?: () => Promise<Browser>;
  event: EventSink;
}): Promise<BrowserPort> {
  const browser = await (launch?.() ?? chromium.launch({ headless: !headed }));
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      acceptDownloads: false,
    });
    await context.tracing.start({ screenshots: true, snapshots: true });
    await context.addInitScript(() => {
      document.addEventListener(
        'click',
        (event) => {
          (event.target as Element | null)?.closest('a[target]')?.setAttribute('target', '_self');
        },
        true,
      );
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(30000);
    page.on('console', (message) => {
      void event('browser.console', { level: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => {
      void event('browser.error', { message: error.message });
    });
    page.on('requestfailed', (request) => {
      void event('browser.request_failed', { url: request.url(), failure: request.failure() });
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        void event('browser.http_error', { url: response.url(), status: response.status() });
    });
    page.on('dialog', (dialog) => {
      void dialog
        .dismiss()
        .catch((error) => event('browser.dialog_error', { error: errorMessage(error) }));
    });
    return browserFromPage(page, () => browser.close());
  } catch (error) {
    await browser.close().catch(() => {});
    throw error;
  }
}
