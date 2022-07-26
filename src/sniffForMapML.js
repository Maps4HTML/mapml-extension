let mapml = document.querySelector("mapml-");
if(mapml) {
    chrome.runtime.sendMessage("hasMapML");
}