import { test as base } from 'playwright-bdd';
import { allure } from 'allure-playwright';
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

async function safeAllure(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    // Allure calls should never fail the test run (e.g. when running without the Allure reporter).
  }
}

function normalizeTag(tag: string): string {
  const trimmed = (tag ?? '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
}

test.beforeEach(async ({}, testInfo) => {
  const rawTags: string[] = Array.isArray((testInfo as any).tags) ? ((testInfo as any).tags as string[]) : [];
  const tags = rawTags.map(normalizeTag).filter(Boolean);

  if (tags.length) {
    await safeAllure(() => allure.tags(...tags));
  }

  const sutTags = new Set(['bookstore', 'greenkart', 'letsshop', 'petstore']);
  const typeTags = new Set(['api', 'ui', 'db', 'e2e']);

  const sut = tags.find((t) => sutTags.has(t));
  if (sut) {
    await safeAllure(() => allure.epic(sut));
    await safeAllure(() => allure.label('sut', sut));
  }

  const type = tags.find((t) => typeTags.has(t));
  if (type) {
    await safeAllure(() => allure.feature(type));
    await safeAllure(() => allure.label('type', type));
  }

  if (tags.includes('critical')) {
    await safeAllure(() => allure.severity('critical'));
  } else if (tags.includes('smoke')) {
    await safeAllure(() => allure.severity('normal'));
  }
});