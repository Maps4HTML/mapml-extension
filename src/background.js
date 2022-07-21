/**
 * Used to send back user location on demand, this goes around the need to ask the user
 * for permission on every site the extension runs on for their location
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (request.command === "get-location") {
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
        options: {},
      });
    }
  });

});

var needToReload = false;
var reloaded = false;
var isMapml = false

/**
 * Creates rule to turn response into text/html if the content is text/mapml or application/xml
 */
chrome.webRequest.onHeadersReceived.addListener(function (details) {
  let header = details.responseHeaders.find(i => i.name === "Content-Type");
  if(!header || reloaded) return;
  if(!(header.value.includes("application/xml") || header.value.includes("text/mapml"))) return;
  chrome.storage.local.get("options", function (result) {
    let generateMap = result.options ? result.options.generateMap : false;
    if(!generateMap) return;
    if(header.value.includes("text/mapml")) isMapml = true;
    needToReload = true;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset"]
    });
  });
}, {urls: ["<all_urls>"], types: ["main_frame"]}, ["responseHeaders"]);

/**
 * Checks document for mapml if the response is of type applicaiton/xml
 */
function sniffForMapML() {
  let mapml = document.querySelector("mapml-");
  return (mapml !== null);
}

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

/**
 * Reloads page if a rule has been created to activate it
 * Removes rule afterwards and executes scripts to generate map and import in the necessary components from resources
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(tab.status !== "complete") return;
  if(needToReload) {
    needToReload = false;
    chrome.scripting.executeScript({target: {tabId: tabId}, func: sniffForMapML},
        (results) => {
          if(results[0].result || isMapml) chrome.tabs.reload(tabId, function () {
            isMapml = false;
            reloaded = true;
          });
          else chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["ruleset"]
          });
    });
    return;
  }

  if(reloaded) {
    reloaded = false;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["ruleset"]
    });
    chrome.scripting.executeScript({target: {tabId: tabId}, func: createMap, args: [tab.url]},
        () => {
            chrome.scripting.insertCSS({target: {tabId: tabId}, files: ['resources/map.css']});
            chrome.scripting.executeScript({target: {tabId: tabId}, files: ['resources/webcomponents-bundle.js',
                'resources/importMapml.js']});
    });
  }
});