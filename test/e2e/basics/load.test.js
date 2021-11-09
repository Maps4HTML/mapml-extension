describe("Basic Load", () => {
  beforeAll(async () => {
    await page.goto(PATH + "basics/locale.html");
  });

  afterAll(async () => {
    await context.close();
  });

  test("Loaded test", async () => {
    expect(true).toBeTruthy();
  });
});

