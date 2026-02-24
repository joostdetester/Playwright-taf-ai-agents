import { Then } from '../bdd';
import { expect } from '@playwright/test';

Then('the API response status should be {int}', async ({ world }, status: number) => {
  const res = world?.lastResponse;
  if (!res) {
    throw new Error('No API response found on world (world.lastResponse). Ensure the API step sets world.lastResponse.');
  }

  // Some request wrappers expose status as number or via .status()
  const actual = typeof res.status === 'function' ? res.status() : res.status;
  expect(actual).toBe(Number(status));
});
