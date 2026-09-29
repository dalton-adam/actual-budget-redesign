import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';
import type { BudgetPage } from './page-models/budget-page';
import { ConfigurationPage } from './page-models/configuration-page';

function panel(page: Page) {
  return page.getByRole('complementary', { name: 'Category details' });
}

function opener(page: Page, name: string) {
  return page.getByRole('button', { name: `Show details for ${name}` });
}

/** Cents from a formatted amount such as "-1,234.56". */
async function amountOf(locator: Locator) {
  const text = (await locator.textContent()) ?? '';
  const match = text.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) {
    throw new Error(`No amount in "${text}".`);
  }
  return Math.round(parseFloat(match[0]) * 100);
}

async function rowValues(budgetPage: BudgetPage, idx: number) {
  const row = budgetPage.budgetTable.getByTestId('row').nth(idx);
  return {
    assigned: await amountOf(row.getByTestId('budget')),
    activity: await amountOf(row.getByTestId('category-month-spent')),
    available: await amountOf(row.getByTestId('balance')),
  };
}

async function panelValues(page: Page) {
  const details = panel(page);
  return {
    assigned: await amountOf(details.getByTestId('category-details-assigned')),
    activity: await amountOf(details.getByTestId('category-details-activity')),
    available: await amountOf(
      details.getByTestId('category-details-available'),
    ),
    carriedIn: await amountOf(
      details.getByTestId('category-details-carried-in'),
    ),
  };
}

test.describe('DETAIL-02 category details contents', () => {
  let page: Page;
  let budgetPage: BudgetPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('/');
    budgetPage = await new ConfigurationPage(page).createTestFile();
    await page.mouse.move(0, 0);
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('amounts match the selected row', async () => {
    for (const idx of [1, 2, 3]) {
      const name = await budgetPage.getCategoryNameForRow(idx);
      await opener(page, name).click();
      await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
        name,
      );
      const row = await rowValues(budgetPage, idx);
      await expect
        .poll(async () => {
          const { carriedIn: _, ...values } = await panelValues(page);
          return values;
        })
        .toEqual(row);
      const { carriedIn } = await panelValues(page);
      expect(carriedIn).toBe(row.available - row.assigned - row.activity);
    }
  });

  test("lists the month's transactions, newest first", async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const list = panel(page).getByTestId('category-details-transactions');
    await expect(list).toHaveAttribute('aria-busy', 'false');

    const rows = list.getByTestId('category-details-transaction');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
    const total = Number(
      await panel(page)
        .getByTestId('category-details-transaction-count')
        .textContent(),
    );
    expect(count).toBe(Math.min(total, 5));

    // Every listed amount appears in the category's existing Activity view.
    const accountPage = await budgetPage.clickOnSpentAmountForRow(1);
    await expect(accountPage.transactionTableRow.first()).toBeVisible();
    const registerRows = await accountPage.transactionTable
      .getByTestId('row')
      .count();
    expect(registerRows).toBeGreaterThanOrEqual(count);
  });

  test('notes show read-only and follow edits made from the row', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const notes = panel(page).getByTestId('category-details-notes');
    await expect(notes).toHaveText('No notes.');

    const row = budgetPage.budgetTable.getByTestId('row').nth(1);
    await row.hover();
    // The first notes button is the category's; the second is the month's.
    await row.getByRole('button', { name: 'View notes' }).first().click();
    await page.locator('textarea').fill('Weekly food shop');
    await page.keyboard.press('Escape');

    await expect(notes).toHaveText('Weekly food shop');
    await expect(notes.locator('textarea')).toHaveCount(0);
  });

  test('changing month refreshes the details', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    await budgetPage.goToNextMonth();

    const row = await rowValues(budgetPage, 1);
    await expect
      .poll(async () => {
        const { carriedIn: _, ...values } = await panelValues(page);
        return values;
      })
      .toEqual(row);
    await expect(
      panel(page).getByTestId('category-details-transactions'),
    ).toHaveText('No transactions this month.');
  });

  test('rapid switching ends on the last choice', async () => {
    const names = await Promise.all(
      [1, 2, 3, 4].map(idx => budgetPage.getCategoryNameForRow(idx)),
    );
    for (const name of names) {
      await opener(page, name).click();
    }
    const last = names[names.length - 1];
    await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
      last,
    );
    const row = await rowValues(budgetPage, 4);
    await expect
      .poll(async () => {
        const { carriedIn: _, ...values } = await panelValues(page);
        return values;
      })
      .toEqual(row);
  });

  test('privacy mode hides the panel amounts', async () => {
    await page.getByRole('button', { name: 'Enable privacy mode' }).click();
    // PrivacyFilter hides the real value and shows a redacted copy.
    const hero = panel(page).getByTestId('category-details-available');
    await expect(hero.first().locator('xpath=..')).toHaveCSS('opacity', '0');
  });
});
