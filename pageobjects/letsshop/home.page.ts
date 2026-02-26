export class HomePage {
  constructor(private page: any) {}
  async goto(url: string) { await this.page.goto(url); }
}
