let options = {};

/**
 * Adds the js/options.js script to the DOM
 */
function loadOptionsScript() {
  if(document.querySelector("mapml-viewer") || document.querySelector("map[is='web-map']")) {
    /*
    TODO: add when you want to remove network requests for built in version
    let viewerScript = document.querySelector('script[src="https://unpkg.com/@maps4html/web-map-custom-element@latest/dist/mapml-viewer.js"]');
    if (viewerScript){
      viewerScript.src = chrome.runtime.getURL("/js/mapml-viewer.js");
    }*/
    chrome.storage.local.get("options", function (o) {
      options = o.options || {};
      let script = document.createElement('script');
      script.src = chrome.runtime.getURL("/js/options.js");
      document.head.appendChild(script);
    });
  }
}

/**
 * Handler used to add options.js script to the DOM on readyState 'interactive'
 */
let loadOptionsScriptHandler = function () {
  if (document.readyState === "interactive") {
    loadOptionsScript();
    document.removeEventListener("readystatechange", loadOptionsScriptHandler);
  }
};
document.addEventListener("readystatechange", loadOptionsScriptHandler);

/**
 * posts message passing the options, the listener for this message
 * is found in the injected script
 */
document.addEventListener("DOMContentLoaded", () => {
  window.postMessage({type:"set-options", options: options}, "*");
}, {once: true});
