function sendMessage(message) {
    chrome.storage.local.get("options", function (items) {
        let renderMap = items.options ? items.options.renderMap : false;
        if (renderMap) chrome.runtime.sendMessage(message);
    });
}

let mapml = document.querySelector("mapml-");
if(mapml) {
    sendMessage("xml");
} else if(document.contentType === "text/mapml"){
    sendMessage("mapml");
}