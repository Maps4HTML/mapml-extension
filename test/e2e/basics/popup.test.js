var CryptoJS = require("crypto-js");
describe("Popup test", () => {
    beforeAll(async () => {
        //Calculate unpacked extension id
        let path = process.cwd();
        let os = await page.evaluate(() => navigator.userAgent);
        let encode = CryptoJS.enc.Utf16LE.parse(path + "\\src" );
        if(os.indexOf("Windows") === -1) encode = CryptoJS.enc.Utf8.parse(path + "/src");
        let hash = CryptoJS.SHA256(encode);
        let digest = hash.toString(CryptoJS.enc.Hex);
        let id = [];
        for(let i in digest){
            id.push(String.fromCharCode(parseInt(digest[i], 16) + 97));
        }
        id = id.join('').substr(0, 32);
        await page.goto('chrome-extension://' + id +'/popup.html');
    });

    afterAll(async () => {
        await context.close();
    });

    test("Turn on options", async ()=>{
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);
        }
        for(let i = 0; i < 2; i++){
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);
            await page.keyboard.press("Space");
            await page.waitForTimeout(500);
        }
        let newPage = await context.newPage();
        await newPage.waitForTimeout(1000);
        await newPage.goto(PATH + "basics/locale.html");
        await newPage.waitForTimeout(500);
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
            (output) => output.innerHTML
        );

        await newPage.close();
        await expect(featureIndexOverlay === null).toEqual(false);
        await expect(announceMovement).toEqual("zoom level 2 column 10 row 11");
    });

    test("Clear storage", async ()=>{
        await page.keyboard.press("Space");
        await page.waitForTimeout(500);
        for(let i = 0; i < 2; i++) {
            await page.keyboard.press("Shift+Tab");
            await page.waitForTimeout(500);
            await page.keyboard.press("Space");
            await page.waitForTimeout(500);
        }

        await page.reload();
        await page.waitForTimeout(1000);
        let announceMoveOption = await page.locator('[id=announceMovement]').isChecked();
        let featureIndexOverlayOption = await page.locator('[id=featureIndexOverlayOption]').isChecked();
        let renderMapOption = await page.locator('[id=renderMap]').isChecked();
        await expect(announceMoveOption).toBe(false);
        await expect(featureIndexOverlayOption).toBe(false);
        await expect(renderMapOption).toBe(false);
    });

    test("Check if options are off", async ()=>{
        let newPage = await context.newPage();
        await newPage.waitForTimeout(1000);
        await newPage.goto(PATH + "basics/locale.html");
        await newPage.waitForTimeout(500);
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
            (output) => output.innerHTML
        );

        await newPage.goto("https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/?alt=xml");
        await newPage.waitForTimeout(1000);
        const map = await page.$("xpath=//html/body/mapml-viewer");

        await expect(featureIndexOverlay).toEqual(null);
        await expect(output).toEqual("");
        await expect(map).toEqual(null);
    });
});