import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe("Locale Tests", () => {
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

  test("UI button titles", async () => {
    let zoomInTitle = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
      (tile) => tile.title
    );

    let zoomOutTitle = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
      (tile) => tile.title
    );

    let reloadTitle = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button",
      (tile) => tile.title
    );

    let fullScreenTitle = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a",
      (tile) => tile.title
    );

    expect(zoomInTitle).toBe("Zoom in");
    expect(zoomOutTitle).toBe("Zoom out");
    expect(reloadTitle).toBe("Reload");
    expect(fullScreenTitle).toBe("View fullscreen");
  });
});

test.describe("Other Locale Tests", () => {
  let svContext, svPage;
  test.beforeAll(async () => {
    let pathToExtension = path.join(__dirname, '../../../src/');
    // update to swedish because en and fr locales are 'forced' by the lang attribute
    svContext = await chromium.launchPersistentContext("",{locale: 'sv',
      headless: false,
      slowMo: 50,
      args: [
        '--lang=sv',
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
    let [background] = svContext.serviceWorkers();
    if (!background)
        background = await svContext.waitForEvent("serviceworker");
    const id = background.url().split("/")[2];
    let newPage = await svContext.newPage();
    await newPage.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
    svPage = await svContext.newPage();
    await svPage.goto("test/e2e/basics/locale.html", {waitUntil: "load"});
  });

  test.afterAll(async () => {
    await svContext.close();
  });

  test("UI button titles", async () => {
    let reloadTitle = await svPage.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button",
      (tile) => tile.title
    );
    
    expect(reloadTitle).toBe("Läs In Igen");
  });
});
