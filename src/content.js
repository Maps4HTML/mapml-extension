let options = {};

function loadOptions() {
  if(document.querySelector("mapml-viewer") || document.querySelector("web-map")) {
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
      script.setAttribute("type", "text/javascript")
      document.head.appendChild(script);
    });
  }
}
/*
use for injecting mapml.js file
let script = document.createElement('script');
script.src = chrome.runtime.getURL("/js/options.js");
script.setAttribute("type", "text/javascript")
document.head.appendChild(script);
*/

document.addEventListener("DOMContentLoaded",  () => {
  loadOptions();
});

window.onload = () => {
  window.postMessage(options, "*");
}