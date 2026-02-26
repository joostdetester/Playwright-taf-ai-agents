// steps/ui/ui.steps.ts
import { Given, Then, When } from '../../bdd';
import { openApplication, assertHomepageTitle, openApplicationPath, assertCurrentUrlContains } from '../../../pageobjects/_shared/uiActions';

Given('I open the application', async ({ page, config, world, $testInfo }) => {
  await openApplication({
    page,
    config: { baseUrl: config.ui.baseUrl },
    world,
    testInfo: $testInfo,
  });
});

Then('I see the homepage title', async ({ page, config, world, $testInfo }) => {
  await assertHomepageTitle({
    page,
    config: { baseUrl: config.ui.baseUrl },
    world,
    testInfo: $testInfo,
  });
});

When('I open the path {string}', async ({ page, config, world, $testInfo }, path: string) => {
  await openApplicationPath(
    {
      page,
      config: { baseUrl: config.ui.baseUrl },
      world,
      testInfo: $testInfo,
    },
    path,
  );
});

Then('the current URL contains {string}', async ({ page, config, world, $testInfo }, fragment: string) => {
  await assertCurrentUrlContains(
    {
      page,
      config: { baseUrl: config.ui.baseUrl },
      world,
      testInfo: $testInfo,
    },
    fragment,
  );
});