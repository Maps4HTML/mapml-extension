/**
 * Appends the map-options element to the documents head, used to initialize M.options
 */
document.addEventListener("readystatechange", () => {
  // customElements registry is not defined by this point
  if (document.querySelector("mapml-viewer") || document.querySelector("map[is='web-map']")) {
    /*
    TODO: add when you want to remove network requests for built in version
    let viewerScript = document.querySelector('script[src="https://unpkg.com/@maps4html/mapml@latest/dist/mapml-viewer.js"]');
    if (viewerScript){
      viewerScript.src = chrome.runtime.getURL("/js/mapml-viewer.js");
    }*/
    chrome.storage.local.get("options", function (obj) {
      let mapOptionsElem = document.createElement("map-options");
      let options = obj.options || {};

      let msgs = ["cmBack", "cmForward", "cmReload", "cmToggleControls", 
        "cmCopyCoords", "cmToggleDebug", "cmCopyMapML", "cmCopyExtent", 
        "cmCopyLocation", "cmPasteLayer", "cmViewSource", "lmZoomToLayer", 
        "lmCopyLayer", "lmZoomToExtent", "lmCopyExtent", "lcOpacity", "btnZoomIn", "btnZoomOut", "btnAttribution", "btnFullScreen", 
        "btnExitFullScreen", "btnLocTrackOn", "btnMyLocTrackOn", 
        "btnLocTrackOff", "btnLocTrackLastKnown", "btnMyLastKnownLocTrackOn",
        "amZoom", "amColumn", "amRow", "amMaxZoom", "amMinZoom", "amZoomedOut", 
        "amDraggedOut", "amEastBound", "amWestBound", "amNorthBound", "amSouthBound", 
        "kbdShortcuts", "kbdMovement", "kbdFeature", "kbdPanUp", "kbdPanDown", 
        "kbdPanLeft", "kbdPanRight", "kbdPanIncrement", "kbdZoom", 
        "kbdPrevFeature", "kbdNextFeature", "dfLayer", "dfExtent", "dfPastedLayer",
        "popupZoom","fIndexNoFeatures"
      ];

      options.locale = {};
      for(let msg of msgs){
        options.locale[msg] = chrome.i18n.getMessage(msg);
      }

      mapOptionsElem.innerHTML = JSON.stringify(options);
      document.head.appendChild(mapOptionsElem);
    });
  }
}, {once: true});

/**
 * Removes the map-options element from the document head after it's been used
 */
document.addEventListener("DOMContentLoaded", () => {
  if(!document.head) return;
  let mapOptions = document.head.querySelector("map-options");
  if (mapOptions) document.head.removeChild(mapOptions);
}, {once: true});
