import { expect, Locator, Page } from '@playwright/test';

export class PracticePage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    const url = this.joinUrl(baseUrl, '/AutomationPractice/');
    await this.page.goto(url);
  }

  async assertLoaded() {
    await expect(this.autocompleteInput(), 'Expected practice page autocomplete to be visible').toBeVisible();
    await expect(this.page.getByText(/practice page/i)).toBeVisible();
  }

  async enterName(name: string) {
    await this.nameInput().fill(name);
  }

  async selectRadioOption(optionLabel: string) {
    const optionRe = new RegExp(`^\\s*${this.escapeRegex(optionLabel)}\\s*$`, 'i');

    const group = this.radioGroup();
    await expect(group).toBeVisible();

    const namedRadio = group.getByRole('radio', { name: optionRe }).first();
    if ((await namedRadio.count()) > 0) {
      await namedRadio.check();
      return;
    }

    const labeledRadio = group.locator('label').filter({ hasText: optionRe }).getByRole('radio').first();
    if ((await labeledRadio.count()) > 0) {
      await labeledRadio.check();
      await expect(labeledRadio).toBeChecked();
      return;
    }

    // Fallback: some implementations render radios without accessible names.
    const optionText = group.getByText(optionRe).first();
    await expect(optionText, `Expected radio option text to exist: ${optionLabel}`).toBeVisible();
    await optionText.click();

    const index = this.extractTrailingNumber(optionLabel);
    const fallbackByIndex = index ? group.getByRole('radio').nth(index - 1) : group.getByRole('radio').first();
    await expect(fallbackByIndex).toBeChecked({ timeout: 5000 });
  }

  async selectCheckboxes(options: string[]) {
    for (const option of options) {
      const optionRe = new RegExp(`^\\s*${this.escapeRegex(option)}\\s*$`, 'i');
      const group = this.checkboxGroup();
      await expect(group).toBeVisible();

      const namedCheckbox = group.getByRole('checkbox', { name: optionRe }).first();
      if ((await namedCheckbox.count()) > 0) {
        await namedCheckbox.check();
        continue;
      }

      const labeledCheckbox = group.locator('label').filter({ hasText: optionRe }).getByRole('checkbox').first();
      if ((await labeledCheckbox.count()) > 0) {
        await labeledCheckbox.check();
        await expect(labeledCheckbox).toBeChecked();
        continue;
      }

      const optionText = group.getByText(optionRe).first();
      await expect(optionText, `Expected checkbox option text to exist: ${option}`).toBeVisible();
      await optionText.click();

      const index = this.extractTrailingNumber(option);
      const fallbackByIndex = index ? group.getByRole('checkbox').nth(index - 1) : group.getByRole('checkbox').first();
      await expect(fallbackByIndex).toBeChecked({ timeout: 5000 });
    }
  }

  private extractTrailingNumber(label: string): number | null {
    const match = label.match(/(\d+)\s*$/);
    if (!match) return null;
    const n = Number(match[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  async selectStaticDropdownOption(optionLabel: string) {
    const select = this.staticDropdown();
    await expect(select).toBeVisible();

    await select.selectOption({ label: optionLabel }).catch(async () => {
      await select.selectOption(optionLabel);
    });
  }

  async selectCountryFromAutocomplete(country: string) {
    const input = this.autocompleteInput();
    await expect(input).toBeVisible();

    const normalized = country.trim();
    const prefix = normalized.slice(0, 3) || normalized;
    const countryRe = new RegExp(`^\\s*${this.escapeRegex(normalized)}\\s*$`, 'i');

    await input.click();
    await input.fill('');
    await input.type(prefix, { delay: 80 });

    const suggestions = this.page
      .locator('#ui-id-1 .ui-menu-item-wrapper')
      .or(this.page.locator('#ui-id-1 li'))
      .filter({ hasText: countryRe })
      .first();

    await expect(suggestions, 'Expected autocomplete suggestions to appear').toBeVisible({ timeout: 10_000 });
    await suggestions.click();

    await expect(input).toHaveValue(countryRe);
  }

  async openRelatedPageInNewTab() {
    const opener = this.openTabButton();
    await expect(opener).toBeVisible();

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      opener.click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  async triggerAlertAndAccept(name: string): Promise<string> {
    const section = this.alertSection();
    const nameInput = section.locator('input').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);

    const alertButton = section.getByRole('button', { name: /^alert$/i }).or(section.getByText(/^alert$/i)).first();
    await expect(alertButton).toBeVisible();

    const handled = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });

    await alertButton.click();
    return await handled;
  }

  async assertWebTableContains(text: string) {
    const table = this.webTableGroup().locator('table').first();
    await expect(table, 'Expected web table to be visible').toBeVisible();
    await expect(table).toContainText(text);
  }

  async assertIframeShowsLink(linkText: string) {
    const frame = this.iframeGroup().frameLocator('iframe').first();
    const link = frame.getByRole('link', { name: new RegExp(this.escapeRegex(linkText), 'i') }).first();
    await expect(link, `Expected iframe link to be visible: ${linkText}`).toBeVisible({ timeout: 15_000 });
  }

  private nameInput(): Locator {
    return this.page
      .getByPlaceholder(/enter your name/i)
      .or(this.page.locator('input[name="name"], input#name').first())
      .first();
  }

  private staticDropdown(): Locator {
    return this.page.locator('select#dropdown-class-example').first();
  }

  private autocompleteInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /type to select countries/i })
      .or(this.page.locator('input#autocomplete'))
      .first();
  }

  private openTabButton(): Locator {
    return this.page
      .getByRole('link', { name: /open tab/i })
      .or(this.page.getByRole('button', { name: /open tab/i }))
      .first();
  }

  private alertSection(): Locator {
    return this.page.getByRole('group', { name: /switch to alert example/i }).first();
  }

  private radioGroup(): Locator {
    return this.page.getByRole('group', { name: /radio button example/i }).first();
  }

  private checkboxGroup(): Locator {
    return this.page.getByRole('group', { name: /checkbox example/i }).first();
  }

  private webTableGroup(): Locator {
    return this.page.getByRole('group', { name: /web table example/i }).first();
  }

  private iframeGroup(): Locator {
    return this.page.getByRole('group', { name: /iframe example/i }).first();
  }

  private joinUrl(baseUrl: string, path: string): string {
    const left = (baseUrl ?? '').trim().replace(/\/+$/, '');
    const right = (path ?? '').trim().replace(/^\/+/, '');
    return `${left}/${right}`;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
