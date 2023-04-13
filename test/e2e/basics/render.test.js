import { test, expect, chromium } from '@playwright/test';

test.describe("Render MapML resources test", () => {
    let page;
    let context;
    let extensionPopup;
    let id;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
        page = context.pages().find((page) => page.url() === 'about:blank');
        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent("serviceworker");

        id = background.url().split("/")[2];
        extensionPopup = await context.newPage();
        await extensionPopup.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
        await page.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
    });

    test.afterAll(async () => {
        await context.close();
    });

    test("Render map from application/xml document", async ()=> {
        await page.waitForFunction(() => {
            const map = document.querySelector("mapml-viewer");
            if (map && map.getAttribute('lat') !== '0') {
                return map;
            }
        });
        const [map, lat, lon, zoom] = await page.$eval("mapml-viewer", (map) => [
            map,
            map.getAttribute('lat'),
            map.getAttribute('lon'),
            map.getAttribute('zoom'),
        ]);
        expect(map).not.toEqual(null);
        expect(page.url()).toEqual("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
        expect(lat).toEqual('60.27815582468662');
        expect(lon).toEqual('-89.7827040843159');
        expect(zoom).toEqual('3');
    });

    test("Hash is updated on moveend, history items are not added", async ()=> {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Equal");
            await page.waitForTimeout(1000);
        }
        await page.waitForTimeout(500);
        expect(page.url()).toContain("#5,-89.7827040843159,60.27815582468662");
        await page.goBack({waitUntil: "networkidle"});
        expect(page.url()).toContain("about:blank");
        await page.goForward({waitUntil: "networkidle"});
        expect(page.url()).toContain("#5,-89.7827040843159,60.27815582468662");
    });

    test("Link with hash sets initial location", async () => {
        await page.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml#0,-90,45");
        await page.waitForFunction(() => {
            const map = document.querySelector("mapml-viewer");
            if (map && map.getAttribute('lat') !== '0') {
                return map;
            }
        });
        const [map, lat, lon, zoom] = await page.$eval("mapml-viewer", (map) => [
            map,
            map.getAttribute('lat'),
            map.getAttribute('lon'),
            map.getAttribute('zoom')
        ]);

        expect(map).not.toEqual(null);
        expect(lat).toEqual("45");
        expect(lon).toEqual("-90");
        expect(zoom).toEqual("0");
    });

    test("Render map from text/mapml document", async () => {
        //Changes page.goto response (initial page load) to be of content type text/mapml
        await page.route("test/e2e/basics/test.mapml", async route => {
            const response = await page.request.fetch("test/e2e/basics/test.mapml");
            await route.fulfill({
                body: await response.body(),
                contentType: 'text/mapml'
            });
        });
        await page.goto("test/e2e/basics/test.mapml");
        const map = await page.waitForFunction(() => document.querySelector("mapml-viewer"));

        expect(map).not.toEqual(null);
        const projection = await page.$eval("xpath=//html/body/mapml-viewer",
            (viewer) => viewer.getAttribute('projection'));
        expect(projection).toEqual("OSMTILE");
    }, {times: 1});
    
    test("Do not render map from application/xml document when 'Render' is not checked", async () => {
        await extensionPopup.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
        await extensionPopup.keyboard.press("Tab"); // tab to Render MapML resources toggle
        await extensionPopup.keyboard.press("Space"); // toggles Render off
        // reload page, should not render
        await page.bringToFront();
        await page.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
        let map = null;
        try {
          let map = await page.$eval("mapml-viewer", (map) => map);
        } catch {};
        // page.$eval throws when it can't find the selector, so map should still be null
        expect(map).toEqual(null);
        expect(page.url()).toEqual("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
        await extensionPopup.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
        await extensionPopup.keyboard.press("Tab"); // tab to Render MapML resources toggle
        await extensionPopup.keyboard.press("Space"); // toggles Render on
    });
    
    test("Do not render map from text/mapml document when 'Render' is not checked", async () => {
        await extensionPopup.bringToFront();
        await extensionPopup.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
        await extensionPopup.keyboard.press("Tab"); // tab to Render MapML resources toggle
        await extensionPopup.keyboard.press("Space"); // toggles Render off
        await page.bringToFront();
        await page.goto("test/e2e/basics/test.mapml");
        let map = null;
        try {
          map = await page.$eval("mapml-viewer", (map) => map);
        } catch {};
        // page.$eval throws when it can't find the selector, so map should still be null
        expect(map).toEqual(null);
        await extensionPopup.goto('chrome-extension://' + id +'/popup.html', {waitUntil: "load"});
        await extensionPopup.keyboard.press("Tab"); // tab to Render MapML resources toggle
        await extensionPopup.keyboard.press("Space"); // toggles Render on
    });

    test("Projection defaults to OSMTILE in the case of unknown projection", async () => {
        //Changes page.goto response (initial page load) to be of content type text/mapml
        await page.route("test/e2e/basics/unknown_projection.mapml", async route => {
            const response = await page.request.fetch("test/e2e/basics/unknown_projection.mapml");
            await route.fulfill({
                body: await response.body(),
                contentType: 'text/mapml'
            });
        });
        await page.goto("test/e2e/basics/unknown_projection.mapml");
        const map = await page.waitForFunction(() => document.querySelector("mapml-viewer"));
        const projection = await map.getAttribute('projection');
        expect(projection).toEqual("OSMTILE");
    }, {times: 1});

    test("Projection from map-meta[content*=projection] attribute / mime type parameter", async () => {
        //Changes page.goto response (initial page load) to be of content type text/mapml
        await page.route("test/e2e/basics/content-type-projection.mapml", async route => {
            const response = await page.request.fetch("test/e2e/basics/content-type-projection.mapml");
            await route.fulfill({
                body: await response.body(),
                contentType: 'text/mapml'
            });
        });
        await page.waitForTimeout(1000);
        await page.goto("test/e2e/basics/content-type-projection.mapml");
        await page.waitForTimeout(1000);

        const projection = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('projection'));
        expect(projection).toEqual("CBMTILE");
        // if this issue gets fixed, the following will fail and should be reversed
        // https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/677
        const disabled = await page.$eval("xpath=//html/body/mapml-viewer/layer-",
            (layer) => layer.hasAttribute("disabled"));
        expect(disabled).toBe(true);
    }, {times: 1});
});
