let options = {};

function saveOptions() {
  chrome.storage.local.set({
    options : options,
  });
}

function loadOptions(){
  chrome.storage.local.get("options",function (o){
    options = o.options || {};
    for(let name in options){
      let elem = document.getElementById(name);
      if(elem){
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

function handleCheckboxChange(e) {
  let option = e.target.id;
  options[option] = e.target.checked;
  console.log(options);
  saveOptions();
}

function resetStorage() {
  chrome.storage.local.clear();
}


// You cannot call a function directly from popup.html, you need to attach a listener in the accompanying JS file
document.addEventListener("DOMContentLoaded",  () => {
  loadOptions();
  document.getElementById("announceMovement").addEventListener("change", handleCheckboxChange);
  document.getElementById("clear").addEventListener("click", resetStorage);
});

