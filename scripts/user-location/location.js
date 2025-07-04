function setLocationDisplay(display) {
  const locationBox = document.getElementById("location-info");
  if (locationBox) {
    locationBox.innerHTML = `Your Location: ${display} &nbsp; 
      <span id="update-location" style="color: #0092FF; cursor: pointer; text-decoration: underline;">Update Location</span>`;
    document.getElementById("update-location").addEventListener("click", () => {
      localStorage.removeItem("userLocationDisplay");
      getLocation(); // refresh location
    });
  }
}

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
      const address = data.address;
      const street = address.road || address.pedestrian || '';
      const city = address.city || address.town || address.village || '';
      const state = address.state || '';
      const display = [street, city, state].filter(Boolean).join(', ');
      localStorage.setItem("userLocationDisplay", display);
      setLocationDisplay(display);
    })
    .catch(() => {
      useIPFallback();
    });
}

function useIPFallback() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const city = data.city || '';
      const region = data.region || '';
      const display = [city, region].filter(Boolean).join(', ');
      localStorage.setItem("userLocationDisplay", display);
      setLocationDisplay(display || 'your area');
    })
    .catch(() => {
      const locationBox = document.getElementById("location-info");
      if (locationBox) {
        locationBox.textContent = "⚠️ Location could not be determined.";
      }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const cached = localStorage.getItem("userLocationDisplay");
  if (cached) {
    setLocationDisplay(cached);
  } else {
    setTimeout(() => {
      if (document.getElementById("location-info")) {
        getLocation();
      }
    }, 300);
  }
});
