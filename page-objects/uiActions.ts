import { Page, TestInfo } from '@playwright/test';
import { World } from '../../steps/world';

export type UIActionContext = {
  page: Page;
  config: { baseUrl: string };
  world: World;
  testInfo: TestInfo;
};

export async function openApplication(ctx: UIActionContext) {
  await ctx.page.goto(ctx.config.baseUrl);
}

export async function openApplicationPath(ctx: UIActionContext, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  await ctx.page.goto(`${ctx.config.baseUrl}${normalizedPath}`);
}

export async function assertHomepageTitle(ctx: UIActionContext) {
  const title = await ctx.page.title();
  ctx.testInfo.attach('page-title', { body: title, contentType: 'text/plain' });
  if (!title) throw new Error('No title found');
}

export async function assertCurrentUrlContains(ctx: UIActionContext, fragment: string) {
  const currentUrl = ctx.page.url();
  ctx.testInfo.attach('current-url', { body: currentUrl, contentType: 'text/plain' });
  if (!currentUrl.includes(fragment)) {
    throw new Error(`Expected URL to contain "${fragment}", but got "${currentUrl}"`);
  }
}
