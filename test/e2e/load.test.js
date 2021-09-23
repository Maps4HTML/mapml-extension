import { driver } from "./driver";
import { until } from "selenium-webdriver";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

describe("Text Group", () => {
  beforeAll(async () => {
    await driver.navigate().to("https://maps4html.org/");
  });

  afterAll(async () => {
    await driver.quit();
  });

  test("Single test", async () => {
    expect(1).toBe(1);
  });
});

