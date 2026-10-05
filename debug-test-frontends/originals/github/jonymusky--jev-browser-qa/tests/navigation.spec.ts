import { test } from '@playwright/test';
import { expectPage, pick, runGoal } from '../src/jev/index.js';
import { login } from './helpers.js';

test.describe('Jev-driven navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('pick(): opens the job positions section through a self-healing locator', async ({ page }) => {
    const target = await pick(page, 'the navigation entry that opens the list of job positions (vacantes / posiciones)');
    await target.locator.click();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await expectPage(page, 'A list or board of job positions is displayed, or an empty state inviting to create the first position.');
  });

  test('runGoal(): reaches the settings area with Jev choosing each click', async ({ page }) => {
    const outcome = await runGoal(page, {
      goal: 'Open the account or workspace settings screen. Do not change any setting.',
      maxSteps: 8,
      policy: {
        denyNames: [/cerrar sesi/i, /logout|sign out/i, /eliminar|delete|borrar/i, /guardar|save/i],
      },
    });
    test.expect(outcome.status, JSON.stringify(outcome.steps, null, 2)).toBe('done');
    await expectPage(page, 'A settings or configuration screen is displayed.');
  });
});
