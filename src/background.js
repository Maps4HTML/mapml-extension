chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /**
   * When the document has a mapml element, set the page content type to text/html,
   * reload page, execute scripts
   */
  if (message === "hasMapML") {
    chrome.storage.local.get("reloaded", function (items) {
      if(items.reloaded) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ["ruleset"]
        });
        chrome.storage.local.get("tab", function (items) {
          let tab = items.tab;
          chrome.storage.local.remove(["tab", "reloaded"]);
          chrome.scripting.executeScript({target: {tabId: tab.id}, func: createMap, args: [tab.url]},
              () => {
                chrome.scripting.insertCSS({target: {tabId: tab.id}, files: ['resources/map.css']});
                chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['resources/webcomponents-bundle.js',
                    'resources/importMapml.js']});
              });
        });
      } else {
        let tab = sender.tab;
        chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ["ruleset"]
        }, () => {
          chrome.storage.local.set({reloaded: true, tab: tab}, () => {
            chrome.tabs.reload(tab.id);
          });
        });
      }
    });
  }
  /**
   * Used to send back user location on demand, this goes around the need to ask the user
   * for permission on every site the extension runs on for their location
   */
  else if (request.command === "get-location") {
    navigator.geolocation.getCurrentPosition (function (position) {
      sendResponse ({
        lon: position.coords.longitude,
        lat: position.coords.latitude,
      });
    });
    return true;
  }
});

/**
 * Runs on installs and updates once
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("options", function (obj) {
    if(!obj.options){
      chrome.storage.local.set({
        options: {renderMap: true},
      });
    }
  });

});

function createMap(url) {
  let mapml = document.querySelector("mapml-");
  document.body.removeChild(mapml);
  let map = document.createElement("mapml-viewer");
  let projection = mapml.querySelector("map-extent").getAttribute("units");
  //Matches #int,float,float at the end of url
  let hash = url.match("([#])(\\d)(,[-]?\\d+[.]?\\d+)(,[-]?\\d+[.]?\\d+)$");
  let lat = hash ? hash[4].slice(1) : "0";
  let lon = hash ? hash[3].slice(1) : "0";
  let zoom = hash ? hash[2] : "0";
  let focus = !hash;
  map.setAttribute("projection", projection);
  map.setAttribute("controls", "true");
  map.setAttribute("lat", lat);
  map.setAttribute("lon", lon);
  map.setAttribute("zoom", zoom);
  let layer = document.createElement("layer-");
  layer.setAttribute("src", url);
  layer.setAttribute("checked", "true");
  layer.addEventListener("extentload", function () {
    let title = document.createElement("title");
    title.innerText = layer.label;
    document.head.appendChild(title);
    if(focus) layer.focus();
  });
  map.appendChild(layer);
  map.addEventListener("moveend", function () {
    let map = document.querySelector("mapml-viewer");
    //Focus fires moveend so if the url has no initial hash, return
    if(focus) {
      focus = false;
      return;
    }
    window.history.replaceState('','','#' + map.zoom + "," + map.lon + "," + map.lat);
  });
  document.body.appendChild(map);

  window.addEventListener("hashchange", function (e) {
    let hash = e.newURL.match("([#])(\\d)(,[-]?\\d+[.]?\\d+)(,[-]?\\d+[.]?\\d+)$");
    map.zoomTo(hash[4].slice(1), hash[3].slice(1), hash[2]);
  });
}