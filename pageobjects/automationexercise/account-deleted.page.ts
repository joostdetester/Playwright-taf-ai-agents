import { expect, Page } from '@playwright/test';

export class AutomationExerciseAccountDeletedPage {
  constructor(private readonly page: Page) {}

  async assertAccountDeleted() {
    await expect(this.page.getByText(/account deleted!/i)).toBeVisible();
  }

  async continue() {
    const continueByDataQa = this.page.locator('[data-qa="continue-button"]').first();
    const continueByRole = this.page.getByRole('link', { name: /continue/i }).first();
    const continueByButton = this.page.getByRole('button', { name: /continue/i }).first();

    for (const candidate of [continueByDataQa, continueByRole, continueByButton]) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click();
        return;
      }
    }

    throw new Error('No visible "Continue" control found on the Account Deleted page.');
  }
}
