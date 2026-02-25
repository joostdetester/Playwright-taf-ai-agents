import { expect, Page, Locator } from '@playwright/test';
import greenkartConfig, { greenkartUrl } from '../../config/greenkart.config';

export class GreenKartProductsPage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    await this.page.goto(greenkartUrl(baseUrl, 'products'));
    await expect(this.page).toHaveURL(/seleniumPractise\/#\/?/);
  }

  async addProductToCart(params: { product: string; quantity: number }) {
    const { product, quantity } = params;
    const productCard = this.getProductCard(product);
    await expect(productCard).toBeVisible();

    await this.setProductQuantity(productCard, quantity);
    await productCard.getByRole('button', { name: /add to cart/i }).click();
  }

  async openCart() {
    await this.page.locator('a.cart-icon, .cart-icon').first().click();
    await this.page.getByRole('button', { name: /proceed to checkout/i }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(greenkartConfig.routes.cart)}$`));
  }

  private getProductCard(product: string): Locator {
    const name = product.trim();
    const nameRegex = new RegExp(name, 'i');
    return this.page
      .locator('.products-wrapper .product')
      .filter({ has: this.page.locator('.product-name', { hasText: nameRegex }) })
      .first();
  }

  private async setProductQuantity(productCard: Locator, targetQuantity: number) {
    if (!Number.isFinite(targetQuantity) || targetQuantity < 1) {
      throw new Error(`Invalid quantity: ${targetQuantity}`);
    }

    const qtyInput = productCard.locator('input.quantity');
    await expect(qtyInput).toBeVisible();

    const increment = productCard.locator('a.increment');
    const decrement = productCard.locator('a.decrement');

    // Deterministic strategy:
    // 1) Ensure underlying app state is updated via +/- controls
    // 2) Reset to 1
    // 3) Increment to the target
    if (targetQuantity === 1) {
      await increment.click();
      await decrement.click();
      await expect(qtyInput).toHaveValue('1');
      return;
    }

    for (let i = 0; i < 10; i++) {
      const valueNow = await qtyInput.inputValue();
      if (valueNow.trim() === '1') break;
      await decrement.click();
    }
    await expect(qtyInput).toHaveValue('1');

    for (let i = 0; i < targetQuantity - 1; i++) {
      await increment.click();
    }
    await expect(qtyInput).toHaveValue(String(targetQuantity));
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
