import { expect, Page } from '@playwright/test';

export class AutomationExerciseSignupLoginPage {
  constructor(private readonly page: Page) {}

  async assertNewUserSignupVisible() {
    await expect(this.page.getByText(/new user signup!/i)).toBeVisible();
  }

  async assertEnterAccountInformationVisible() {
    await expect(this.page.getByText(/enter account information/i)).toBeVisible();
  }

  async assertLoginFormVisible() {
    await expect(this.page.getByText(/login to your account/i)).toBeVisible();

    const loginEmail = (await this.loginEmailByDataQa().count())
      ? this.loginEmailByDataQa().first()
      : this.page.getByPlaceholder(/email address/i).first();

    const loginPassword = (await this.loginPasswordByDataQa().count())
      ? this.loginPasswordByDataQa().first()
      : this.page.getByPlaceholder(/^password$/i).first();

    await expect(loginEmail).toBeVisible();
    await expect(loginPassword).toBeVisible();
  }

  async assertInvalidLoginError() {
    // On AutomationExercise this is typically shown as a red paragraph under the login form.
    const message = this.page.getByText(/your email or password is incorrect!/i);
    await expect(message).toBeVisible({ timeout: 10_000 });
  }

  async signupNewUser(params: { name: string; email: string }) {
    await this.assertNewUserSignupVisible();

    const email = params.email.trim();

    // These pages have duplicate placeholders (login vs signup). Prefer data-qa,
    // otherwise fall back to deterministic placeholder indexing.
    const nameInput = (await this.signupNameByDataQa().count())
      ? this.signupNameByDataQa().first()
      : this.page.getByRole('textbox', { name: /^name$/i }).first();

    const signupEmail = (await this.signupEmailByDataQa().count())
      ? this.signupEmailByDataQa().first()
      : this.page.getByPlaceholder(/email address/i).nth(1);

    await nameInput.fill(params.name);
    await signupEmail.fill(email);
    await this.signupButton().click();

    await this.assertEnterAccountInformationVisible();
  }

  async optInNewsletterAndOffers() {
    await this.dismissCookieConsentIfPresent();

    // These checkboxes may or may not be present depending on the page version.
    const newsletter = this.page.locator('#newsletter, input[name="newsletter"], [data-qa="newsletter"]').first();
    if (await newsletter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newsletter.scrollIntoViewIfNeeded().catch(() => {});
      await newsletter.check({ timeout: 5000 }).catch(async () => {
        await newsletter.click({ timeout: 5000 });
      });
    }

    const offers = this.page.locator('#optin, input[name="optin"], [data-qa="optin"]').first();
    if (await offers.isVisible({ timeout: 2000 }).catch(() => false)) {
      await offers.scrollIntoViewIfNeeded().catch(() => {});
      await offers.check({ timeout: 5000 }).catch(async () => {
        await offers.click({ timeout: 5000 });
      });
    }
  }

  async completeAccountRegistration(params: {
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    mobileNumber: string;
    submit?: boolean;
  }) {
    // Title is required on the site; pick one (Mr/Mrs) if available.
    const titleMr = this.page.locator('#id_gender1, input[name="title"][value="Mr"], input[value="Mr"]').first();
    const titleMrs = this.page.locator('#id_gender2, input[name="title"][value="Mrs"], input[value="Mrs"]').first();
    const chooseMr = Math.random() < 0.5;
    const targetTitle = chooseMr ? titleMr : titleMrs;
    if (await targetTitle.isVisible().catch(() => false)) {
      await targetTitle.check();
    } else if (await titleMr.isVisible().catch(() => false)) {
      await titleMr.check();
    } else if (await titleMrs.isVisible().catch(() => false)) {
      await titleMrs.check();
    }

    await this.passwordInput().fill(params.password);

    // DOB is often required; pick a valid random date from the available options.
    const day = String(1 + Math.floor(Math.random() * 28));
    const month = String(1 + Math.floor(Math.random() * 12));
    const year = String(1970 + Math.floor(Math.random() * 35));
    await this.daySelect().selectOption(day);
    await this.monthSelect().selectOption(month);
    await this.yearSelect().selectOption(year);

    // Address details (commonly required)
    await this.firstNameInput().fill(params.firstName);
    await this.lastNameInput().fill(params.lastName);
    if (params.company) {
      const company = this.companyInput();
      if (await company.isVisible().catch(() => false)) {
        await company.fill(params.company);
      }
    }
    await this.address1Input().fill(params.address1);
    if (params.address2) {
      const address2 = this.address2Input();
      if (await address2.isVisible().catch(() => false)) {
        await address2.fill(params.address2);
      }
    }

    // Country dropdown options vary by site version. Prefer selecting by label,
    // but fall back quickly to a safe default.
    await this.countrySelect()
      .selectOption({ label: params.country })
      .catch(async () => this.countrySelect().selectOption({ label: 'India' }))
      .catch(async () => this.countrySelect().selectOption({ index: 0 }));

    await this.stateInput().fill(params.state);
    await this.cityInput().fill(params.city);
    await this.zipCodeInput().fill(params.zipCode);
    await this.mobileNumberInput().fill(params.mobileNumber);

    if (params.submit !== false) {
      await this.createAccountButton().click();
    }
  }

  async submitAccountRegistration() {
    const button = this.createAccountButton();
    await button.scrollIntoViewIfNeeded();

    // Cookie consent can appear late and intercept the click.
    await this.dismissCookieConsentIfPresent();

    // Scope everything to the registration form to avoid accidentally interacting
    // with the footer subscription form.
    // Prefer the closest form ancestor of the Create Account button.
    // Some pages associate the button via `button.form` (not necessarily as an ancestor).
    const formHandle = await button
      .evaluateHandle((el) => {
        const btn = el as unknown as HTMLButtonElement;
        return btn.closest('form') || btn.form || null;
      })
      .catch(() => null);

    // Fallback: some pages are inconsistent; locate the form containing the password field.
    const fallbackFormHandle = formHandle
      ? null
      : await this.page
          .locator('form')
          .filter({ has: this.passwordInput() })
          .first()
          .elementHandle({ timeout: 1_000 })
          .catch(() => null);

    const effectiveFormHandle = (formHandle as any) || (fallbackFormHandle as any);

    const recentRequests: string[] = [];
    const onRequest = (req: any) => {
      if (recentRequests.length >= 12) return;
      recentRequests.push(`${req.method()} ${req.url()}`);
    };
    this.page.on('request', onRequest);

    try {
      // Try to observe a real form submit (POST) to distinguish "click didn't submit" vs "submit rejected".
      const postSignup = this.page
        .waitForResponse(
          (r) => r.request().method() === 'POST' && /automationexercise\.com/i.test(r.url()),
          { timeout: 10_000 },
        )
        .catch(() => null);

      // Prefer a real, actionability-checked click. If something overlays the button,
      // fall back to a forced click and finally an in-page click() to preserve default
      // submit behavior.
      try {
        await button.click();
      } catch {
        try {
          await button.click({ force: true });
        } catch {
          await button.evaluate((el) => (el as HTMLElement).click());
        }
      }
      const response = await postSignup;

      // If no POST happened, capture HTML5 validation state and attempt a forced submit.
      if (!response && effectiveFormHandle) {
        const validity = await effectiveFormHandle
          .evaluate((formEl: HTMLFormElement) => {
            const fields = Array.from(formEl.querySelectorAll('input, select, textarea')) as Array<
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >;
            const invalidFields = fields
              .filter((el) => typeof (el as any).checkValidity === 'function' && !(el as any).checkValidity())
              .slice(0, 15)
              .map((el) => ({
                tag: el.tagName.toLowerCase(),
                id: (el as any).id || null,
                name: (el as any).name || null,
                type: (el as any).type || null,
                required: (el as any).required || false,
                value: (el as any).value || '',
                message: (el as any).validationMessage || '',
              }));

            return {
              formAction: (formEl as any).action || null,
              formValid: typeof (formEl as any).checkValidity === 'function' ? formEl.checkValidity() : null,
              invalidCount: invalidFields.length,
              invalidFields,
            };
          })
          .catch(() => null);

        // If the form is invalid, a click won't submit; fail fast with details.
        if (validity?.invalidCount) {
          const requestInfo = recentRequests.length ? ` | Recent requests: ${recentRequests.join(' | ')}` : '';
          throw new Error(
            `Registration form is invalid; browser likely blocked submit. Details: ${JSON.stringify(validity)}` + requestInfo,
          );
        }

        await effectiveFormHandle
          .evaluate((el: HTMLFormElement) => {
            const anyEl = el as any;
            if (typeof anyEl.requestSubmit === 'function') {
              anyEl.requestSubmit();
              return;
            }
            el.submit();
          })
          .catch(() => undefined);
      }

      // Success signal: either URL changes, or the success heading appears.
      const successTimeoutMs = 20_000;
      const success = await new Promise<boolean>((resolve) => {
        let remaining = 2;
        let resolved = false;

        const done = (ok: boolean) => {
          if (resolved) return;
          if (ok) {
            resolved = true;
            resolve(true);
            return;
          }
          remaining -= 1;
          if (remaining <= 0) resolve(false);
        };

        expect(this.page)
          .toHaveURL(/\/account_created/i, { timeout: successTimeoutMs })
          .then(() => done(true))
          .catch(() => done(false));

        expect(this.page.getByRole('heading', { name: /account created!/i }))
          .toBeVisible({ timeout: successTimeoutMs })
          .then(() => done(true))
          .catch(() => done(false));
      });

      if (!success) {
        // Surface common validation errors to speed up debugging.
        const errorText = effectiveFormHandle
          ? await effectiveFormHandle
              .evaluate((formEl: HTMLFormElement) => {
                const el = formEl.querySelector('.alert-danger, .alert.alert-danger, .alert, p[style*="color"], .error');
                return (el?.textContent || '').trim();
              })
              .catch(() => '')
          : '';
        const url = this.page.url();

        const invalid = effectiveFormHandle
          ? await effectiveFormHandle
              .evaluate((formEl: HTMLFormElement) => {
                const fields = Array.from(formEl.querySelectorAll('input, select, textarea')) as Array<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >;

                const invalidFields = fields
                  .filter((el) => typeof (el as any).checkValidity === 'function' && !(el as any).checkValidity())
                  .slice(0, 15)
                  .map((el) => ({
                    tag: el.tagName.toLowerCase(),
                    id: (el as any).id || null,
                    name: (el as any).name || null,
                    type: (el as any).type || null,
                    required: (el as any).required || false,
                    value: (el as any).value || '',
                    message: (el as any).validationMessage || '',
                  }));

                const firstInvalid = formEl.querySelector(':invalid') as any;
                return {
                  count: invalidFields.length,
                  firstInvalid: firstInvalid
                    ? {
                        tag: firstInvalid.tagName?.toLowerCase?.() ?? null,
                        id: firstInvalid.id || null,
                        name: firstInvalid.name || null,
                        type: firstInvalid.type || null,
                        value: firstInvalid.value || '',
                        message: firstInvalid.validationMessage || '',
                      }
                    : null,
                  invalidFields,
                };
              })
              .catch(() => null)
          : null;

        const requestInfo = recentRequests.length ? ` | Recent requests: ${recentRequests.join(' | ')}` : '';
        const invalidInfo = invalid?.count
          ? ` | Invalid fields: ${JSON.stringify(invalid)}`
          : invalid?.firstInvalid
            ? ` | First invalid: ${JSON.stringify(invalid.firstInvalid)}`
            : '';

        throw new Error(
          `Account registration did not complete. Still on URL: ${url}` +
            (errorText ? ` | Visible error: ${errorText}` : '') +
            invalidInfo +
            requestInfo,
        );
      }
    } finally {
      this.page.off('request', onRequest);
    }
  }

  async login(params: { email: string; password: string }) {
    await expect(this.page.getByText(/login to your account/i)).toBeVisible();

    const loginEmail = (await this.loginEmailByDataQa().count())
      ? this.loginEmailByDataQa().first()
      : this.page.getByPlaceholder(/email address/i).first();

    const loginPassword = (await this.loginPasswordByDataQa().count())
      ? this.loginPasswordByDataQa().first()
      : this.page.getByPlaceholder(/^password$/i).first();

    await loginEmail.fill(params.email);
    await loginPassword.fill(params.password);

    const loginButton = this.loginButton();
    // Cookie consent can appear late and intercept the click; retry a couple of times.
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.dismissCookieConsentIfPresent();
      try {
        await loginButton.click({ timeout: 5000 });
        return;
      } catch (error) {
        const overlayVisible = await this.page
          .locator('.fc-dialog-overlay, .fc-consent-root, .fc-dialog')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (!overlayVisible || attempt === 2) throw error;
      }
    }
  }

  private async dismissCookieConsentIfPresent() {
    const consentRoot = this.page.locator('.fc-consent-root, .fc-dialog, #cookieconsent, .cookie-consent, [aria-label*="cookie" i]');

    // Short, non-blocking attempt: if the banner isn't present, do nothing.
    const isVisible = await consentRoot.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) return;

    const acceptName = /accept|agree|consent|ok|got it/i;

    // Prefer accessible button/link first.
    const acceptButton = consentRoot.getByRole('button', { name: acceptName }).first();
    const acceptLink = consentRoot.getByRole('link', { name: acceptName }).first();

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.scrollIntoViewIfNeeded().catch(() => {});
      await acceptButton.click({ timeout: 5000 }).catch(() => {});
      await consentRoot.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      return;
    }

    if (await acceptLink.isVisible().catch(() => false)) {
      await acceptLink.scrollIntoViewIfNeeded().catch(() => {});
      await acceptLink.click({ timeout: 5000 }).catch(() => {});
      await consentRoot.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      return;
    }

    // Fallback: some banners use non-semantic elements.
    const acceptAny = consentRoot
      .locator('button, a, [role="button"], input[type="button"], input[type="submit"], div, span')
      .filter({ hasText: acceptName })
      .first();

    if (await acceptAny.isVisible().catch(() => false)) {
      await acceptAny.scrollIntoViewIfNeeded().catch(() => {});
      await acceptAny.click({ timeout: 5000 }).catch(() => {});
      await consentRoot.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  }

  private signupNameByDataQa() {
    return this.page.locator('[data-qa="signup-name"]');
  }

  private signupEmailByDataQa() {
    return this.page.locator('[data-qa="signup-email"]');
  }

  private signupButton() {
    return this.page.locator('[data-qa="signup-button"], button:has-text("Signup"), button:has-text("Sign up")').first();
  }

  private passwordInput() {
    return this.page.locator('[data-qa="password"], input[type="password"][name="password"], input#password').first();
  }

  private daySelect() {
    return this.page.locator('[data-qa="days"], select#days, select[name="days"]').first();
  }

  private monthSelect() {
    return this.page.locator('[data-qa="months"], select#months, select[name="months"]').first();
  }

  private yearSelect() {
    return this.page.locator('[data-qa="years"], select#years, select[name="years"]').first();
  }

  private firstNameInput() {
    return this.page.locator('[data-qa="first_name"], input#first_name, input[name="first_name"]').first();
  }

  private lastNameInput() {
    return this.page.locator('[data-qa="last_name"], input#last_name, input[name="last_name"]').first();
  }

  private address1Input() {
    return this.page.locator('[data-qa="address"], input#address1, input[name="address1"]').first();
  }

  private address2Input() {
    return this.page.locator('[data-qa="address2"], input#address2, input[name="address2"]').first();
  }

  private companyInput() {
    return this.page.locator('[data-qa="company"], input#company, input[name="company"]').first();
  }

  private countrySelect() {
    return this.page.locator('[data-qa="country"], select#country, select[name="country"]').first();
  }

  private stateInput() {
    return this.page.locator('[data-qa="state"], input#state, input[name="state"]').first();
  }

  private cityInput() {
    return this.page.locator('[data-qa="city"], input#city, input[name="city"]').first();
  }

  private zipCodeInput() {
    return this.page.locator('[data-qa="zipcode"], input#zipcode, input[name="zipcode"]').first();
  }

  private mobileNumberInput() {
    return this.page.locator('[data-qa="mobile_number"], input#mobile_number, input[name="mobile_number"]').first();
  }

  private createAccountButton() {
    return this.page.locator('[data-qa="create-account"], button:has-text("Create Account")').first();
  }

  private loginEmailByDataQa() {
    return this.page.locator('[data-qa="login-email"]');
  }

  private loginPasswordByDataQa() {
    return this.page.locator('[data-qa="login-password"]');
  }

  private loginButton() {
    return this.page.locator('[data-qa="login-button"], button:has-text("Login")').first();
  }
}
