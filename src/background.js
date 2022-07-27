/**
 * When the document has a mapml element, set the page content type to text/html,
 * reload page, execute scripts
 */
chrome.runtime.onMessage.addListener(function (message, sender) {
  if (message === "xml") {
    chrome.storage.local.get([`${sender.tab.id}`], function (items) {
      if(Object.keys(items).length > 0) {
        let tab = items[`${sender.tab.id}`];
        chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [tab.id]
        });
        chrome.storage.local.remove([`${sender.tab.id}`]);
        executeScripts(tab.id);
      }  else {
        let tab = sender.tab;
        chrome.declarativeNetRequest.updateSessionRules({
          addRules: [{
            "id": tab.id,
            "priority": 1,
            "action": {"type" :  "modifyHeaders",
              "responseHeaders":  [{"header": "Content-Type", "operation": "set", "value": "text/html"}]},
            "condition": {"resourceTypes": ["main_frame"], "tabIds": [tab.id]}
          }]
        }, () => {
          chrome.storage.local.set({[`${tab.id}`] : tab}, () => {
            chrome.tabs.reload(tab.id);
          });
        });
      }
    });
  } else if (message === "mapml") {
    executeScripts(sender.tab.id);
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

function createMap() {
  let el = document.querySelector("mapml-") ? document.querySelector("mapml-") : document.querySelector("pre");
  let mapml = el;
  if(el.nodeName === "pre") {
    let parser = new DOMParser();
    let doc = parser.parseFromString(el.innerText, "application/xml");
    if(doc.querySelector("mapml-")) mapml = doc;
    else return false;
  }
  document.body.removeChild(el);
  let map = document.createElement("mapml-viewer");
  let projection;
  if(mapml.querySelector("map-extent[units]")) projection = mapml.querySelector("map-extent").getAttribute("units");
  else if(mapml.querySelector("map-meta[projection]")) projection = mapml.querySelector("map-meta").getAttribute("projection");
  else projection = "OSMTILE";

  //Matches #int,float,float at the end of url
  let hash = window.location.href.match("([#])(\\d)(,[-]?\\d+[.]?\\d+)(,[-]?\\d+[.]?\\d+)$");
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
  layer.setAttribute("src", window.location.href);
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
  return true;
}

function executeScripts(tabId) {
  chrome.scripting.executeScript({target: {tabId: tabId}, func: createMap},
      (result) => {
        if(!result[0].result) return;
        chrome.scripting.insertCSS({target: {tabId: tabId}, files: ['resources/map.css']});
        chrome.scripting.executeScript({target: {tabId: tabId}, files: ['resources/webcomponents-bundle.js',
            'resources/importMapml.js']});
  });
}