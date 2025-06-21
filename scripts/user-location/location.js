document.addEventListener("DOMContentLoaded", function () {
  const locationDisplay = document.getElementById("location-info");

  if (!locationDisplay) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(response => response.json())
          .then(data => {
            const address = data.address;
            const city = address.city || address.town || address.village || '';
            const postcode = address.postcode || '';
            const country = address.country || '';
            locationDisplay.innerHTML = `Location: ${city ? city + ', ' : ''}${country}${postcode ? ', ZIP Code: ' + postcode : ''}`;
          })
          .catch(() => {
            locationDisplay.innerHTML = "Error retrieving location.";
          });
      },
      function (error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            locationDisplay.innerHTML = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            locationDisplay.innerHTML = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            locationDisplay.innerHTML = "The request to get user location timed out.";
            break;
          default:
            locationDisplay.innerHTML = "An unknown error occurred.";
            break;
        }
      },
      { timeout: 10000 }
    );
  } else {
    locationDisplay.innerHTML = "Geolocation is not supported by this browser.";
  }
});
