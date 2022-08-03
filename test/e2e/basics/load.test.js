const { test, expect, chromium } = require('@playwright/test');

test.describe("Basic Load", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = await context.newPage();
    await page.goto("test/e2e/basics/locale.html");
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("Loaded test", async () => {
    expect(true).toBeTruthy();
  });
});

