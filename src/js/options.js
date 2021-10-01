window.addEventListener('message', function(e) {
  if(e.data.options && M.options) Object.assign(M.options, e.data);
  else M.options = e.data; // TODO: remove once M.options is set in the web custom element suite
}, true);