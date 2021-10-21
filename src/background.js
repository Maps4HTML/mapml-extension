/**
 * Used to send back user location on demand, this goes around the need to ask the user
 * for permission on every site the extension runs on for their location
 */
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

/**
 * Runs on installs and updates once
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed");
});