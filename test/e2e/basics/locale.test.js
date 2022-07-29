const playwright = require("playwright");
const path = require("path");
describe("Locale Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "test/e2e/basics/locale.html");
  });

  afterAll(async () => {
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

describe("Other Locale Tests", () => {
  let frContext, frPage;
  beforeAll(async () => {
    let pathToExtension = path.join(__dirname, '../../../src/');

    frContext = await playwright["chromium"].launchPersistentContext("",{
      headless: false,
      slowMo: 50,
      args: [
        '--lang=fr',
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ],
    });
    frPage = await frContext.newPage();
    await frPage.goto(PATH + "test/e2e/basics/locale.html");
  });

  afterAll(async () => {
    await frContext.close();
  });

  test("UI button titles", async () => {
    // let zoomInTitle = await frPage.$eval(
    //   "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
    //   (tile) => tile.title
    // );
    //
    // let zoomOutTitle = await frPage.$eval(
    //   "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
    //   (tile) => tile.title
    // );

    let reloadTitle = await frPage.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button",
      (tile) => tile.title
    );

    // let fullScreenTitle = await frPage.$eval(
    //   "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a",
    //   (tile) => tile.title
    // );

    // expect(zoomInTitle).toBe("Zoom in");
    // expect(zoomOutTitle).toBe("Zoom out");
    expect(reloadTitle).toBe("Rechargez");
    // expect(fullScreenTitle).toBe("View fullscreen");
  });
});
