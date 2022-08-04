import { test, expect, chromium } from '@playwright/test';

test.describe("Popup test", () => {
    let page;
    let context;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
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
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Tab");
            await page.keyboard.press("Space");
        }

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/locale.html", { waitUntil: "domcontentloaded" });
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);

        const featureIndexOverlay = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div",
            (div) => div.querySelector("output.mapml-feature-index")
        );

        const announceMovement = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > output",
            (output) => output.textContent
        );

        await newPage.close();
        expect(featureIndexOverlay).not.toEqual(null);
        expect(announceMovement).toEqual("zoom level 2 column 10 row 11");
    });

    test("Turn off options", async () => {
        await page.keyboard.press("Space");
        for(let i = 0; i < 2; i++) {
            await page.keyboard.press("Shift+Tab");
            await page.keyboard.press("Space");
        }

        await page.waitForTimeout(1000);
        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/locale.html", { waitUntil: "domcontentloaded" });
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);

        const featureIndexOverlay = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div",
            (div) => div.querySelector("output.mapml-feature-index")
        );

        const output = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > output",
            (output) => output.textContent
        );

        await newPage.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml", { waitUntil: "domcontentloaded" });
        const map = await page.$("xpath=//html/body/mapml-viewer");

        expect(featureIndexOverlay).toEqual(null);
        expect(output).toEqual("");
        expect(map).toEqual(null);
    });
});
