import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { ConfigurationPage } from './page-models/configuration-page';
import { Navigation } from './page-models/navigation';
import type { TagsPage } from './page-models/tags-page';

test.describe('Tags', () => {
  let page: Page;
  let configurationPage: ConfigurationPage;
  let navigation: Navigation;
  let tagsPage: TagsPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    navigation = new Navigation(page);
    configurationPage = new ConfigurationPage(page);

    await page.goto('/');
    await configurationPage.createTestFile();

    tagsPage = await navigation.goToTagsPage();
    await expect(tagsPage.getTagRow('groceries')).toBeVisible();
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('checks the page visuals', async () => {
    await expect(page).toMatchThemeScreenshots();

    // A selected tag shows the selection button in the toolbar
    await tagsPage.selectTag('groceries');
    await expect(page.getByTestId('selected-tags-select-button')).toHaveText(
      '1 Tags',
    );
    await expect(page).toMatchThemeScreenshots();
  });

  test('checks the new-tag row visuals', async () => {
    await tagsPage.addNewButton.click();
    await tagsPage.newTagRow.getByPlaceholder('New tag').fill('travel');
    await expect(tagsPage.newTagRow).toMatchThemeScreenshots();
  });

  test('lists each tag with its description', async () => {
    await expect(tagsPage.getTagRow('groceries')).toContainText(
      'Kroger & Publix trips',
    );
    await expect(tagsPage.getTagRow('clothing')).toContainText(
      'Apparel purchases',
    );
  });

  test('filters the list by tag name', async () => {
    await tagsPage.searchFor('groc');
    await expect(tagsPage.table.getByTestId('row')).toHaveCount(1);
    await expect(tagsPage.getTagRow('groceries')).toBeVisible();

    await tagsPage.searchFor('asdfasdf-nonsense');
    await expect(tagsPage.table.getByTestId('row')).toHaveCount(0);
  });

  test('creates a tag', async () => {
    await tagsPage.createTag('travel', 'Trips and hotels');

    // The row stays open for the next tag
    await expect(tagsPage.newTagRow.getByPlaceholder('New tag')).toHaveValue(
      '',
    );
    await tagsPage.newTagRow.getByTestId('close-button').click();
    await expect(tagsPage.newTagRow).toHaveCount(0);

    await expect(tagsPage.getTagRow('travel')).toContainText(
      'Trips and hotels',
    );
  });

  test('does not add a tag whose name is taken', async () => {
    await tagsPage.addNewButton.click();
    await tagsPage.newTagRow.getByPlaceholder('New tag').fill('groceries');
    await expect(tagsPage.newTagRow.getByTestId('add-button')).toBeDisabled();
  });

  test('renames a tag from its context menu', async () => {
    await tagsPage.chooseFromContextMenu('gift', 'Rename');

    // The row's only text field while renaming
    const input = tagsPage.table.getByRole('textbox');
    await input.fill('gifts');
    await input.press('Enter');

    await expect(tagsPage.getTagRow('gifts')).toBeVisible();
    await expect(tagsPage.getTagRow('gift')).toHaveCount(0);
  });

  test('edits a tag description', async () => {
    const row = tagsPage.getTagRow('clothing');
    await row.getByText('Apparel purchases').click();

    const input = row.getByRole('textbox');
    await input.fill('Shoes and clothes');
    await input.press('Enter');

    await expect(tagsPage.getTagRow('clothing')).toContainText(
      'Shoes and clothes',
    );
  });

  test('hides a tag and shows it again from the page menu', async () => {
    await tagsPage.chooseFromContextMenu('gift', 'Hide');
    await expect(tagsPage.getTagRow('gift')).toHaveCount(0);

    await tagsPage.chooseFromPageMenu('Show hidden tags');
    await expect(tagsPage.getTagRow('gift')).toBeVisible();

    await tagsPage.chooseFromContextMenu('gift', 'Unhide');
    await tagsPage.chooseFromPageMenu("Don't show hidden tags");
    await expect(tagsPage.getTagRow('gift')).toBeVisible();
  });

  test('deletes selected tags from the selection menu', async () => {
    await tagsPage.selectTag('gift');
    await tagsPage.selectTag('clothing');
    await expect(page.getByTestId('selected-tags-select-button')).toHaveText(
      '2 Tags',
    );

    await tagsPage.chooseFromSelectionMenu('Delete');

    await expect(tagsPage.getTagRow('gift')).toHaveCount(0);
    await expect(tagsPage.getTagRow('clothing')).toHaveCount(0);
    await expect(page.getByTestId('selected-tags-select-button')).toHaveCount(
      0,
    );
  });

  test("opens the tag's transactions", async () => {
    await tagsPage
      .getTagRow('groceries')
      .getByText('View Transactions')
      .click();

    await expect(page).toHaveURL(/\/accounts$/);
    await expect(page.getByText('#groceries').first()).toBeVisible();
  });
});
