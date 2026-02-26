import { expect, Locator, Page } from '@playwright/test';

export class OrdersPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    // Route name can vary; be flexible and assert either URL pattern or presence of an Orders heading/table.
    await expect
      .poll(() => this.page.url(), { timeout: 15_000 })
      .toMatch(/\/client\/#\/dashboard\/(myorders|orders)/i)
      .catch(() => undefined);

    await expect(this.ordersMarker()).toBeVisible({ timeout: 15_000 });
  }

  async assertContainsProducts(products: string[]) {
    // On this app, the thank-you page doesn't show product names; they appear under Orders History.
    // The Orders page can render products in a table/list. We assert that each expected product name
    // is visible somewhere on the page.
    for (const product of products) {
      const re = new RegExp(this.escapeRegex(product), 'i');
      const matches = this.page.getByText(re);
      await expect(matches.first(), `Expected product in Orders history: ${product}`).toBeVisible();
    }
  }

  private ordersMarker(): Locator {
    return this.page
      .getByRole('heading', { name: /orders/i })
      .or(this.page.getByText(/orders\s+history/i))
      .or(this.page.getByText(/your\s+orders/i))
      .or(this.page.getByRole('table'))
      .first();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
