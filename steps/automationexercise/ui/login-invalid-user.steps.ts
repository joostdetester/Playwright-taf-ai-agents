import { Then, When } from '../../bdd';
import { faker } from '@faker-js/faker';
import { AutomationExerciseSignupLoginPage } from '../../../pageobjects/automationexercise/signup-login.page';

When('the user attempts to log in with incorrect credentials', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);

  const email = faker.internet.email().toLowerCase();
  const password = faker.random.alphaNumeric(12);

  await auth.login({ email, password });
});

Then('the login error message should be visible', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.assertInvalidLoginError();
});
