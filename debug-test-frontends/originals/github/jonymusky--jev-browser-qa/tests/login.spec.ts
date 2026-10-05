import { test } from '@playwright/test';
import { expectPage, judge } from '../src/jev/index.js';
import { login } from './helpers.js';

test.describe('Authentication', () => {
  test('login lands the user in the authenticated workspace', async ({ page }) => {
    await page.goto('/auth/login');
    await expectPage(page, 'This is a login page asking for an email address.');

    await login(page);

    await expectPage(page, 'The user is signed in and sees the main application navigation, not a login form.', {
      criteria: {
        true: 'A sidebar or navigation with product sections is visible and there is no email or password form.',
        false: 'A login form, an authentication error, or a blank loading shell is shown.',
      },
    });
  });

  test('a wrong password shows a specific error and keeps the form', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#email').fill(process.env.QA_EMAIL ?? '');
    await page.locator('#email').press('Enter');
    const password = page.locator('#password');
    await password.waitFor({ state: 'visible' });
    await password.fill('definitely-wrong-password');
    await password.press('Enter');
    await page.waitForTimeout(2_000);

    const stillOnLogin = await judge(page, 'The login form is still displayed and an error explains the credentials were rejected.');
    test.expect(stillOnLogin.passed, `p=${stillOnLogin.probability.toFixed(2)}`).toBe(true);
  });
});
