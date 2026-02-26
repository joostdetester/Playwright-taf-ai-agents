import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    // Rahul Shetty Academy client uses hash-based routing
    const url = `${normalizedBaseUrl}/client/#/auth/login`;
    await this.page.goto(url);
    await expect(this.page).toHaveURL(/\/client\/#\/auth\/login/i);
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }

  private emailInput(): Locator {
    return this.page
      .getByLabel(/email/i)
      .or(this.page.locator('input[type="email"]'))
      .or(this.page.locator('input[name*="email" i]'))
      .first();
  }

  private passwordInput(): Locator {
    return this.page
      .getByLabel(/password/i)
      .or(this.page.locator('input[type="password"]'))
      .or(this.page.locator('input[name*="password" i]'))
      .first();
  }

  private loginButton(): Locator {
    return this.page
      .getByRole('button', { name: /^login$/i })
      .or(this.page.getByRole('button', { name: /log\s*in/i }))
      .first();
  }
}
