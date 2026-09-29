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
function cents(text: string) {
  return Math.round(parseFloat(text.replace(/,/g, '')) * 100);
}

async function amountOf(locator: Locator) {
  const text = (await locator.textContent()) ?? '';
  const match = text.match(/-?[\d,]+\.\d+/);
  if (!match) {
    throw new Error(`No amount in "${text}".`);
  }
  return cents(match[0]);
}

async function panelValues(page: Page) {
  const details = panel(page);
  return {
    carriedIn: await amountOf(
      details.getByTestId('category-details-carried-in'),
    ),
    assigned: await amountOf(details.getByTestId('category-details-assigned')),
    activity: await amountOf(details.getByTestId('category-details-activity')),
    available: await amountOf(
      details.getByTestId('category-details-available').first(),
    ),
  };
}

function pace(page: Page) {
  return panel(page).getByTestId('category-details-pace');
}

function paceSummary(page: Page) {
  return panel(page).getByTestId('category-details-pace-summary');
}

/** Waits for the chart's text equivalent and returns it. */
async function paceLabel(page: Page) {
  await expect(pace(page)).toHaveAttribute('aria-busy', 'false');
  return (await pace(page).getAttribute('aria-label')) ?? '';
}

test.describe('DETAIL-04 pace chart and goal box', () => {
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

  test('the current month matches a hand calculation from the panel values', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const values = await panelValues(page);
    const label = await paceLabel(page);

    const match = label.match(
      /^Spent (-?[\d,.]+) of (-?[\d,.]+) by \w+ (\d+)\. (.+)\.$/,
    );
    expect(match, label).not.toBeNull();
    const [, spentText, startText, uptoText, summary] = match ?? [];
    const spent = cents(spentText);
    const start = values.carriedIn + values.assigned;
    const upto = Number(uptoText);
    const days = Number(
      (
        await panel(page)
          .getByText(/^\w+ 1 – \d+$/)
          .textContent()
      )?.split('– ')[1],
    );

    // Every transaction the demo makes this month is dated today or earlier,
    // so the series ends at this month's Activity.
    expect(spent).toBe(-values.activity);
    expect(cents(startText)).toBe(Math.max(0, start));
    await expect(paceSummary(page)).toHaveText(summary);

    if (start <= 0) {
      expect(summary).toBe('Nothing assigned, so no pace line');
    } else if (spent === 0) {
      expect(summary).toBe('No activity yet this month');
    } else {
      const difference = Math.round((start * upto) / days - spent);
      const amount = (Math.abs(difference) / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
      });
      expect(summary).toBe(
        `${amount} ${difference >= 0 ? 'under' : 'over'} even pace`,
      );
    }
    await expect(
      panel(page).getByTestId('category-details-pace-chart'),
    ).toBeVisible();
    await expect(panel(page).getByText('Today', { exact: true })).toBeVisible();
  });

  test('a past month reports how it finished', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    await panel(page)
      .getByRole('button', { name: 'Details: month before' })
      .click();
    await expect(pace(page)).toHaveAttribute(
      'aria-label',
      /by \w+ (28|29|30|31)\./,
    );
    const { available } = await panelValues(page);
    const amount = (Math.abs(available) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
    });
    await expect(paceSummary(page)).toHaveText(
      available >= 0
        ? `Finished with ${amount} left`
        : `Finished ${amount} overspent`,
    );
    await expect(panel(page).getByText('Today', { exact: true })).toHaveCount(
      0,
    );
  });

  test('a future month shows only the money to spend', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    await panel(page)
      .getByRole('button', { name: 'Details: month after' })
      .click();
    await expect(pace(page)).toHaveAttribute('aria-label', /has not started/);
    const { available, activity } = await panelValues(page);
    expect(activity).toBe(0);
    const amount = (Math.max(0, available) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
    });
    await expect(paceSummary(page)).toHaveText(
      new RegExp(`^${amount} to spend from \\w+ 1$`),
    );
    await expect(panel(page).getByText('No activity yet')).toBeVisible();
    await expect(
      panel(page).getByText('Activity', { exact: true }),
    ).toHaveCount(1); // the stat tile only, not the legend
  });

  test('without money at the start of the month there is no pace line', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    const { carriedIn } = await panelValues(page);
    // Assign exactly what cancels the carried-in balance: start = 0.
    await budgetPage.setBudgetedAmount(name, (-carriedIn / 100).toFixed(2));
    await expect(paceSummary(page)).toHaveText(
      'Nothing assigned, so no pace line',
    );
    await expect(panel(page).getByText('Even pace')).toHaveCount(0);
  });

  test('the goal box shows templates and long-term goals', async () => {
    const template = await budgetPage.getCategoryNameForRow(1);
    const longGoal = await budgetPage.getCategoryNameForRow(2);
    const month = await budgetPage.getSelectedMonth();
    await page.evaluate(
      async ({ template, longGoal, month }) => {
        const { list } = await window.$send('get-categories');
        const id = (name: string) =>
          list.find(category => category.name === name)?.id ?? '';
        await window.$send('notes-save', {
          id: id(template),
          note: '#template 250',
        });
        await window.$send('notes-save', {
          id: id(longGoal),
          note: '#goal 10000',
        });
        await window.$send('preferences/save', {
          id: 'flags.goalTemplatesEnabled',
          value: 'true',
        });
        await window.$send('budget/overwrite-goal-template', { month });
      },
      { template, longGoal, month },
    );
    await page.reload();
    await budgetPage.waitFor();
    // The template filled 250.00; take 30.00 back so it is short.
    await budgetPage.setBudgetedAmount(template, '220.00');

    await opener(page, template).click();
    const goal = panel(page).getByTestId('category-details-goal');
    await expect(
      goal.getByTestId('category-details-goal-status').first(),
    ).toHaveText('Template 250.00 · 30.00 short');
    await expect(
      goal.getByTestId('category-details-goal-sentence').first(),
    ).toHaveText('Template asks for 250.00. Underfunded by 30.00.');
    await expect(pace(page)).toBeVisible();

    await opener(page, longGoal).click();
    const { available } = await panelValues(page);
    const percent =
      available >= 1000000
        ? 100
        : Math.min(99, Math.round(Math.max(0, available / 1000000) * 100));
    await expect(
      goal.getByTestId('category-details-goal-status').first(),
    ).toHaveText(`Goal 10,000.00 · ${percent}% saved`);
    // The goal box replaces the pace chart for long-term savings goals.
    await expect(pace(page)).toHaveCount(0);
  });

  test('privacy mode hides the chart and its amounts', async () => {
    const name = await budgetPage.getCategoryNameForRow(1);
    await opener(page, name).click();
    await paceLabel(page);
    await page.getByRole('button', { name: 'Enable privacy mode' }).click();
    await expect(pace(page)).toHaveAttribute(
      'aria-label',
      'Pace chart hidden in privacy mode',
    );
    await expect(
      panel(page).getByTestId('category-details-pace-chart'),
    ).toHaveCount(0);
    await expect(paceSummary(page).first().locator('xpath=..')).toHaveCSS(
      'opacity',
      '0',
    );
  });
});
