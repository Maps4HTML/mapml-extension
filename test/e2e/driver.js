import { Builder } from "selenium-webdriver";
import { Browser, PageLoadStrategy } from "selenium-webdriver/lib/capabilities";
import chrome from "selenium-webdriver/chrome";
import "chromedriver";
import * as fs from "fs";
import * as path from "path";

const encodeExt = file => {
  const stream = fs.readFileSync(path.resolve(file));
  return Buffer.from(stream).toString('base64');
};

const getChromeDriver = () => {
  return new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(new chrome.Options()
      .setPageLoadStrategy(PageLoadStrategy.NORMAL)
      .headless()
      .addExtensions(encodeExt("./test/e2e/mapml-extension.crx")))
    .build();
}

export const driver = getChromeDriver();