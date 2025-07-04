document.addEventListener("DOMContentLoaded", function () {
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector("footer").innerHTML = data;
      getLocation(); // run after injecting footer
    })
    .catch(error => console.error('Error loading footer:', error));
});

