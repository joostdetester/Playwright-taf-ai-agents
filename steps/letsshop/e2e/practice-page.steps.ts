import { expect, Page } from '@playwright/test';
import { Given, Then, When } from '../bdd';
import { PracticePage } from '../../ui/pages/practice.page';
import { AcademyPage } from '../../ui/pages/academy.page';

type PracticeWorld = {
  practiceRelatedPage?: Page;
  lastDialogMessage?: string;
};

Given('the user is on the practice page', async ({ page, config }) => {
  const practicePage = new PracticePage(page);
  await practicePage.goto(config.ui.baseUrl);
  await practicePage.assertLoaded();
});

When('the user enters practice name {string}', async ({ page }, name: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.enterName(name);
});

When('the user selects practice radio option {string}', async ({ page }, optionLabel: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.selectRadioOption(optionLabel);
});

When('the user selects practice checkboxes:', async ({ page }, dataTable) => {
  const options: string[] = (dataTable.hashes() as Array<{ option: string }>).map((r) => String(r.option));
  const practicePage = new PracticePage(page);
  await practicePage.selectCheckboxes(options);
});

When('the user selects practice dropdown option {string}', async ({ page }, optionLabel: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.selectStaticDropdownOption(optionLabel);
});

When('the user selects practice country {string}', async ({ page }, country: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.selectCountryFromAutocomplete(country);
});

When('the user opens the practice related page in a new tab', async ({ page, world }) => {
  const practicePage = new PracticePage(page);
  const related = await practicePage.openRelatedPageInNewTab();
  (world as PracticeWorld).practiceRelatedPage = related;
});

Then('the practice related page should be displayed', async ({ world }) => {
  const related = (world as PracticeWorld).practiceRelatedPage;
  if (!related) throw new Error('No related page found. Ensure the step that opens the new tab ran successfully.');

  const academyPage = new AcademyPage(related);
  await academyPage.assertLoaded();
});

When('the user returns to the practice page', async ({ page, world }) => {
  const related = (world as PracticeWorld).practiceRelatedPage;
  if (related && !related.isClosed()) {
    await related.close();
  }

  await page.bringToFront();
  const practicePage = new PracticePage(page);
  await practicePage.assertLoaded();
});

When('the user triggers a practice alert with name {string} and accepts it', async ({ page, world }, name: string) => {
  const practicePage = new PracticePage(page);
  const message = await practicePage.triggerAlertAndAccept(name);
  (world as PracticeWorld).lastDialogMessage = message;
});

Then('the practice alert message should contain {string}', async ({ world }, expected: string) => {
  const message = (world as PracticeWorld).lastDialogMessage;
  if (!message) throw new Error('No dialog message captured. Ensure the alert step ran successfully.');
  expect(message.toLowerCase()).toContain(expected.toLowerCase());
});

Then('the practice web table should contain {string}', async ({ page }, expectedText: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.assertWebTableContains(expectedText);
});

Then('the practice iframe should show link {string}', async ({ page }, linkText: string) => {
  const practicePage = new PracticePage(page);
  await practicePage.assertIframeShowsLink(linkText);
});
