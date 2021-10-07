window.addEventListener('message', function(e) {
  if(e.data.type === "set-options" && M.options) {
    Object.assign(M.options, e.data.options);

    for (let map of document.querySelectorAll("mapml-viewer, web-map")) {
      map._toggleControls();
      map._toggleControls();
    }
  }
}, true);