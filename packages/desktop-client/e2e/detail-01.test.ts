import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import type { BudgetPage } from './page-models/budget-page';
import { ConfigurationPage } from './page-models/configuration-page';

const STORAGE_KEY = 'actual-budget-details-panel-open';

async function createDemo(page: Page) {
  await page.goto('/');
  const budgetPage = await new ConfigurationPage(page).createTestFile();
  await page.mouse.move(0, 0);
  return budgetPage;
}

function panel(page: Page) {
  return page.getByRole('complementary', { name: 'Category details' });
}

function opener(page: Page, name: string) {
  return page.getByRole('button', { name: `Show details for ${name}` });
}

test.describe('DETAIL-01 category details panel', () => {
  let page: Page;
  let budgetPage: BudgetPage;

  test.afterEach(async () => {
    await page?.close();
  });

  test.describe('beside the table', () => {
    test.beforeEach(async ({ browser }) => {
      page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      budgetPage = await createDemo(page);
    });

    test('is open by default and follows the chosen category', async () => {
      const first = await budgetPage.getCategoryNameForRow(1);
      await expect(panel(page)).toBeVisible();
      await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
        first,
      );

      const second = await budgetPage.getCategoryNameForRow(2);
      await opener(page, second).click();
      await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
        second,
      );
    });

    test('Enter on the name opens it and right-click keeps the menu', async () => {
      const name = await budgetPage.getCategoryNameForRow(2);
      await opener(page, name).focus();
      await page.keyboard.press('Enter');
      await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
        name,
      );

      // The row tools are reachable from the keyboard once the name has focus.
      await page.keyboard.press('Tab');
      await expect(
        budgetPage.budgetTable.getByTestId('row').nth(2).locator(':focus'),
      ).toBeVisible();

      await budgetPage.rightClickCategory(2);
      const menu = page.getByRole('menu');
      await expect(menu.getByRole('button', { name: 'Rename' })).toBeVisible();
      await expect(menu.getByRole('button', { name: 'Delete' })).toBeVisible();
      await page.keyboard.press('Escape');
    });

    test('close restores focus and scroll, and the choice is remembered', async () => {
      await budgetPage.scrollToBottom();
      const rows = budgetPage.budgetTable.getByTestId('row');
      const lastIndex = (await rows.count()) - 1;
      let index = lastIndex;
      // Pick the last expense row that has a details opener.
      while (
        index > 0 &&
        (await rows.nth(index).locator('[data-details-opener]').count()) === 0
      ) {
        index--;
      }
      const name = await budgetPage.getCategoryNameForRow(index);
      await opener(page, name).click();
      const scrollTop = await budgetPage.getScrollTop();
      expect(scrollTop).toBeGreaterThan(0);

      await panel(page).getByRole('button', { name: 'Close details' }).click();
      await expect(panel(page)).toBeHidden();
      await expect(opener(page, name)).toBeFocused();
      expect(await budgetPage.getScrollTop()).toBe(scrollTop);
      expect(
        await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY),
      ).toBe('false');

      await page.reload();
      await budgetPage.waitFor();
      await expect(panel(page)).toBeHidden();

      const toggle = page.getByRole('button', {
        name: 'Show category details',
      });
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await toggle.click();
      await expect(panel(page)).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Hide category details' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('Escape inside the panel closes it', async () => {
      const name = await budgetPage.getCategoryNameForRow(1);
      await panel(page).getByRole('button', { name: 'Close details' }).focus();
      await page.keyboard.press('Escape');
      await expect(panel(page)).toBeHidden();
      await expect(opener(page, name)).toBeFocused();
    });

    test('assigning an amount still works with the panel open', async () => {
      await expect(panel(page)).toBeVisible();
      const name = await budgetPage.getCategoryNameForRow(1);
      await budgetPage.setBudgetedAmount(name, '123.45');
      await expect(
        budgetPage.budgetTable.getByTestId('row').nth(1).getByTestId('budget'),
      ).toHaveText('123.45');
    });
  });

  test('is an overlay below 900px that does not change the stored choice', async ({
    browser,
  }) => {
    page = await browser.newPage({ viewport: { width: 820, height: 700 } });
    budgetPage = await createDemo(page);

    const dialog = page.getByRole('dialog', { name: 'Category details' });
    await expect(dialog).toBeHidden();
    await expect(panel(page)).toBeHidden();

    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(name);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener(page, name)).toBeFocused();
    expect(
      await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY),
    ).toBeNull();
  });
});
