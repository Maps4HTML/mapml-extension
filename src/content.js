/**
 * Appends the map-options element to the documents head, used to initialize M.options
 */
document.addEventListener("readystatechange", () => {
  // customElements registry is not defined by this point
  if (document.querySelector("mapml-viewer") || document.querySelector("map[is='web-map']")) {
    /*
    TODO: add when you want to remove network requests for built in version
    let viewerScript = document.querySelector('script[src="https://unpkg.com/@maps4html/web-map-custom-element@latest/dist/mapml-viewer.js"]');
    if (viewerScript){
      viewerScript.src = chrome.runtime.getURL("/js/mapml-viewer.js");
    }*/
    chrome.storage.local.get("options", function (o) {
      let mapOptions = document.createElement("map-options");
      mapOptions.innerHTML = JSON.stringify(o.options || {});
      document.head.appendChild(mapOptions);
    });
  }
}, {once: true});

/**
 * Removes the map-options element from the document head after it's been used
 */
document.addEventListener("DOMContentLoaded", () => {
  let mapOptions = document.head.querySelector("map-options");
  if (mapOptions) document.head.removeChild(mapOptions);
}, {once: true});
