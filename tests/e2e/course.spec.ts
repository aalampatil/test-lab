import { test, expect } from '@playwright/test';

test('curriculum exposes staged lessons and useful filters', async ({ page }) => {
  await page.goto('/?view=paths');
  await expect(
    page.getByRole('heading', { name: 'Your beginner-to-advanced study plan.' }),
  ).toBeVisible();
  await expect(page.locator('.curriculum-row')).toHaveCount(36);
  await page.getByRole('textbox', { name: 'Search curriculum' }).fill('timer');
  await expect(page.locator('.curriculum-row')).toHaveCount(1);
  await expect(page.locator('.curriculum-row')).toContainText('Control time without waiting');
  await page.getByRole('textbox', { name: 'Search curriculum' }).fill('');
  await page.getByRole('combobox', { name: 'Filter by difficulty' }).selectOption('Advanced');
  await expect(page.locator('.curriculum-row').first()).toContainText(
    'Protect the response contract',
  );
});

test('glossary and extended concept search are usable', async ({ page }) => {
  await page.goto('/?view=fundamentals');
  await page.getByRole('button', { name: 'Testing glossary', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search testing terminology' }).fill('Shrinking');
  await expect(page.locator('.glossary-grid article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Shrinking', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Concept lessons', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search concepts' }).fill('fixtures');
  await page.locator('.concept-nav button').click();
  await expect(
    page.getByRole('heading', { name: 'Fixtures and factories', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'It produces independent objects for each test', exact: true })
    .click();
  await page.getByRole('button', { name: 'Check my answer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Exactly!');
});

test('real-project practice is explicitly self-reported and preserves its draft', async ({
  page,
}) => {
  await page.goto('/?view=playground&lesson=async-success');
  await expect(
    page.getByRole('heading', { name: 'Wait for the real result', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.repository-mode-note')).toContainText('does not execute or verify');
  const record = page.getByRole('button', { name: 'Record my practice', exact: true });
  await expect(record).toBeDisabled();
  await page.getByRole('button', { name: 'Simple editor', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Project test draft' })
    .fill('// My saved async test draft');
  await page
    .getByRole('button', { name: 'To wait for the result before checking it', exact: true })
    .click();
  await page.getByRole('button', { name: 'Check understanding', exact: true }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await record.click();
  await expect(page.locator('.lab-heading')).toContainText('Completed · self-reported');
  await page.reload();
  await expect(page.locator('.lab-heading')).toContainText('Completed · self-reported');
  await page.getByRole('button', { name: 'Simple editor', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project test draft' })).toHaveValue(
    '// My saved async test draft',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/repository-lab-mobile.png', fullPage: true });
});
