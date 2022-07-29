describe("Basic Load", () => {
  beforeAll(async () => {
    await page.goto(PATH + "test/e2e/basics/locale.html");
  });

  afterAll(async () => {
    await context.close();
  });

  test("Loaded test", async () => {
    expect(true).toBeTruthy();
  });
});

