import { expect, Page } from '@playwright/test';

export class AutomationExerciseHomePage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    const normalized = String(baseUrl ?? '').trim();
    const targetBaseUrl = /automationexercise\.com/i.test(normalized) ? normalized : 'https://automationexercise.com';
    await this.page.goto(targetBaseUrl, { waitUntil: 'domcontentloaded' });

    // The Funding Choices consent popup loads asynchronously and can appear at any point,
    // including after dismissCookieConsentIfPresent() has already run (causing flakiness).
    // addLocatorHandler fires reactively whenever the button is visible, before any
    // Playwright action that would otherwise be blocked by the overlay.
    const consentButton = this.page.getByRole('button', { name: 'Consent' });
    await this.page.addLocatorHandler(consentButton, async () => {
      await consentButton.click({ timeout: 5_000 }).catch(() => {});
    });
  }

  async assertLoaded() {
    // Keep this assertion resilient: the homepage markup can vary.
    // AutomationExercise sometimes shows a temporary "heavy load / queue full" interstitial.
    // In that case, retry a few reloads before failing.
    const deadline = Date.now() + 90_000;

    while (Date.now() < deadline) {
      const queueVisible = await this.page
        .getByRole('heading', { name: /heavy load|queue full/i })
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (queueVisible) {
        await this.page.waitForTimeout(3000);
        await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        continue;
      }

      const signupLoginLink = this.page.getByRole('link', { name: /signup\s*\/\s*login/i });
      if (await signupLoginLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(signupLoginLink).toBeVisible({ timeout: 15_000 });
        return;
      }

      await this.page.waitForTimeout(1000);
    }

    throw new Error(`AutomationExercise home did not load in time. Current URL: ${this.page.url()}`);
  }

  async openSignupLogin() {
    await this.dismissCookieConsentIfPresent();
    await this.page.getByRole('link', { name: /signup\s*\/\s*login/i }).click();
    await expect(this.page).toHaveURL(/\/login/i);
  }

  async assertLoggedInAs(expectedName: string) {
    const pattern = new RegExp(`logged\\s+in\\s+as\\s+${this.escapeRegex(expectedName)}`, 'i');
    await expect(this.page.getByText(pattern)).toBeVisible({ timeout: 15_000 });
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
