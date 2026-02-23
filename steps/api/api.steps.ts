// steps/api/api.steps.ts
import { Given, When, Then } from '../bdd';
import { expect } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { projectConfig } from '../../config/project.config';

let lastResponse: any;

Given('the Library API is available', async function ({ request }: { request: APIRequestContext })  {
  // simpele ping naar base URL
  const res = await request.get(`${projectConfig.api.baseUrl}/`);
  expect(res.ok()).toBeTruthy();
});

When('I request all books from the library API', async ({ request }: { request: APIRequestContext }) => {
  lastResponse = await request.get(`${projectConfig.api.baseUrl}/Library/GetBook.php?AuthorName=Rahul%20Shetty`);
});

Then('the response status should be 200', async () => {
  expect(lastResponse.status()).toBe(200);
});



