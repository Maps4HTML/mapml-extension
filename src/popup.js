let options = {};

/**
 * Saves the options to storage
 */
function saveOptions() {
  chrome.runtime.sendMessage({type: 'options', options});
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
      announceMovement: true,
      announceScale: 'metric',
      featureIndexOverlayOption: false,
      renderMap: false,
      defaultExtCoor: 'pcrs',
      defaultLocCoor: 'gcrs'
    };
    for (let name in options) {
      let elem = document.getElementById(name);
      if (elem) {
        switch (typeof options[name]) {
          case "boolean":
            elem.checked = options[name];
            break;
          case "string":
            Array.from(elem.children).forEach(el => el.value === options[name]? 
                                              el.selected = true : el.selected = false);
            break;
        }
      }
    }
  });
}

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

function handleDropdownChange(e) {
  let option = e.target.id;
  options[option] = Array.from(e.target.children).find(el => el.selected).value;
  saveOptions();
}

// You cannot call a function directly from popup.html, you need to attach a listener in the accompanying JS file

/**
 * Attaches event handlers to the user inputs (i.e. checkboxes), and initializes the options
 */
document.addEventListener("DOMContentLoaded", () => {
  loadOptions();
  document.getElementById("announceMovement").addEventListener("change", handleCheckboxChange);
  document.getElementById("announceScale").addEventListener("change", handleDropdownChange);
  document.getElementById("featureIndexOverlayOption").addEventListener("change", handleCheckboxChange);
  document.getElementById("renderMap").addEventListener("change", handleCheckboxChange);
  document.getElementById("defaultExtCoor").addEventListener("change", handleDropdownChange);
  document.getElementById("defaultLocCoor").addEventListener("change", handleDropdownChange);
});

