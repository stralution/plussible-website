function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
      document.getElementById("location-info").innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=YOUR_API_KEY`)
      .then(response => response.json())
      .then(data => {
          if (data.status === "OK") {
              const address = data.results[0].formatted_address;
              const postalCode = data.results[0].address_components.find(component => component.types.includes("postal_code")).long_name;
              document.getElementById("location-info").innerHTML = `Location: ${address}, ZIP Code: ${postalCode}`;
          } else {
              document.getElementById("location-info").innerHTML = "Unable to retrieve location.";
          }
      })
      .catch(error => {
          document.getElementById("location-info").innerHTML = "Error retrieving location.";
      });
}

function showError(error) {
  switch(error.code) {
      case error.PERMISSION_DENIED:
          document.getElementById("location-info").innerHTML = "User denied the request for Geolocation.";
          break;
      case error.POSITION_UNAVAILABLE:
          document.getElementById("location-info").innerHTML = "Location information is unavailable.";
          break;
      case error.TIMEOUT:
          document.getElementById("location-info").innerHTML = "The request to get user location timed out.";
          break;
      case error.UNKNOWN_ERROR:
          document.getElementById("location-info").innerHTML = "An unknown error occurred.";
          break;
  }
}

document.addEventListener("DOMContentLoaded", getLocation);