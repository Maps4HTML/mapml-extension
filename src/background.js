chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (request.command === "get-location") {
    navigator.geolocation.getCurrentPosition (function (position) {
      sendResponse ({
        lon: position.coords.longitude,
        lat: position.coords.latitude,
      });
    });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed");
});