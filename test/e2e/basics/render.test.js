const { test, expect, chromium } = require('@playwright/test');

test.describe("Render MapML resources test", () => {
    let page;
    let context;
    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext('');
        page = await context.newPage();
        await page.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
    });

    test.afterAll(async () => {
        await context.close();
    });

    test("Render map from application/xml document", async ()=> {
        await page.waitForTimeout(1000);
        const map = await page.$("xpath=//html/body/mapml-viewer");
        await page.waitForTimeout(1000);
        const lat = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('lat'));
        const lon = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('lon'));
        const zoom = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('zoom'));

        await expect(map).not.toEqual(null);
        await expect(page.url()).toEqual("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
        await expect(lat).toEqual('60.27815582468662');
        await expect(lon).toEqual('-89.7827040843159');
        await expect(zoom).toEqual('3');
    });

    test("Hash is updated on moveend, history items are not added", async ()=> {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Equal");
            await page.waitForTimeout(1000);
        }
        await expect(page.url()).toContain("#5,-89.7827040843159,60.27815582468662");
        await page.goBack({waitUntil: "networkidle"});
        await expect(page.url()).toContain("about:blank");
        await page.goForward({waitUntil: "networkidle"});
        await expect(page.url()).toContain("#5,-89.7827040843159,60.27815582468662");
    });

    test("Link with hash sets initial location", async () => {
        await page.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml#0,-90,45");
        await page.waitForTimeout(1000);
        const lat = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('lat'));
        const lon = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('lon'));
        const zoom = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('zoom'));

        await expect(lat).toEqual("45");
        await expect(lon).toEqual("-90");
        await expect(zoom).toEqual("0");
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
        await page.waitForTimeout(1000);
        await page.goto("test/e2e/basics/test.mapml");
        await page.waitForTimeout(1000);

        const map = await page.$("xpath=//html/body/mapml-viewer");
        await expect(map).not.toEqual(null);
        const projection = await page.$eval("xpath=//html/body/mapml-viewer",
            (viewer) => viewer.getAttribute('projection'));
        await expect(projection).toEqual("OSMTILE");
    }, {times: 1});

    test("Projection defaults to OSMTILE in the case of unknown projection", async () => {
        //Changes page.goto response (initial page load) to be of content type text/mapml
        await page.route("test/e2e/basics/unknown_projection.mapml", async route => {
            const response = await page.request.fetch("test/e2e/basics/unknown_projection.mapml");
            await route.fulfill({
                body: await response.body(),
                contentType: 'text/mapml'
            });
        });
        await page.waitForTimeout(1000);
        await page.goto("test/e2e/basics/unknown_projection.mapml");
        await page.waitForTimeout(1000);

        const projection = await page.$eval("xpath=//html/body/mapml-viewer",
            (map) => map.getAttribute('projection'));
        await expect(projection).toEqual("OSMTILE");
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
        await expect(projection).toEqual("CBMTILE");
        // if this issue gets fixed, the following will fail and should be reversed
        // https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/677
        const disabled = await page.$eval("xpath=//html/body/mapml-viewer/layer-",
            (layer) => layer.hasAttribute("disabled"));
        await expect(disabled).toBe(true);
        
    }, {times: 1});
});
