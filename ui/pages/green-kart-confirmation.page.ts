import { expect, Page } from '@playwright/test';
import greenkartConfig from '../../config/greenkart.config';

export class GreenKartConfirmationPage {
  constructor(private readonly page: Page) {}

  async assertOrderPlacedSuccessfully() {
    await expect(this.page.getByText(greenkartConfig.expected.orderPlacedMessage)).toBeVisible();
    await expect(this.page.getByText(/thank you/i)).toBeVisible();
  }
}
