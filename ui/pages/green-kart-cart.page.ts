import { expect, Page } from '@playwright/test';
import greenkartConfig from '../../config/greenkart.config';

export class GreenKartCartPage {
  constructor(private readonly page: Page) {}

  async assertContainsProducts(expectedProducts: string[]) {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(greenkartConfig.routes.cart)}$`));
    const table = this.page.locator('table.cartTable');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) throw new Error('Cart is empty');

    const cartText = (await table.innerText()).toLowerCase();
    for (const p of expectedProducts) {
      const needle = p.trim().toLowerCase();
      if (!needle) continue;
      if (!cartText.includes(needle)) {
        throw new Error(`Expected cart to include "${p}", but it was not found.`);
      }
    }
  }

  async assertTotalAmount(expectedTotal: number) {
    const totalLocator = this.page.locator('.totAmt');
    await expect(totalLocator).toBeVisible();
    const totalText = (await totalLocator.textContent()) ?? '';
    const total = this.parseNumber(totalText);
    if (total !== expectedTotal) {
      throw new Error(`Expected total amount ${expectedTotal}, but got ${total}`);
    }
  }

  async placeOrder() {
    await this.page.getByRole('button', { name: /place order/i }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(greenkartConfig.routes.country)}$`));
  }

  private parseNumber(text: string): number {
    const match = text.replace(/,/g, '').match(/(\d+)/);
    if (!match) throw new Error(`Could not parse number from: "${text}"`);
    return Number.parseInt(match[1], 10);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
