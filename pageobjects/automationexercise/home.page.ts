import { expect, Page } from '@playwright/test';

export class AutomationExerciseHomePage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    const normalized = String(baseUrl ?? '').trim();
    const targetBaseUrl = /automationexercise\.com/i.test(normalized) ? normalized : 'https://automationexercise.com';
    await this.page.goto(targetBaseUrl);
  }

  async assertLoaded() {
    // Keep this assertion resilient: the homepage markup can vary, but the top nav is stable.
    await expect(this.page).toHaveTitle(/automation/i, { timeout: 15_000 });
    await expect(this.page.getByRole('link', { name: /signup\s*\/\s*login/i })).toBeVisible({ timeout: 15_000 });
  }

  async openSignupLogin() {
    await this.dismissCookieConsentIfPresent();
    await this.page.getByRole('link', { name: /signup\s*\/\s*login/i }).click();
    await expect(this.page).toHaveURL(/\/login/i);
  }

  async assertLoggedInAs(expectedName: string) {
    const pattern = new RegExp(`logged\\s+in\\s+as\\s+${this.escapeRegex(expectedName)}`, 'i');
    await expect(this.page.getByText(pattern)).toBeVisible();
  }

  async logout() {
    await this.page.getByRole('link', { name: /logout/i }).click();
    await expect(this.page).toHaveURL(/\/login/i);
  }

  async deleteAccount() {
    await this.page.getByRole('link', { name: /delete\s+account/i }).click();
    await expect(this.page).toHaveURL(/\/delete_account|\/delete/i);
  }

  private async dismissCookieConsentIfPresent() {
    const consentRoot = this.page.locator('.fc-consent-root, .fc-dialog, #cookieconsent, .cookie-consent, [aria-label*="cookie" i]');

    // Short, non-blocking attempt: if the banner isn't present, do nothing.
    const isVisible = await consentRoot.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) return;

    const acceptButton = consentRoot
      .getByRole('button', { name: /accept|agree|consent|ok|got it/i })
      .first();

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await consentRoot.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      return;
    }

    // Some banners use links instead of buttons.
    const acceptLink = consentRoot.getByRole('link', { name: /accept|agree|consent|ok|got it/i }).first();
    if (await acceptLink.isVisible().catch(() => false)) {
      await acceptLink.click();
      await consentRoot.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
