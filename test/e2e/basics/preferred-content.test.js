import { test, expect, chromium } from '@playwright/test';

test.describe("Preferred content test", () => {
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

    test("Default map content type preference", async ()=>{
        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/preferred-content.html", { waitUntil: "domcontentloaded" });
        await newPage.waitForTimeout(500);
        
        const layer = newPage.getByTestId('test-layer');
        const label = await layer.evaluate((l) => l._layerControlLabel.textContent);
        expect(label).toEqual('Image content');

        await newPage.close();
    });

    test("User prefers feature content type", async () => {
        // "page" is the extension popup, hasn't been closed so still open in a 
        // browser tab somewhere...
        await page.bringToFront();
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab"); // tab to the content preference select
        await page.keyboard.press("ArrowDown"); 
        await page.keyboard.press("ArrowDown"); 
        await page.keyboard.press("ArrowDown"); // features is third in the list
        
        // "newPage" is the user / test page

        let newPage = await context.newPage();
        await newPage.goto("test/e2e/basics/preferred-content.html", { waitUntil: "domcontentloaded" });
        await newPage.waitForTimeout(1000);

        const layer = newPage.getByTestId('test-layer');
        const label = await layer.evaluate((l) => l._layerControlLabel.textContent);
        expect(label).toEqual('Feature content');
    });
    
    test("Multiple preferences can be expressed by user", async () => {
      await page.bringToFront();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); 
      // features is currently selected, so need a tricky set of key presses
      await page.keyboard.press("ArrowUp"); 
      await page.keyboard.press("ArrowUp"); 
      await page.keyboard.press("Shift+ArrowDown"); 
      await page.keyboard.press("Shift+ArrowDown"); 
      await page.keyboard.press("Shift+ArrowDown"); 
      let newPage = await context.newPage();
      await newPage.goto("test/e2e/basics/preferred-content.html", { waitUntil: "domcontentloaded" });
      await newPage.waitForTimeout(1000);
      let map = newPage.getByTestId('viewer');
      const matches = await map.evaluate((map)=>{
        return map.matchMedia('(prefers-map-content: image) and (prefers-map-content: tile) and (prefers-map-content: feature) and (prefers-map-content: table)').matches;
      });
      expect(matches).toBe(true);
    });
    test("Multiple disjoint preferences can be expressed by user", async () => {
      await page.bringToFront();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); 
      await page.keyboard.press("ArrowUp"); 
      await page.keyboard.press("ArrowUp"); 
      await page.keyboard.press(" "); // select tiles option
      await page.keyboard.press("Control+ArrowDown"); 
      await page.keyboard.press("Control+ArrowDown"); 
      await page.keyboard.press(" "); // select tables option
      let newPage = await context.newPage();
      await newPage.goto("test/e2e/basics/preferred-content.html", { waitUntil: "domcontentloaded" });
      await newPage.waitForTimeout(1000);
      let map = newPage.getByTestId('viewer');
      const matches = await map.evaluate((map)=>{
        return map.matchMedia('(not (prefers-map-content: image)) and (prefers-map-content: tile) and (not (prefers-map-content: feature)) and (prefers-map-content: table)').matches;
      });
      expect(matches).toBe(true);
    });

});
