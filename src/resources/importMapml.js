(async () => {
  const src = chrome.runtime.getURL("dist/mapml.js");
  const contentMain = await import(src);
})();