import type { Locator, Page } from '@playwright/test';

const CONTROL_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'summary',
].join(',');

export interface ControlCandidate {
  /** Stable handle for this snapshot: value of the data-jev-idx attribute. */
  idx: number;
  role: string;
  name: string;
  /** Extra hint when the accessible name alone is ambiguous. */
  hint?: string;
}

export interface PageSnapshot {
  url: string;
  title: string;
  /** Aria tree of the page body, truncated to keep the state inside Jev's window. */
  aria: string;
  /** Visible, non-empty text lines, deduplicated and truncated. */
  text: string;
  controls: ControlCandidate[];
}

const COLLECT_CONTROLS_SOURCE = `
    const isVisible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        rect.bottom > 0 &&
        rect.top < innerHeight * 3
      );
    };
    const accessibleName = (el) => {
      const labelled = el.getAttribute('aria-labelledby');
      if (labelled) {
        const text = labelled
          .split(/\\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ');
        if (text.trim()) return text;
      }
      return (
        el.getAttribute('aria-label') ||
        el.innerText ||
        el.getAttribute('title') ||
        el.value ||
        el.querySelector('img')?.getAttribute('alt') ||
        ''
      );
    };
    document.querySelectorAll('[data-jev-idx]').forEach((el) => el.removeAttribute('data-jev-idx'));
    const out = [];
    let idx = 0;
    for (const el of Array.from(document.querySelectorAll(selector))) {
      if (!isVisible(el)) continue;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
      const name = accessibleName(el).replace(/\\s+/g, ' ').trim().slice(0, 80);
      if (!name) continue;
      const role =
        el.getAttribute('role') ||
        (el.tagName === 'A' ? 'link' : el.tagName === 'BUTTON' ? 'button' : el.tagName.toLowerCase());
      el.setAttribute('data-jev-idx', String(idx));
      const href = el.getAttribute('href');
      const hint = href && !href.startsWith('javascript') ? \`href=\${href.slice(0, 60)}\` : undefined;
      out.push({ idx, role, name, ...(hint && { hint }) });
      idx += 1;
    }
    return out;
`;

const MAX_ARIA_CHARS = 14_000;
const MAX_TEXT_CHARS = 6_000;

/**
 * Captures what the model needs to judge the page: the aria tree, the visible
 * text and the clickable controls. Each control gets a data-jev-idx attribute so
 * an index chosen by Jev maps back to one element without generating selectors.
 */
export async function snapshotPage(page: Page): Promise<PageSnapshot> {
  await page.waitForLoadState('domcontentloaded');
  // Browser-side code is kept as a string on purpose: esbuild/tsx would
  // otherwise inject a `__name` helper into the serialized function, which does
  // not exist in the page ("ReferenceError: __name is not defined").
  const controls = (await page.evaluate(
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('selector', COLLECT_CONTROLS_SOURCE) as (selector: string) => ControlCandidate[],
    CONTROL_SELECTOR,
  )) as ControlCandidate[];

  const [aria, text] = await Promise.all([
    page.locator('body').ariaSnapshot().catch(() => ''),
    page.locator('body').innerText().catch(() => ''),
  ]);
  const uniqueLines = Array.from(
    new Set(
      text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  ).join('\n');

  return {
    url: page.url(),
    title: await page.title(),
    aria: aria.length > MAX_ARIA_CHARS ? `${aria.slice(0, MAX_ARIA_CHARS)}\n…(truncated)` : aria,
    text: uniqueLines.length > MAX_TEXT_CHARS ? `${uniqueLines.slice(0, MAX_TEXT_CHARS)}\n…(truncated)` : uniqueLines,
    controls,
  };
}

export function controlLocator(page: Page, idx: number): Locator {
  return page.locator(`[data-jev-idx="${idx}"]`).first();
}

/** The part of the snapshot that describes the page, without the control list. */
export function pageStateForJudgment(snapshot: PageSnapshot) {
  return { url: snapshot.url, title: snapshot.title, visibleText: snapshot.text, ariaTree: snapshot.aria };
}
