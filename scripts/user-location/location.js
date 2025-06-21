document.addEventListener("DOMContentLoaded", function () {
  const locationInfo = document.getElementById("location-info");

  if (!locationInfo) {
    console.error("❌ location-info element not found in HTML.");
    return;
  }

  locationInfo.textContent = "Detecting location...";

  if (!navigator.geolocation) {
    locationInfo.textContent = "Geolocation is not supported by this browser.";
    console.error("❌ Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

  function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log("📍 Got coordinates:", lat, lon);

    const apiKey = "YOUR_API_KEY"; // Replace this with your actual Google Maps API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("🌐 Network response was not ok.");
        return response.json();
      })
      .then((data) => {
        if (data.status !== "OK") {
          locationInfo.textContent = "Unable to retrieve location details.";
          console.error("⚠️ Google Maps error:", data.status, data.error_message);
          return;
        }

        const address = data.results[0].formatted_address;
        const postalComponent = data.results[0].address_components.find((c) =>
          c.types.includes("postal_code")
        );
        const postalCode = postalComponent ? postalComponent.long_name : "N/A";

        locationInfo.textContent = `Location: ${address}, ZIP Code: ${postalCode}`;
        console.log("✅ Address found:", address);
      })
      .catch((error) => {
        locationInfo.textContent = "Error retrieving location details.";
        console.error("❌ Fetch error:", error);
      });
  }

  function errorCallback(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationInfo.textContent = "Location access denied. Please enable it in your browser settings.";
        break;
      case error.POSITION_UNAVAILABLE:
        locationInfo.textContent = "Location info is unavailable.";
        break;
      case error.TIMEOUT:
        locationInfo.textContent = "The request for location timed out.";
        break;
      default:
        locationInfo.textContent = "An unknown error occurred while detecting location.";
    }
    console.error("⚠️ Geolocation error:", error.message);
  }
});
