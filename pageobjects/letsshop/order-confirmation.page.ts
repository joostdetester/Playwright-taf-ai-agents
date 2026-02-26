import { expect, Locator, Page } from '@playwright/test';

export class OrderConfirmationPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/thanks/i);
    await expect(this.thankYouTitle()).toBeVisible();
  }

  async assertThankYouMessageContains(expectedText: string) {
    const expected = expectedText.trim();
    await expect(this.page.getByText(new RegExp(this.escapeRegex(expected), 'i'))).toBeVisible();
  }

  async getVisibleProductNames(): Promise<string[]> {
    // Best-effort extraction: collect the visible product titles from the order summary.
    // We intentionally avoid hard-coding CSS selectors; use visible text patterns.
    const candidates = this.page
      .locator('div')
      .filter({ has: this.page.getByText(/\$/) })
      .locator('text=/[A-Z0-9][A-Z0-9\s\-]{2,}/');

    const unique = new Set<string>();
    const count = await candidates.count();
    for (let i = 0; i < Math.min(count, 50); i++) {
      const text = (await candidates.nth(i).innerText()).trim();
      if (text) unique.add(text);
    }

    // Fallback: if the above is too broad, return all-uppercase-like texts on the page.
    if (unique.size === 0) {
      const allText = await this.page.locator('body').innerText();
      for (const line of allText.split('\n')) {
        const value = line.trim();
        if (!value) continue;
        if (/^[A-Z0-9][A-Z0-9\s\-]{2,}$/.test(value)) unique.add(value);
      }
    }

    return Array.from(unique);
  }

  private thankYouTitle(): Locator {
    return this.page.getByText(/thankyou\s+for\s+the\s+order/i);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
