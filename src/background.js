// Runs in the background on background page, consider migration to service workers

function success(pos) {
  console.log('My Location is '+pos.coords.latitude.toString()+" lat "+pos.coords.longitude.toString()+" lng");
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

navigator.geolocation.watchPosition(success, error, options);