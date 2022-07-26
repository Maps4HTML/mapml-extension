function sendMessage() {
    chrome.storage.local.get("options", function (items) {
        let renderMap = items.options ? items.options.renderMap : false;
        if (renderMap) chrome.runtime.sendMessage("hasMapML");
    });
}

let mapml = document.querySelector("mapml-");
if(mapml) {
    sendMessage()
} else {
    //Browser wraps text/mapml with a pre element
    let pre = document.querySelector("pre");
    if(pre && document.contentType === "text/mapml") {
        let parser = new DOMParser();
        let doc = parser.parseFromString(pre.innerText, "application/xml");
        if(doc.querySelector("mapml-")) sendMessage();
    }
}