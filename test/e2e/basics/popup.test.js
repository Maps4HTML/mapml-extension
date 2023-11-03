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

        const featureIndexOverlay = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div",
            (div) => div.querySelector("output.mapml-feature-index")
        );

        const announceZoom = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > output",
            (output) => output.textContent
        );

        const announceScale = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div >  output:nth-child(7)",
            (output) => output.textContent
        );

        await newPage.close();
        expect(featureIndexOverlay).not.toEqual(null);
        expect(announceZoom).toEqual("zoom level 2");
        expect(announceScale).toEqual("2 centimeters to 1000 kilometers");  
    });

    test("Turn off options", async () => {
        await page.keyboard.press("Space");
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Space");

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

    test("Change coordinate system for copying location", async () => {
        await page.bringToFront();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Enter");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/popup.test.html", { waitUntil: "load" });
        newPage.waitForTimeout(500);
        await newPage.click("body > mapml-viewer");
        await newPage.keyboard.press("Shift+F10");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");

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
        newPage.waitForTimeout(500);
        await newPage.click("body > mapml-viewer");
        await newPage.keyboard.press("Shift+F10");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");
        await newPage.keyboard.press("Tab");
        await newPage.keyboard.press("Enter");

        let text = await newPage.evaluate(() => navigator.clipboard.readText());
        let expected = `<map-meta name=\"extent\" content=\"top-left-longitude=-76.57882690429689, top-left-latitude=45.74644367422244, bottom-right-longitude=-74.82101440429689, bottom-right-latitude=45.052180659942316\"></map-meta>`;
        expect(text).toEqual(expected);
    })
});
