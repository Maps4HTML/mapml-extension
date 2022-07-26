let mapml = document.querySelector("mapml-");
if(mapml) {
    chrome.storage.local.get("options", function (items) {
        let generateMap = items.options ? items.options.generateMap : false;
        if (generateMap) chrome.runtime.sendMessage("hasMapML");
    });
}