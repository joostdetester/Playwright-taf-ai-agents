import { request } from '@playwright/test';

export class SampleClient {
  constructor(private base: string) {}
  async getRoot() {
    // placeholder
    const ctx = await request.newContext();
    return await ctx.get(this.base || '/');
  }
}
