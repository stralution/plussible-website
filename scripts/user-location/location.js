document.addEventListener("DOMContentLoaded", function () {
  const locationInfo = document.getElementById("location-info");

  if (!locationInfo) return;

  locationInfo.textContent = "Detecting location...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successGeo, fallbackToIP, {
      timeout: 5000
    });
  } else {
    fallbackToIP(); // If geolocation isn't supported at all
  }

  function successGeo(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // You can use Google Maps Geocoding API here if you prefer
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      .then(res => res.json())
      .then(data => {
        const city = data.address.city || data.address.town || data.address.village || '';
        const country = data.address.country || '';
        locationInfo.textContent = `You're in ${city}, ${country}`;
      })
      .catch(err => {
        console.error("Reverse geocoding failed:", err);
        fallbackToIP(); // If geocoding fails, fallback
      });
  }

  function fallbackToIP() {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const city = data.city || '';
        const country = data.country_name || '';
        locationInfo.textContent = `You're in ${city}, ${country}`;
      })
      .catch(err => {
        locationInfo.textContent = "Unable to detect location.";
        console.error("IP-based location failed:", err);
      });
  }
});
