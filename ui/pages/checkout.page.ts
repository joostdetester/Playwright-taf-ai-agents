import { expect, Locator, Page } from '@playwright/test';

export type CreditCardDetails = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
};

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/client\/#\/dashboard\/order/i);
    await expect(this.page.getByText(/payment method/i)).toBeVisible();
  }

  async selectPaymentMethod(method: string) {
    const normalized = method.trim().toLowerCase();
    if (normalized === 'credit card') {
      // If credit card fields are already visible, consider it selected.
      const cardNumberVisible = await this.creditCardNumberInput()
        .isVisible()
        .catch(() => false);
      if (cardNumberVisible) return;

      const creditCardPicker = this.page
        .getByRole('button', { name: /credit\s*card/i })
        .or(this.page.getByRole('tab', { name: /credit\s*card/i }))
        .or(this.page.getByLabel(/credit\s*card/i))
        .or(this.page.getByText(/^credit\s*card$/i))
        .or(this.page.getByText(/credit\s*card/i));

      const count = await creditCardPicker.count();
      if (count > 0) {
        await creditCardPicker.first().click();
        // Best-effort wait; some implementations switch the form asynchronously.
        await this.creditCardNumberInput()
          .waitFor({ state: 'visible', timeout: 5000 })
          .catch(() => undefined);
        return;
      }

      // Final fallback: wait briefly for the credit card fields to appear.
      await this.creditCardNumberInput()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => undefined);
      return;
    }

    throw new Error(`Unsupported payment method: ${method}. Supported: "credit card".`);
  }

  async fillCreditCardDetails(details: CreditCardDetails) {
    await this.creditCardNumberInput().fill(details.cardNumber);

    const expiryContainer = this.page.locator('div').filter({ has: this.page.getByText(/expiry date/i) }).first();
    const monthSelect = expiryContainer.locator('select').first();
    const yearSelect = expiryContainer.locator('select').nth(1);

    await expect(monthSelect).toBeVisible();
    await expect(yearSelect).toBeVisible();

    await monthSelect.selectOption({ label: details.expiryMonth }).catch(async () => {
      await monthSelect.selectOption(details.expiryMonth);
    });

    await yearSelect.selectOption({ label: details.expiryYear }).catch(async () => {
      await yearSelect.selectOption(details.expiryYear);
    });

    await this.cvvInput().fill(details.cvv);
    await this.nameOnCardInput().fill(details.nameOnCard);
  }

  async selectShippingCountry(country: string) {
    const input = this.shippingCountryInput();
    await expect(input).toBeVisible();
    const normalizedCountry = country.trim();
    const prefix = normalizedCountry.slice(0, 3) || normalizedCountry;
    const countryRe = new RegExp(`^\\s*${this.escapeRegex(normalizedCountry)}\\s*$`, 'i');

    await input.click();
    await input.fill('');
    await input.type(prefix, { delay: 100 });

    const candidates: Locator[] = [
      this.page.locator('section.ta-results button').filter({ hasText: countryRe }),
      this.page.locator('.ta-results button').filter({ hasText: countryRe }),
      this.page.locator('button.ta-item').filter({ hasText: countryRe }),
      this.page.locator('.ta-item').filter({ hasText: countryRe }),
      this.page.getByRole('button', { name: countryRe }),
    ];

    let selected = false;
    for (const candidate of candidates) {
      try {
        await candidate.first().waitFor({ state: 'visible', timeout: 8000 });
        await candidate.first().click();
        selected = true;
        break;
      } catch {
        // Try next candidate.
      }
    }

    if (!selected) {
      // Keyboard fallback for typeaheads that don't expose a stable DOM container.
      await input.press('ArrowDown');
      await input.press('Enter');
    }

    await expect(input).toHaveValue(countryRe, { timeout: 5000 });
  }

  async placeOrder() {
    const placeOrder = this.page
      .getByRole('button', { name: /place\s*order/i })
      .or(this.page.getByText(/^place\s*order$/i))
      .or(this.page.getByText(/place\s*order/i))
      .first();

    await expect(placeOrder).toBeVisible();
    await placeOrder.scrollIntoViewIfNeeded();
    await placeOrder.click();

    // This is a hash-routed SPA flow; don't wait for a full page load.
    await Promise.race([
      expect.poll(() => this.page.url(), { timeout: 15_000 }).toMatch(/\/client\/#\/dashboard\/thanks/i),
      expect(this.page.getByText(/thankyou\s+for\s+the\s+order/i)).toBeVisible({ timeout: 15_000 }),
    ]);
  }

  private creditCardNumberInput(): Locator {
    return this.page
      .getByLabel(/credit\s*card\s*number/i)
      .or(this.inputFollowingText(/credit\s*card\s*number/i))
      .or(this.page.locator('input[name*="card" i]'))
      .or(this.page.locator('input[placeholder*="card" i]'))
      .first();
  }

  private cvvInput(): Locator {
    return this.page
      .getByLabel(/cvv/i)
      .or(this.inputFollowingText(/cvv/i))
      .or(this.page.locator('input[name*="cvv" i]'))
      .or(this.page.locator('input[placeholder*="cvv" i]'))
      .first();
  }

  private nameOnCardInput(): Locator {
    return this.page
      .getByLabel(/name\s*on\s*card/i)
      .or(this.inputFollowingText(/name\s*on\s*card/i))
      .or(this.page.locator('input[name*="name" i]'))
      .or(this.page.locator('input[placeholder*="name" i]'))
      .first();
  }

  private shippingCountryInput(): Locator {
    return this.page
      .getByPlaceholder(/select country/i)
      .or(this.page.getByRole('textbox', { name: /select country/i }))
      .or(this.page.locator('input[placeholder*="country" i]'))
      .first();
  }

  private inputFollowingText(label: RegExp): Locator {
    // Many apps render field labels as plain text without a proper <label for="..."> binding.
    // This anchors to the label text and then selects the first input that follows it in DOM order.
    return this.page.getByText(label).first().locator('xpath=following::input[1]');
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
