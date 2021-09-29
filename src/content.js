//Runs on an active webpage

function loadPreferences() {
  chrome.storage.local.get("preferences", function (p) {
    console.log(p);
  });
}

loadPreferences();