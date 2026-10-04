import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import type { BudgetPage } from './page-models/budget-page';
import { ConfigurationPage } from './page-models/configuration-page';

async function getCell(page: Page, sheetName: string, name: string) {
  return page.evaluate(
    async ([sheet, cell]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $send = (window as any).$send as (
        type: string,
        args?: unknown,
      ) => Promise<{ value: number }>;
      return (await $send('get-cell', { sheetName: sheet, name: cell })).value;
    },
    [sheetName, name] as const,
  );
}

test.describe('BUD-01 month toolbar and summary cards', () => {
  let page: Page;
  let budgetPage: BudgetPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    await page.goto('/');
    budgetPage = await new ConfigurationPage(page).createTestFile();
    await page.mouse.move(0, 0);
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('cards show the existing totals for the focused month', async () => {
    const cards = page.getByTestId('month-summary-cards');
    const month = await budgetPage.getSelectedMonth();
    const sheetName = `budget${month.replace('-', '')}`;

    const totals = budgetPage.budgetTableTotals;
    await expect(
      cards.getByRole('group').filter({ hasText: 'Assigned' }),
    ).toContainText(
      (await totals.getByTestId(/total-budgeted$/).textContent()) ?? '',
    );
    await expect(
      cards.getByRole('group').filter({ hasText: 'Activity' }),
    ).toContainText(
      (await totals.getByTestId(/total-spent$/).textContent()) ?? '',
    );

    const toBudget = await getCell(page, sheetName, 'to-budget');
    await expect(budgetPage.readyToAssignCard).toHaveAttribute(
      'data-kind',
      toBudget > 0 ? 'positive' : toBudget < 0 ? 'negative' : 'zero',
    );

    const breakdown = await budgetPage.openReadyToAssignBreakdown();
    const cardAmount = await budgetPage.readyToAssignCard
      .getByTestId('ready-to-assign-amount')
      .textContent();
    await expect(
      breakdown.getByTestId('ready-to-assign-breakdown-total'),
    ).toHaveText(cardAmount ?? '');
    await expect(page.getByRole('menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(breakdown).toBeHidden();
  });

  test('money assigned next month comes out of this month (RTA-01)', async () => {
    const month = await budgetPage.getSelectedMonth();
    const amountText = budgetPage.readyToAssignCard.getByTestId(
      'ready-to-assign-amount',
    );
    const readAmount = async () =>
      Number(((await amountText.textContent()) ?? '').replace(/,/g, ''));
    const before = await readAmount();

    await page.evaluate(async currentMonth => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $send = (window as any).$send as (
        type: string,
        args?: unknown,
      ) => Promise<{
        value?: number | null;
        list?: Array<{ id: string; is_income: boolean; hidden: boolean }>;
      }>;
      const [year, monthNumber] = currentMonth.split('-').map(Number);
      const next =
        monthNumber === 12
          ? `${year + 1}-01`
          : `${year}-${String(monthNumber + 1).padStart(2, '0')}`;
      const { list = [] } = await $send('get-categories');
      const category = list.find(c => !c.is_income && !c.hidden);
      if (!category) {
        throw new Error('No expense category in the test budget');
      }
      const sheetName = `budget${next.replace('-', '')}`;
      const { value } = await $send('get-cell', {
        sheetName,
        name: `budget-${category.id}`,
      });
      await $send('budget/budget-amount', {
        month: next,
        category: category.id,
        amount: (value ?? 0) + 1000000,
      });
    }, month);

    // $10,000 is more than the test budget has, so it reaches this month.
    await expect.poll(readAmount).toBeLessThan(before);
    await expect(budgetPage.readyToAssignCard).toHaveAttribute(
      'data-kind',
      'negative',
    );
    const breakdown = await budgetPage.openReadyToAssignBreakdown();
    await expect(
      breakdown.getByTestId('ready-to-assign-needed-later'),
    ).toBeVisible();
    await expect(
      breakdown.getByTestId('ready-to-assign-breakdown-total'),
    ).toHaveText((await amountText.textContent()) ?? '');
    await page.keyboard.press('Escape');
  });

  test('month stepper and Today move the focused month', async () => {
    const heading = page.getByRole('heading', { level: 1 });
    const startMonth = await budgetPage.getSelectedMonth();
    const startTitle = await heading.textContent();
    await expect(page.getByRole('button', { name: 'Today' })).toBeHidden();

    await budgetPage.goToNextMonth();
    await expect(heading).not.toHaveText(startTitle ?? '');
    await expect(page.getByText('Budget · Future month')).toBeVisible();

    await page.getByRole('button', { name: 'Today' }).click();
    await expect(budgetPage.selectedMonthButton).toHaveAttribute(
      'data-month',
      startMonth,
    );
    await expect(heading).toHaveText(startTitle ?? '');

    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(page.getByText('Budget · Past month')).toBeVisible();
  });

  test('month picker jumps straight to another month', async () => {
    const startMonth = await budgetPage.getSelectedMonth();
    await budgetPage.selectedMonthButton.click();

    const picker = page.getByRole('dialog');
    const target = picker
      .getByRole('group')
      .locator('button:not([aria-current]):not([disabled])')
      .first();
    const targetLabel = await target.getAttribute('aria-label');
    await target.click();

    await expect(picker).toBeHidden();
    await expect(budgetPage.selectedMonthButton).not.toHaveAttribute(
      'data-month',
      startMonth,
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      targetLabel ?? '',
    );
  });

  test('the summary strip replaces the cards after scrolling on short windows', async () => {
    const cards = page.getByTestId('month-summary-cards');
    const strip = page.getByTestId('month-summary-strip');
    await expect(cards).toBeVisible();
    await expect(strip).toBeHidden();

    await budgetPage.budgetTableScrollContainer.evaluate(el => {
      el.scrollTop = 200;
      el.dispatchEvent(new Event('scroll'));
    });
    await expect(strip).toBeVisible();
    await expect(cards).toBeHidden();

    await budgetPage.budgetTableScrollContainer.evaluate(el => {
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });
    await expect(cards).toBeVisible();
    await expect(strip).toBeHidden();
  });
});
