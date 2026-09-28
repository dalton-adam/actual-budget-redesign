import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { BudgetPage } from './page-models/budget-page';
import { ConfigurationPage } from './page-models/configuration-page';

async function createDemo(page: Page) {
  await page.goto('/');
  return new ConfigurationPage(page).createTestFile();
}

test.describe('NAV-02 accounts pane', () => {
  test('uses the approved default at the 1280px boundary', async ({
    browser,
  }) => {
    const narrowPage = await browser.newPage({
      viewport: { width: 1279, height: 720 },
    });
    await createDemo(narrowPage);
    await expect(narrowPage.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await narrowPage.close();

    const widePage = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    await createDemo(widePage);
    await expect(widePage.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await widePage.close();
  });

  test('remembers the device-local pane choice after reload', async ({
    browser,
  }) => {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 700 },
    });
    await createDemo(page);

    await expect(page.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await page.getByRole('button', { name: 'Expand accounts' }).click();
    await expect(page.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'true',
    );

    await page.reload();
    await expect(page.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await page.close();
  });

  test('expands the rail to rename an account', async ({ browser }) => {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 700 },
    });
    await createDemo(page);

    await page
      .getByRole('link', { name: 'Bank of America' })
      .click({ button: 'right' });
    await page
      .getByRole('menu')
      .getByRole('button', { name: 'Rename' })
      .click();

    await expect(page.getByTestId('accounts-pane')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await expect(page.getByLabel('Account name')).toBeVisible();
    await page.getByLabel('Account name').press('Escape');
    await page.close();
  });

  test('treats All accounts as navigation without changing budget totals', async ({
    browser,
  }) => {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    const budgetPage = await createDemo(page);
    const totalsBefore = await budgetPage.getTableTotals();

    const pane = page.getByRole('complementary', { name: 'Accounts' });
    await pane.getByRole('link', { name: /^All accounts/ }).click();
    await page.getByRole('link', { name: 'Budget', exact: true }).click();

    const returnedBudgetPage = new BudgetPage(page);
    await returnedBudgetPage.waitFor({ state: 'visible' });
    expect(await returnedBudgetPage.getTableTotals()).toEqual(totalsBefore);
    await page.close();
  });
});
