describe("Popup test", () => {
    beforeAll(async () => {
        await page.goto('chrome-extension://ldmdnbmbifafmfjnfidankbbdegfpnkp/popup.html');
    });

    afterAll(async () => {
        await context.close();
    });

    test("Turn on options", async ()=>{
        let extension = page;
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);
        }
        await extension.keyboard.press("Space");
        await extension.waitForTimeout(500);

        let newPage = await context.newPage();
        await newPage.waitForTimeout(1000);
        await newPage.goto(PATH + "basics/locale.html");
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);
        const output = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > output",
            (output) => output.innerHTML
        );
        await newPage.close();
        await expect(output).toEqual("zoom level 2 column 10 row 11");
    });

    test("Clear storage", async ()=>{
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);
        }
        await page.keyboard.press("Space");
        await page.waitForTimeout(500);
        await page.reload();
        await page.waitForTimeout(1000);
        let announceMoveOption = await page.locator('[id=announceMovement]').isChecked();
        expect(announceMoveOption).toBe(false);
    });

    test("Check if options are off", async ()=>{
        let newPage = await context.newPage();
        await newPage.waitForTimeout(1000);
        await newPage.goto(PATH + "basics/locale.html");
        await newPage.keyboard.press("Tab");
        await newPage.waitForTimeout(500);
        await newPage.keyboard.press("ArrowUp");
        await newPage.waitForTimeout(1000);
        const output = await newPage.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > output",
            (output) => output.innerHTML
        );
        await expect(output).toEqual("");
    });
});