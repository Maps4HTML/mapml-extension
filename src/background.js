/**
 * When the document has a mapml element, set the page content type to text/html,
 * reload page, execute scripts
 */
chrome.runtime.onMessage.addListener(function (message, sender) {
  if (!sender.tab) {
    // This message did not come from a tab but from other source like popup or DevTools.
    // Extension currently does not use such messaging so we should ignore this message.
    console.warn('BG got unexpected message', message, sender);
    return;
  }

  const tabId = sender.tab.id;
  if (message === "html") {
    executeScripts(tabId);
    try {
      // If document initially had "text/html" content type, we do not have a rule registered.
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [tabId]
      });
    } catch {};
  } else if (message === "xml") {
    chrome.declarativeNetRequest.updateSessionRules({
      addRules: [{
        "id": tabId,
        "priority": 1,
        "action": {
          "type" :  "modifyHeaders",
          "responseHeaders":  [{"header": "Content-Type", "operation": "set", "value": "text/html"}]
        },
        "condition": {"resourceTypes": ["main_frame"], "tabIds": [tabId]}
      }]
    }, () => chrome.tabs.reload(tabId));
  } else if (message === "mapml") {
    executeScripts(tabId);
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
  if(el.nodeName === "PRE") {
    let parser = new DOMParser();
    let doc = parser.parseFromString(el.innerText, "application/xml");
    if(doc.querySelector("mapml-")) mapml = doc;
    else return false;
  }
  document.body.removeChild(el);
  let map = document.createElement("mapml-viewer");
  let projection;
  if(mapml.querySelector("map-extent[units]"))
    projection = mapml.querySelector("map-extent[units]").getAttribute("units");
  else if(mapml.querySelector("map-meta[name=projection]"))
    projection = mapml.querySelector("map-meta[name=projection]").getAttribute("content");
  //content="text/mapml;projection=..."
  else if(mapml.querySelector("map-meta[content*=projection]")) {
    let content = mapml.querySelector("map-meta[content*=projection]").getAttribute("content");
    projection = content.match("projection=(\\w*)")[1];
  }
  else projection = "OSMTILE";

  //Matches #int,float,float at the end of url
  let hash = window.location.href.match("([#])(\\d)(,[-]?\\d+[.]?\\d+)(,[-]?\\d+[.]?\\d+)$");
  let lat = hash ? hash[4].slice(1) : "0";
  let lon = hash ? hash[3].slice(1) : "0";
  let zoom = hash ? hash[2] : "0";
  let focus = !hash;
  map.setAttribute("projection", projection);
  map.setAttribute("controls", "");
  map.setAttribute("lat", lat);
  map.setAttribute("lon", lon);
  map.setAttribute("zoom", zoom);
  let layer = document.createElement("layer-");
  layer.setAttribute("src", window.location.href);
  layer.setAttribute("checked", "");
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