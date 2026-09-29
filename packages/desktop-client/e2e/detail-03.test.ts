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
  };
}

async function registerRowCount(page: Page) {
  const table = page.getByTestId('transaction-table');
  await expect(table.getByTestId('row').first()).toBeVisible();
  return table.getByTestId('row').count();
}

test.describe('DETAIL-03 category details actions', () => {
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

  test('the month stepper moves the panel only, then follows the budget', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const details = panel(page);
    const month = details.getByTestId('category-details-month');
    const budgetMonth = await budgetPage.getSelectedMonth();
    const shown = await month.textContent();

    await details
      .getByRole('button', { name: 'Details: month before' })
      .click();
    await expect(month).not.toHaveText(shown ?? '');
    const previous = await month.textContent();
    // The Budget page stays on its month.
    expect(await budgetPage.getSelectedMonth()).toBe(budgetMonth);
    await expect(
      details.getByTestId('category-details-transactions'),
    ).toHaveAttribute('aria-busy', 'false');
    const panelInPrevious = await panelValues(page);

    await details.getByRole('button', { name: 'Details: month after' }).click();
    await expect(month).toHaveText(shown ?? '');

    // Moving the budget month resets the panel to follow it.
    await details
      .getByRole('button', { name: 'Details: month before' })
      .click();
    await expect(month).toHaveText(previous ?? '');
    await budgetPage.goToNextMonth();
    await expect(month).not.toHaveText(previous ?? '');
    await expect(month).not.toHaveText(shown ?? '');

    // The panel's previous month matches the table showing that month.
    await page
      .getByRole('button', { name: 'Previous month', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Previous month', exact: true })
      .click();
    await expect(month).toHaveText(previous ?? '');
    await expect
      .poll(async () => rowValues(budgetPage, 1))
      .toEqual(panelInPrevious);
  });

  test('the stepper works from the keyboard', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const details = panel(page);
    const month = details.getByTestId('category-details-month');
    const shown = await month.textContent();

    await details
      .getByRole('button', { name: 'Details: month before' })
      .focus();
    await page.keyboard.press('Enter');
    await expect(month).not.toHaveText(shown ?? '');
    await page.keyboard.press('Tab');
    await expect(
      details.getByRole('button', { name: 'Details: month after' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(month).toHaveText(shown ?? '');
  });

  test('"View in Accounts" opens the same view as Activity, and back returns', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    const activityPage = await budgetPage.clickOnSpentAmountForRow(1);
    await expect(activityPage.transactionTableRow.first()).toBeVisible();
    const activityRows = await registerRowCount(page);
    await page.goBack();

    await opener(page, name).click();
    await panel(page).getByRole('button', { name: 'View in Accounts' }).click();
    await expect(page).toHaveURL(/\/accounts$/);
    expect(await registerRowCount(page)).toBe(activityRows);

    await page.goBack();
    await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText(
      name,
    );
  });

  test('"View in Accounts" uses the panel month', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    // The row's Activity view for this month is the reference.
    const activityPage = await budgetPage.clickOnSpentAmountForRow(1);
    await expect(activityPage.transactionTableRow.first()).toBeVisible();
    const activityRows = await registerRowCount(page);
    await page.goBack();

    // Move the budget on a month, where the demo budget has no
    // transactions and so no link.
    await budgetPage.goToNextMonth();
    await opener(page, name).click();
    const details = panel(page);
    await expect(
      details.getByTestId('category-details-transactions'),
    ).toHaveText('No transactions this month.');
    await expect(
      details.getByRole('button', { name: 'View in Accounts' }),
    ).toHaveCount(0);

    // Step the panel back: the link opens that month, not the budget's.
    const month = details.getByTestId('category-details-month');
    const budgetMonthText = await month.textContent();
    await details
      .getByRole('button', { name: 'Details: month before' })
      .click();
    await expect(month).not.toHaveText(budgetMonthText ?? '');
    const steppedText = await month.textContent();
    await details.getByRole('button', { name: 'View in Accounts' }).click();
    await expect(page).toHaveURL(/\/accounts$/);
    expect(await registerRowCount(page)).toBe(activityRows);

    // Back returns to the same category and stepped month.
    await page.goBack();
    await expect(details.getByRole('heading', { level: 2 })).toHaveText(name);
    await expect(month).toHaveText(steppedText ?? '');
  });

  test('notes edited in the panel save like the row, on close', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const details = panel(page);
    const notes = details.getByTestId('category-details-notes');
    await expect(notes).toHaveText('No notes.');

    await details.getByRole('button', { name: 'View notes' }).click();
    await page.locator('textarea').fill('Weekly food shop');
    await page.keyboard.press('Escape');

    await expect(notes).toHaveText('Weekly food shop');
    // Escape closed the editor, not the panel.
    await expect(details).toBeVisible();

    // The row's notes button shows the same saved note.
    const row = budgetPage.budgetTable.getByTestId('row').nth(1);
    await row.hover();
    await row.getByRole('button', { name: 'View notes' }).first().click();
    await expect(page.locator('textarea')).toHaveValue('Weekly food shop');
    await page.keyboard.press('Escape');
  });

  test('clicking away from the editor saves the note to its own category', async () => {
    const first = await budgetPage.getCategoryNameForRow(1);
    const second = await budgetPage.getCategoryNameForRow(2);
    await opener(page, first).click();
    const details = panel(page);

    await details.getByRole('button', { name: 'View notes' }).click();
    await page.locator('textarea').fill('Only for the first');
    // As in the row, the open editor takes the first click outside it:
    // that click closes and saves it, and the panel keeps its category.
    await page.mouse.click(10, 450);
    await expect(page.locator('textarea')).toHaveCount(0);
    await expect(details.getByRole('heading', { level: 2 })).toHaveText(first);
    await expect(details.getByTestId('category-details-notes')).toHaveText(
      'Only for the first',
    );

    await opener(page, second).click();
    await expect(details.getByRole('heading', { level: 2 })).toHaveText(second);
    await expect(details.getByTestId('category-details-notes')).toHaveText(
      'No notes.',
    );

    await opener(page, first).click();
    await expect(details.getByTestId('category-details-notes')).toHaveText(
      'Only for the first',
    );
  });
});
