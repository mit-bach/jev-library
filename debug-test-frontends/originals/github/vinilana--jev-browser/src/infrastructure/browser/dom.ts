import type { ElementHandle, Page } from 'playwright';
import type { BrowserElement, ExecutableAction, Observation } from '../../domain/types.js';

const MAX_ELEMENTS = 60;
const MAX_PAGE_TEXT_LENGTH = 12_000;
const ACTION_SETTLE_MS = 250;
const EXPLICIT_WAIT_MS = 1_000;

export async function observe(page: Page) {
  const handles = await page
    .locator(
      'a[href], button, input, textarea, select, [role="button"], [role="link"], [contenteditable="true"]',
    )
    .elementHandles();
  const targets = new Map<number, ElementHandle<Node>>();
  const elements: Observation['elements'] = [];
  let truncated = false;
  try {
    for (const handle of handles) {
      const info = (await handle
        .evaluate((node) => {
          const el = node as Element;
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const input = el as HTMLInputElement;
          if (
            !rect.width ||
            !rect.height ||
            rect.bottom <= 0 ||
            rect.top >= innerHeight ||
            rect.right <= 0 ||
            rect.left >= innerWidth ||
            style.visibility === 'hidden' ||
            style.display === 'none' ||
            input.disabled ||
            el.getAttribute('aria-disabled') === 'true' ||
            input.type === 'hidden' ||
            input.type === 'file'
          )
            return null;
          const labelledBy = (el.getAttribute('aria-labelledby') ?? '')
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? '')
            .join(' ')
            .trim();
          const label =
            el.getAttribute('aria-label') ||
            labelledBy ||
            [...(input.labels ?? [])].map((l) => l.textContent).join(' ') ||
            (el as HTMLElement).innerText ||
            input.placeholder ||
            input.name ||
            el.getAttribute('title') ||
            el.tagName;
          const editable =
            el.tagName === 'TEXTAREA' ||
            el.getAttribute('contenteditable') === 'true' ||
            (el.tagName === 'INPUT' &&
              [
                'text',
                'password',
                'search',
                'email',
                'tel',
                'url',
                'number',
                'date',
                'time',
                'datetime-local',
              ].includes(input.type));
          const type = (
            el.tagName === 'SELECT' ? 'select' : editable ? 'editable' : 'clickable'
          ) satisfies BrowserElement['type'];
          return {
            label: label.trim().slice(0, 240),
            type,
            value:
              editable && input.type === 'password'
                ? input.value
                  ? '[REDACTED]'
                  : ''
                : editable
                  ? (input.value ?? el.textContent ?? '').slice(0, 500)
                  : '',
            sensitive: input.type === 'password',
            options:
              el.tagName === 'SELECT'
                ? [...(el as HTMLSelectElement).options]
                    .filter((o) => !o.disabled)
                    .map((o) => ({ value: o.value, label: o.label }))
                : [],
          };
        })
        .catch(() => null)) as Omit<BrowserElement, 'id'> | null;
      if (info && elements.length < MAX_ELEMENTS) {
        const id = elements.length;
        elements.push({ id, ...info });
        targets.set(id, handle);
      } else {
        if (info) truncated = true;
        await handle.dispose();
      }
    }
    const observation: Observation = {
      url: page.url(),
      title: await page.title(),
      text: (await page.locator('body').innerText()).slice(0, MAX_PAGE_TEXT_LENGTH),
      scroll: await page.evaluate(() => ({
        y: scrollY,
        height: document.documentElement.scrollHeight,
        viewport: innerHeight,
      })),
      elements,
      truncated,
    };
    return { observation, targets };
  } catch (error) {
    await Promise.all(handles.map((handle) => handle.dispose().catch(() => {})));
    throw error;
  }
}

export async function execute(
  page: Page,
  action: ExecutableAction,
  targets: Map<number, ElementHandle<Node>>,
) {
  if ('target' in action) {
    const element = targets.get(action.target);
    if (!element) throw new Error('Elemento não existe nesta observação.');
    switch (action.kind) {
      case 'click':
        await element.click();
        break;
      case 'fill':
        await element.fill(action.value);
        break;
      case 'select':
        await element.selectOption(action.value);
        break;
      case 'enter':
        await element.press('Enter');
        break;
    }
  } else if (action.kind === 'scroll') {
    await page.evaluate(
      (direction) => window.scrollBy(0, direction * innerHeight * 0.8),
      action.direction === 'down' ? 1 : -1,
    );
  } else if (action.kind === 'back') await page.goBack({ waitUntil: 'domcontentloaded' });
  else if (action.kind === 'wait') await page.waitForTimeout(EXPLICIT_WAIT_MS);
  // A short settling window, followed by a fresh observation on every step.
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ACTION_SETTLE_MS);
}
