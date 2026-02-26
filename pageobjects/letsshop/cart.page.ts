import { expect, Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/cart/i);
    await expect(this.page.getByRole('heading', { name: /my cart/i })).toBeVisible();
  }

  async assertContainsProducts(products: string[]) {
    for (const product of products) {
      const regex = new RegExp(this.escapeRegex(product), 'i');
      await expect(this.page.getByText(regex), `Expected product in cart: ${product}`).toBeVisible();
    }
  }

  async proceedToCheckout() {
    await this.page.getByRole('button', { name: /checkout/i }).click();
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/order/i);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
