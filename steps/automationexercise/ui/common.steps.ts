import { Given, Then, When } from '../../bdd';
import { AutomationExerciseHomePage } from '../../../pageobjects/automationexercise/home.page';
import { AutomationExerciseSignupLoginPage } from '../../../pageobjects/automationexercise/signup-login.page';
import { AutomationExerciseAccountDeletedPage } from '../../../pageobjects/automationexercise/account-deleted.page';

Given('the user is on the AutomationExercise home page', async ({ page, config }) => {
  const home = new AutomationExerciseHomePage(page);
  await home.goto(config.ui.baseUrl);
  await home.assertLoaded();
});

When('the user opens the signup or login page', async ({ page }) => {
  const home = new AutomationExerciseHomePage(page);
  await home.openSignupLogin();
});

Then('the login form should be visible', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.assertLoginFormVisible();
});

Then('the new user signup section should be visible', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.assertNewUserSignupVisible();
});

Then('the user should be logged in as {string}', async ({ page }, expectedName: string) => {
  const home = new AutomationExerciseHomePage(page);
  await home.assertLoggedInAs(expectedName);
});

Then('the user should be logged in as the created user', async ({ page, world }) => {
  const createdName = (world as any)?.ae?.name as string | undefined;
  if (!createdName) throw new Error('No created user found in world. Ensure the signup step ran successfully.');

  const home = new AutomationExerciseHomePage(page);
  await home.assertLoggedInAs(createdName);
});

When('the user logs out', async ({ page }) => {
  const home = new AutomationExerciseHomePage(page);
  await home.logout();
});

When('the user deletes the account', async ({ page }) => {
  const home = new AutomationExerciseHomePage(page);
  await home.deleteAccount();
});

Then('the account deleted message should be visible', async ({ page }) => {
  const deleted = new AutomationExerciseAccountDeletedPage(page);
  await deleted.assertAccountDeleted();
});

When('the user continues after account deletion', async ({ page }) => {
  const deleted = new AutomationExerciseAccountDeletedPage(page);
  await deleted.continue();
});
