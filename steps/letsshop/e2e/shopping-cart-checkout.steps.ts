import { expect } from '@playwright/test';
import { Given, Then, When } from '../../bdd';
import { LoginPage } from '../../../pageobjects/letsshop/login.page';
import { DashboardPage } from '../../../pageobjects/letsshop/dashboard.page';
import { CartPage } from '../../../pageobjects/letsshop/cart.page';
import { CheckoutPage } from '../../../pageobjects/letsshop/checkout.page';
import { OrderConfirmationPage } from '../../../pageobjects/letsshop/order-confirmation.page';
import { OrdersPage } from '../../../pageobjects/letsshop/orders.page';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env (project root) or your CI environment.`,
    );
  }
  return value.trim();
}

Given('the user is logged in as a valid customer', async ({ page, config }) => {
  const email = process.env.TEST_USER_EMAIL?.trim() ?? process.env.UI_USER_EMAIL?.trim();
  const password = process.env.TEST_USER_PASSWORD?.trim() ?? process.env.UI_USER_PASSWORD?.trim();

  if (!email || !password) {
    // Keep this error explicit and actionable.
    throw new Error(
      'Missing credentials. Set TEST_USER_EMAIL and TEST_USER_PASSWORD (preferred) or UI_USER_EMAIL and UI_USER_PASSWORD in your environment.',
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto(config.ui.baseUrl);
  await loginPage.login(email, password);

  const dashboardPage = new DashboardPage(page);
  await dashboardPage.assertLoaded();
});

When('the user adds product {string} to the cart', async ({ page }, product: string) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.addProductToCart(product);
});

When('the user opens the shopping cart', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openCart();

  const cartPage = new CartPage(page);
  await cartPage.assertLoaded();
});

Then('the shopping cart should contain the following products:', async ({ page }, dataTable) => {
  const cartPage = new CartPage(page);
  const expectedProducts: string[] = dataTable.hashes().map((r: any) => String(r.product));

  await cartPage.assertContainsProducts(expectedProducts);
});

When('the user proceeds to the shopping checkout', async ({ page }) => {
  const cartPage = new CartPage(page);
  await cartPage.proceedToCheckout();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertLoaded();
});

When('the user selects payment method {string}', async ({ page }, paymentMethod: string) => {
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.selectPaymentMethod(paymentMethod);
});

When('the user enters credit card payment details:', async ({ page }, dataTable) => {
  const rows = dataTable.hashes() as Array<{ field: string; value: string }>;
  const normalized: Record<string, string> = {};

  for (const row of rows) {
    const key = String(row.field ?? '').trim().toLowerCase();
    const value = String(row.value ?? '').trim();
    if (key) normalized[key] = value;
  }

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.fillCreditCardDetails({
    cardNumber: normalized['card number'] ?? getRequiredEnv('SHOPPING_CARD_NUMBER'),
    expiryMonth: normalized['expiry month'] ?? '01',
    expiryYear: normalized['expiry year'] ?? '16',
    cvv: normalized['cvv'] ?? '123',
    nameOnCard: normalized['name on card'] ?? 'test user',
  });
});

When('the user selects shipping country {string}', async ({ page }, country: string) => {
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.selectShippingCountry(country);
});

When('the user places the shopping order', async ({ page }) => {
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.placeOrder();
});

Then('the shopping order confirmation page should show {string}', async ({ page }, expectedText: string) => {
  const confirmationPage = new OrderConfirmationPage(page);
  await confirmationPage.assertLoaded();
  await confirmationPage.assertThankYouMessageContains(expectedText);
});

Then('the shopping order summary should list the following products:', async ({ page }, dataTable) => {
  const confirmationPage = new OrderConfirmationPage(page);
  const expectedProducts: string[] = dataTable.hashes().map((r: any) => String(r.product));

  // The thank-you page mainly shows order ids; product names are visible under Orders History.
  await confirmationPage.openOrdersHistory();

  const ordersPage = new OrdersPage(page);
  await ordersPage.assertLoaded();
  await ordersPage.assertContainsProducts(expectedProducts);
});
