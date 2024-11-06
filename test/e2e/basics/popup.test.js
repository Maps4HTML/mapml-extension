import { test, expect, chromium } from '@playwright/test';

test.describe("Popup test", () => {
    let page;
    let context;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();

        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent("serviceworker");

        const id = background.url().split("/")[2];
        await page.goto('chrome-extension://' + id +'/popup.html');
    });

    test.afterAll(async () => {
        await context.close();
    });

    test("Turn on options", async ()=>{

        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Space"); // tabs and toggles show feature index (announce zoom is on by default)
        

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/locale.html", { waitUntil: "domcontentloaded" });
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);

        const featureIndexOverlayOutput = newPage.locator('.mapml-feature-index');
        const featureIndexOverlay = await featureIndexOverlayOutput.evaluate((output) => output.textContent);
        expect(featureIndexOverlay).not.toEqual(null);

        const announceZoomOutput = newPage.locator('.mapml-screen-reader-output');
        const announceZoom = await announceZoomOutput.evaluate((output) => output.textContent
        );
        expect(announceZoom).toEqual("zoom level 2");
        
        const scaleBarOutput = await newPage.locator('.mapml-screen-reader-output-scale');
        const announceScale = await scaleBarOutput.evaluate(
            (output) => output.textContent
        );
        expect(announceScale).toEqual("2 centimeters to 1000 kilometers");  

        await newPage.close();
    });

    test("Turn off options", async () => {
        await page.keyboard.press("Space");
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Space");

        await page.waitForTimeout(1000);
        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/locale.html", { waitUntil: "domcontentloaded" });
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);

        const viewer = newPage.locator('mapml-viewer');
        
        const featureIndexOverlayOutputExists = await viewer.evaluate((viewer) => viewer.shadowRoot.querySelector('.mapml-feature-index') !== null); 
        expect(featureIndexOverlayOutputExists).toBe(false);

        const announceZoomOutput = newPage.locator('.mapml-screen-reader-output');
        const announceZoomOutputContentExists = await announceZoomOutput.evaluate((output) => output.textContent !== "");
        expect(announceZoomOutputContentExists).toBe(false);

        await newPage.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml", { waitUntil: "domcontentloaded" });
        const map = await page.$("xpath=//html/body/mapml-viewer");
        expect(map).toEqual(null);
    });

    test("Change coordinate system for copying location", async () => {
        await page.bringToFront();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/popup.test.html", { waitUntil: "load" });
        await newPage.waitForTimeout(1000);
        await newPage.click("body > mapml-viewer");
        await newPage.keyboard.press("Shift+F10");
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(100);
        await newPage.keyboard.press("Enter");
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(100);
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(100);
        await newPage.keyboard.press("Enter");
        await newPage.waitForTimeout(100);

        const text = await newPage.evaluate(() => navigator.clipboard.readText());
        const coordinates = await newPage.evaluate((t) => {
          let d = document.createElement('div');
          d.insertAdjacentHTML('afterbegin', t);
          return d.querySelector('map-coordinates').textContent;
        },text); 
        expect(coordinates).toEqual("-8426877 5684775");
    });

    test("Change coordinate system for copying extent", async () => {
        await page.bringToFront();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/popup.test.html", { waitUntil: "load" });
        await newPage.waitForTimeout(500);
        await newPage.click("body > mapml-viewer");
        await newPage.keyboard.press("Shift+F10");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");

        let text = await newPage.evaluate(() => navigator.clipboard.readText());
        let expected = `<map-meta name=\"extent\" content=\"top-left-longitude=-76.57882690429689, top-left-latitude=45.74644367422244, bottom-right-longitude=-74.82101440429689, bottom-right-latitude=45.052180659942316\"></map-meta>`;
        expect(text).toEqual(expected);
    });
});
