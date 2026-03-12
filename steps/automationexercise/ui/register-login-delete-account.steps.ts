import { When } from '../../bdd';
import { AutomationExerciseSignupLoginPage } from '../../../pageobjects/automationexercise/signup-login.page';
import { getAeUserStorePath, loadAeUser } from '../support/ae-user-store';

When('the user logs in with valid credentials', async ({ page, world }) => {
  const persisted = loadAeUser();
  const email = persisted?.email ?? process.env.AE_EMAIL;
  const password = persisted?.password ?? process.env.AE_PASSWORD;
  const name = persisted?.name ?? process.env.AE_NAME;

  if (!email || !password || !name) {
    throw new Error(
      `No login credentials available. Create/persist a user first (store: ${getAeUserStorePath()}) or set AE_EMAIL/AE_PASSWORD/AE_NAME env vars.`,
    );
  }

  (world as any).ae = { name, email, password };

  const auth = new AutomationExerciseSignupLoginPage(page);
  await auth.login({ email, password });

  // Assert happens in the next step ("logged in as").
});
