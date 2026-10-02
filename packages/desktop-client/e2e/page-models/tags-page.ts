import type { Locator, Page } from '@playwright/test';

export class TagsPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly addNewButton: Locator;
  readonly menuButton: Locator;
  readonly table: Locator;
  readonly newTagRow: Locator;

  constructor(page: Page) {
    this.page = page;
    // The placeholder renders with a typographic ellipsis
    this.searchBox = page.getByPlaceholder(/^Filter tags/);
    this.addNewButton = page.getByRole('button', { name: 'Add New' });
    this.menuButton = page.getByRole('button', { name: 'Menu', exact: true });
    this.table = page.getByTestId('table');
    this.newTagRow = page.getByTestId('new-tag');
  }

  async searchFor(text: string) {
    await this.searchBox.fill(text);
  }

  /** The row whose tag button reads `#<name>`. */
  getTagRow(name: string) {
    return this.table.getByTestId('row').filter({
      has: this.page.getByRole('button', { name: `#${name}`, exact: true }),
    });
  }

  async selectTag(name: string) {
    const row = this.getTagRow(name);
    await row.hover();
    await row.getByTestId('select').click();
  }

  async rightClickTag(name: string) {
    await this.getTagRow(name)
      .getByRole('button', { name: `#${name}`, exact: true })
      .click({ button: 'right' });
  }

  /** Pick an item from a row's context menu. */
  async chooseFromContextMenu(name: string, item: string) {
    await this.rightClickTag(name);
    await this.page
      .getByRole('menu')
      .getByRole('button', { name: item, exact: true })
      .click();
  }

  /** Pick an item from the "N Tags" selection menu. */
  async chooseFromSelectionMenu(item: string) {
    await this.page.getByTestId('selected-tags-select-button').click();
    await this.page
      .getByTestId('selected-tags-select-tooltip')
      .getByRole('button', { name: new RegExp(`^${item}`) })
      .click();
  }

  /** Pick an item from the page's `…` menu. */
  async chooseFromPageMenu(item: string) {
    await this.menuButton.click();
    await this.page
      .getByRole('menu')
      .getByRole('button', { name: item, exact: true })
      .click();
  }

  async createTag(name: string, description?: string) {
    await this.addNewButton.click();
    await this.newTagRow.getByPlaceholder('New tag').fill(name);
    if (description) {
      await this.newTagRow.getByText('Tag description').click();
      await this.newTagRow
        .getByPlaceholder('Tag description')
        .fill(description);
    }
    await this.newTagRow.getByTestId('add-button').click();
  }
}
