let mapml = document.querySelector("mapml-");
if(mapml) {
    chrome.storage.local.get("options", function (items) {
        let renderMap = items.options ? items.options.renderMap : false;
        if (renderMap) chrome.runtime.sendMessage("hasMapML");
    });
}