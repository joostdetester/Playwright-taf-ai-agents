import { expect, Page } from '@playwright/test';
import greenkartConfig from '../../config/greenkart.config';

export class GreenKartCheckoutPage {
  constructor(private readonly page: Page) {}

  async selectCountry(country: string) {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(greenkartConfig.routes.country)}$`));
    const select = this.page.locator('select');
    await expect(select).toBeVisible();
    await select.selectOption({ label: country });
  }

  async agreeToTerms() {
    const checkbox = this.page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async proceed() {
    await this.page.getByRole('button', { name: /proceed/i }).click();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
