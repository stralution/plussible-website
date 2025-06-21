document.addEventListener("DOMContentLoaded", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      showPosition,
      useIPFallback,
      { timeout: 7000 }
    );
  } else {
    useIPFallback();
  }
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      const address = data.display_name;
      document.getElementById("location-info").innerHTML = `📍 ${address}`;
    })
    .catch(() => {
      useIPFallback();
    });
}

function useIPFallback() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const city = data.city;
      const region = data.region;
      const country = data.country_name;
      const postal = data.postal;
      document.getElementById("location-info").innerHTML =
        `📍 ${city}, ${region}, ${country} ${postal}`;
    })
    .catch(() => {
      document.getElementById("location-info").innerHTML =
        "⚠️ Location could not be determined.";
    });
}
