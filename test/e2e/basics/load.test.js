import { test, expect, chromium } from '@playwright/test';

test.describe("Basic Load", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("test/e2e/basics/locale.html");
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("Loaded test", async () => {
    expect(true).toBeTruthy();
  });
});

