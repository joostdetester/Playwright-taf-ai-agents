import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/dash/i);
  }

  async addProductToCart(productName: string) {
    const productCard = this.getProductCard(productName);
    await expect(productCard, `Product card should be visible for: ${productName}`).toBeVisible();

    // Some pages render repeated "add to cart" buttons; anchor within the product card.
    await productCard.getByRole('button', { name: /add\s*to\s*cart/i }).first().click();
  }

  async openCart() {
    const cartLink = this.page
      .getByRole('link', { name: /cart/i })
      .or(this.page.getByRole('button', { name: /cart/i }))
      .first();

    await cartLink.click();
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/cart/i);
  }

  private getProductCard(productName: string): Locator {
    const nameRegex = new RegExp(this.escapeRegex(productName), 'i');

    // Prefer the closest product card containing the product title.
    // The app uses card-like layouts; using the nearest .card ancestor prevents selecting a larger container.
    const title = this.page.getByText(nameRegex).first();
    const nearestCard = title.locator('xpath=ancestor::div[contains(@class,"card")][1]');

    // Fallback: any .card containing the text + an add-to-cart button.
    const fallbackCard = this.page
      .locator('.card')
      .filter({ has: this.page.getByText(nameRegex) })
      .filter({ has: this.page.getByRole('button', { name: /add\s*to\s*cart/i }) })
      .first();

    return nearestCard.or(fallbackCard).first();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
