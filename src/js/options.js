/**
 * Listens for message from content.js
 * merges passed options with default options in M.options
 */
window.addEventListener('message', function(e) {
  if(e.data.type === "set-options" && M.options) {
    Object.assign(M.options, e.data.options);

    // when options are set they may change the UI, to update these changes the controls
    // are removed then readded (or added then removed depending on the initial state)
    for (let map of document.querySelectorAll("mapml-viewer, map[is='web-map']")) {
      map._toggleControls();
      map._toggleControls();
    }
  }
}, true);