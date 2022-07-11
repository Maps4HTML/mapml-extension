// this should be conditional, since we don't have to load mapml-viewer.js into
// every page, let's try to do so only when we're going to use it.
(async () => {
  const src = chrome.runtime.getURL("dist/mapml-viewer.js");
  const contentMain = await import(src);
})();