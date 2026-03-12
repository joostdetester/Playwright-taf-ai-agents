import { Then, When } from '../../bdd';
import { faker } from '@faker-js/faker';
import { AutomationExerciseSignupLoginPage } from '../../../pageobjects/automationexercise/signup-login.page';
import { AutomationExerciseAccountCreatedPage } from '../../../pageobjects/automationexercise/account-created.page';
import { saveAeUser } from '../support/ae-user-store';

type AeWorld = {
  ae?: {
    name: string;
    email: string;
    password: string;
  };
};

const allowedCountries = ['India', 'United States', 'Canada', 'Australia', 'Israel', 'New Zealand', 'Singapore'] as const;

When('the user signs up with a generated name and a unique email', async ({ page, world }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  const name = faker.name.firstName();
  const uniqueEmail = faker.internet.email(name, undefined, 'example.com').toLowerCase();

  await auth.signupNewUser({ name, email: uniqueEmail });

  (world as AeWorld).ae = {
    name,
    email: uniqueEmail,
    password: '',
  };
});

When('the user signs up as {string} with a unique email', async ({ page, world }, name: string) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  const uniqueEmail = faker.internet.email(name, undefined, 'example.com').toLowerCase();

  await auth.signupNewUser({ name, email: uniqueEmail });

  (world as AeWorld).ae = {
    name,
    email: uniqueEmail,
    password: '',
  };
});

Then('the enter account information page should be visible', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.assertEnterAccountInformationVisible();
});

When('the user completes account registration with a generated password', async ({ page, world }) => {
  const ae = (world as AeWorld).ae;
  if (!ae) throw new Error('No created user found in world. Ensure the signup step ran successfully.');

  const generatedPassword = faker.random.alphaNumeric(12);
  ae.password = generatedPassword;

  const country = faker.helpers.arrayElement([...allowedCountries]);

  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.completeAccountRegistration({
    password: generatedPassword,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    company: faker.company.name().slice(0, 30),
    address1: faker.address.streetAddress().slice(0, 60),
    address2: faker.address.secondaryAddress().slice(0, 60),
    country,
    state: faker.address.state().slice(0, 30),
    city: faker.address.city().slice(0, 30),
    zipCode: faker.address.zipCode('#####'),
    mobileNumber: faker.phone.number('##########'),
    submit: false,
  });
});

When('the user completes account registration with password {string}', async ({ page, world }, password: string) => {
  const ae = (world as AeWorld).ae;
  if (!ae) throw new Error('No created user found in world. Ensure the signup step ran successfully.');

  ae.password = password;

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const city = faker.address.city();
  const state = faker.address.state();
  const country = faker.helpers.arrayElement([...allowedCountries]);

  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.completeAccountRegistration({
    password,
    firstName,
    lastName,
    company: faker.company.name().slice(0, 30),
    address1: faker.address.streetAddress().slice(0, 60),
    address2: faker.address.secondaryAddress().slice(0, 60),
    country,
    state: state.slice(0, 30),
    city: city.slice(0, 30),
    zipCode: faker.address.zipCode('#####'),
    mobileNumber: faker.phone.number('##########'),
    submit: false,
  });
});

When('the user opts into newsletters and partner offers', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.optInNewsletterAndOffers();
});

When('the user creates the account', async ({ page }) => {
  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.submitAccountRegistration();
});

Then('the account created message should be visible', async ({ page, world, $testInfo }) => {
  const created = new AutomationExerciseAccountCreatedPage(page);
  await created.assertAccountCreated();
  const ae = (world as AeWorld).ae;

  const rawTags: string[] = Array.isArray(($testInfo as any)?.tags) ? (($testInfo as any).tags as string[]) : [];
  const normalizedTags = rawTags.map((t) => String(t ?? '').trim().replace(/^@/, '')).filter(Boolean);
  const isDeleteAccountScenario = normalizedTags.includes('delete-account');

  // Don't persist credentials for an account we delete in the same scenario.
  if (!isDeleteAccountScenario && ae?.email && ae?.password && ae?.name) {
    saveAeUser({ name: ae.name, email: ae.email, password: ae.password });
  }
});

When('the user continues after account creation', async ({ page }) => {
  const created = new AutomationExerciseAccountCreatedPage(page);
  await created.continue();
});
