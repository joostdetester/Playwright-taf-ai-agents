import { test as base } from 'playwright-bdd';
import { projectConfig } from '../config/project.config';
import { createWorld, World } from './world';

type BddFixtures = {
  config: typeof projectConfig;
  world: World;
};

export const test = base.extend<BddFixtures>({
  config: async ({}, use) => {
    await use(projectConfig);
  },
  world: async ({}, use) => {
    await use(createWorld());
  },
});