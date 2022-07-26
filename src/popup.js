let options = {};

/**
 * Saves the options to storage
 */
function saveOptions() {
  chrome.storage.local.set({
    options: options,
  });
}

/**
 * Loads the users options from storage and sets it to the global (global to this file) options object
 * it also updates the respective elements to reflect the current state
 */
function loadOptions() {
  chrome.storage.local.get("options", function (o) {
    options = o.options || {
      announceMovement: false,
      featureIndexOverlayOption: false,
    };
    for (let name in options) {
      let elem = document.getElementById(name);
      if (elem) {
        switch (typeof options[name]) {
          case "boolean":
            elem.checked = options[name];
            break;
        }
      }
    }
  });
}

// To get location call the service worker using messages API
/*function getLocation() {
  chrome.runtime.sendMessage('get-location', (response) => {
    console.log(response);
  });
}*/

/**
 * Handles checkbox changes, changes are then reflected in the users options in storage
 * @param e - Event object
 */
function handleCheckboxChange(e) {
  let option = e.target.id;
  options[option] = e.target.checked;
  console.log(options);
  saveOptions();
}

/**
 * Used to clear the extensions storage
 */
function resetStorage() {
  chrome.storage.local.clear(loadOptions);
}

// You cannot call a function directly from popup.html, you need to attach a listener in the accompanying JS file

/**
 * Attaches event handlers to the user inputs (i.e. checkboxes), and initializes the options
 */
document.addEventListener("DOMContentLoaded", () => {
  loadOptions();
  document.getElementById("announceMovement").addEventListener("change", handleCheckboxChange);
  document.getElementById("featureIndexOverlayOption").addEventListener("change", handleCheckboxChange);
  document.getElementById("renderMap").addEventListener("change", handleCheckboxChange);
  document.getElementById("clear").addEventListener("click", resetStorage);
});

