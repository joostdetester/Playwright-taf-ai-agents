import { expect, Page } from '@playwright/test';

export class AcademyPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(this.page, 'Expected related page to have a non-empty URL').toHaveURL(/https?:\/\//i);

    // The practice page "Open Tab" commonly navigates to a Rahul Shetty / QA Click Academy page.
    await expect
      .poll(() => this.page.url(), { timeout: 10_000 })
      .toMatch(/(qaclickacademy|rahulshettyacademy)/i);

    await expect(this.page.locator('body')).toBeVisible();
  }
}
