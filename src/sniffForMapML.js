function sendMessage(message) {
    chrome.storage.local.get("options", function (items) {
        const renderMap = items.options ? items.options.renderMap : false;
        if (renderMap) chrome.runtime.sendMessage(message);
    });
}

const mapml = document.querySelector("mapml-");
if(mapml) {
    sendMessage(document.contentType === "text/html" ? "html" : "xml");
} else if(document.contentType === "text/mapml"){
    sendMessage("mapml");
}
