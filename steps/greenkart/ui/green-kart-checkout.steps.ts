import { Given, Then, When } from '../bdd';
import { GreenKartProductsPage } from '../../ui/pages/green-kart-products.page';
import { GreenKartCartPage } from '../../ui/pages/green-kart-cart.page';
import { GreenKartCheckoutPage } from '../../ui/pages/green-kart-checkout.page';
import { GreenKartConfirmationPage } from '../../ui/pages/green-kart-confirmation.page';

Given('the user is on the greenkart products page', async ({ page, config }) => {
  const productsPage = new GreenKartProductsPage(page);
  await productsPage.goto(config.ui.baseUrl);
});

When(
  'the user adds product {string} to the cart with quantity {int}',
  async ({ page }, product: string, quantity: number) => {
    const productsPage = new GreenKartProductsPage(page);
    await productsPage.addProductToCart({ product, quantity });
  },
);

When('the user opens the cart', async ({ page }) => {
  const productsPage = new GreenKartProductsPage(page);
  await productsPage.openCart();
});

Then('the cart should contain the following products:', async ({ page }, dataTable) => {
  const cartPage = new GreenKartCartPage(page);
  const expectedProducts: string[] = dataTable.hashes().map((r: any) => String(r.product));
  await cartPage.assertContainsProducts(expectedProducts);
});

Then('the cart total amount should be {int}', async ({ page }, expectedTotal: number) => {
  const cartPage = new GreenKartCartPage(page);
  await cartPage.assertTotalAmount(expectedTotal);
});

When('the user places the order', async ({ page }) => {
  const cartPage = new GreenKartCartPage(page);
  await cartPage.placeOrder();
});

When('the user selects country {string}', async ({ page }, country: string) => {
  const checkoutPage = new GreenKartCheckoutPage(page);
  await checkoutPage.selectCountry(country);
});

When('the user agrees to the terms and conditions', async ({ page }) => {
  const checkoutPage = new GreenKartCheckoutPage(page);
  await checkoutPage.agreeToTerms();
});

When('the user proceeds with the checkout', async ({ page }) => {
  const checkoutPage = new GreenKartCheckoutPage(page);
  await checkoutPage.proceed();
});

Then('the order should be placed successfully', async ({ page }) => {
  const confirmationPage = new GreenKartConfirmationPage(page);
  await confirmationPage.assertOrderPlacedSuccessfully();
});
