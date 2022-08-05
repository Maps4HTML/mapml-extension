const mapml = document.querySelector("mapml-");
if(mapml) {
    chrome.runtime.sendMessage(document.contentType === "text/html" ? "html" : "xml");
} else if(document.contentType === "text/mapml"){
    chrome.runtime.sendMessage("mapml");
}