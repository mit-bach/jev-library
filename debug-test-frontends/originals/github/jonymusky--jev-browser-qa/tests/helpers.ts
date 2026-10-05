import type { Page } from '@playwright/test';

export const credentials = {
  email: process.env.QA_EMAIL ?? '',
  password: process.env.QA_PASSWORD ?? '',
};

/**
 * Deterministic login for the app under test. Typing is code's job, never Jev's:
 * the two-step form (email, then password) is driven by stable field ids.
 */
export async function login(page: Page) {
  if (!credentials.email || !credentials.password) throw new Error('QA_EMAIL / QA_PASSWORD are not set');
  await page.goto('/auth/login');
  await page.locator('#email').fill(credentials.email);
  await page.locator('#email').press('Enter');
  const password = page.locator('#password');
  await password.waitFor({ state: 'visible', timeout: 15_000 });
  await password.fill(credentials.password);
  await password.press('Enter');
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), { timeout: 30_000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}
