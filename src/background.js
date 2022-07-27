/**
 * When the document has a mapml element, set the page content type to text/html,
 * reload page, execute scripts
 */
chrome.runtime.onMessage.addListener(function (message, sender) {
  if (message === "xml" || message === "mapml") {
    chrome.storage.local.get([`${sender.tab.id}`], function (items) {
      if(Object.keys(items).length > 0) {
        let tab = items[`${sender.tab.id}`];
        chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [tab.id]
        });
        chrome.storage.local.remove([`${sender.tab.id}`]);
        executeScripts(tab, "mapml-");
      } else if (message === "mapml") {
        executeScripts(sender.tab, "pre");
      } else {
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

function createMap(url, element) {
  let mapml = document.querySelector(element);
  document.body.removeChild(mapml);
  let map = document.createElement("mapml-viewer");
  let projection;
  if(element === "mapml-")  projection = mapml.querySelector("map-extent").getAttribute("units");
  if(element === "pre") {
    let parser = new DOMParser();
    let doc = parser.parseFromString(mapml.innerText, "application/xml");
    projection = doc.querySelector("map-extent").getAttribute("units");
  }
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

function executeScripts(tab, element) {
  chrome.scripting.executeScript({target: {tabId: tab.id}, func: createMap, args: [tab.url, element]},
      () => {
        chrome.scripting.insertCSS({target: {tabId: tab.id}, files: ['resources/map.css']});
        chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['resources/webcomponents-bundle.js',
            'resources/importMapml.js']});
  });
}