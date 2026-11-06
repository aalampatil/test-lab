import { test, expect } from '@playwright/test';
test('a learner can fail, fix, complete, and retain a lesson', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good to see you/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Start your first lesson' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your first passing test', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Simple editor', exact: true }).click();
  await page.getByRole('button', { name: 'Run test', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A failing test. A learning moment.' }),
  ).toBeVisible();
  await expect(page.locator('.assertion dd').last()).toHaveText('5');
  const editor = page.getByRole('textbox', { name: 'Test code editor' });
  await editor.fill(
    "import { it, expect } from 'vitest';\nimport { add } from './app';\nit('adds two numbers', () => { expect(add(2, 3)).toBe(5); });",
  );
  await page.getByRole('button', { name: 'Run test', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Challenge complete. Nicely tested!' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/playground-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await expect(page.locator('.stat-card').first().locator('.stat-value')).toContainText('1');
  await page.reload();
  await expect(page.locator('.stat-card').first().locator('.stat-value')).toContainText('1');
  await page.getByRole('button', { name: 'Fundamentals', exact: true }).click();
  await page
    .getByRole('button', { name: 'Actual behavior with expected behavior', exact: true })
    .click();
  await page.getByRole('button', { name: 'Check my answer' }).click();
  await expect(page.getByRole('status')).toContainText('Exactly!');
  await page.getByRole('button', { name: 'Tool explorer', exact: true }).click();
  await page.getByRole('button', { name: 'API testing', exact: true }).click();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await page.locator('.tool-card').click();
  await expect(page.getByRole('dialog')).toContainText('Postman');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.keyboard.press('Control+k');
  await page.getByPlaceholder('Search lessons, topics, and tools...').fill('discount');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /disappearing discount/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('mobile navigation and learning screens fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good to see you/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Bug hunting', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Every bug tells a story.' })).toBeVisible();
  await page.getByRole('button', { name: 'Investigate the bug' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'The disappearing discount', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/playground-mobile.png', fullPage: true });
});
test('Monaco loads from local assets and unrelated assertions do not complete a lesson', async ({
  page,
}) => {
  await page.goto('/?view=playground&lesson=first-test');
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/monaco-editor.png', fullPage: true });
  await page.getByRole('button', { name: 'Simple editor', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Test code editor' })
    .fill(
      "import { it, expect } from 'vitest';\nit('an unrelated truth', () => { expect(true).toBe(true); });",
    );
  await page.getByRole('button', { name: 'Run test', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Passing — now cover the objective.' }),
  ).toBeVisible();
  await expect(page.locator('.result-explanation')).toContainText('not fully covered');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('testlab-progress-v1')!).completed),
  ).toEqual([]);
});

test('project guide teaches real file paths and copies runnable TypeScript tests', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?view=playground&lesson=first-test');
  await page.getByRole('button', { name: 'Your project', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Use this in your own project.' })).toBeVisible();
  await expect(page.locator('.project-guide')).toContainText('tests/add.test.js');
  await page.getByRole('button', { name: 'TypeScript', exact: true }).click();
  await expect(page.locator('.project-guide')).toContainText('tests/add.test.ts');
  await expect(page.locator('.project-guide')).toContainText('add(a: number, b: number)');
  await expect(page.locator('.project-guide')).toContainText('npm test -- tests/add.test.ts');
  await page.getByRole('button', { name: 'Copy tests/add.test.ts', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "import { add } from '../src/utils/add'",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
