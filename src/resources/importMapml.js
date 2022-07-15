(async () => {
  const src = chrome.runtime.getURL("dist/mapml-viewer.js");
  const contentMain = await import(src);
})();