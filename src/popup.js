function handleClick(){
  chrome.storage.local.set({
    preferences:{
      "buttonSize": 25,
    }
  }, function (){
    console.log("Value set successfully");
  });
}

// To get location call the service worker using messages API
function getLocation() {
  chrome.runtime.sendMessage('get-location', (response) => {
    console.log(response);
  });
}


// You cannot call a function directly from popup.html, you need to attach a listener in the accompanying JS file
document.addEventListener("DOMContentLoaded", function (){
  document.getElementById("set-pref").addEventListener("click", handleClick)
});

