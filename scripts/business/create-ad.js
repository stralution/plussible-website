document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('log-storage-button').addEventListener('click', function () {
      logStorageItems();
  });

  function logStorageItems() {
      console.log("Service Adverts:", JSON.parse(localStorage.getItem('serviceAdverts')) || []);
      console.log("Public Adverts:", JSON.parse(localStorage.getItem('publicAdverts')) || []);
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      const userSpecificKey = `user_${currentUser.id}_serviceAdverts`;
      console.log("User Specific Service Adverts:", JSON.parse(localStorage.getItem(userSpecificKey)) || []);
      console.log("Search Results:", JSON.parse(localStorage.getItem('searchResults')) || []);
      console.log("Search Query:", localStorage.getItem('searchQuery') || '');
      console.log("User Zip Code:", localStorage.getItem('userZipCode') || '');
      console.log("Work Hours Data:", JSON.parse(localStorage.getItem('workHoursData')) || []);
      console.log("Selected Time Slots:", JSON.parse(localStorage.getItem('selectedTimeSlots')) || []);
  }

  document.querySelector(".header-logo").addEventListener("click", function () {
      window.location.href = "plussible.html";
  });

  const menu = document.querySelector('.menu');
  const menuItems = document.querySelector('.menu-items');
  const logoutLink = document.getElementById('logout-link');

  menu.addEventListener('click', function(event) {
      menuItems.style.display = menuItems.style.display === 'none' ? 'block' : 'none';
      event.stopPropagation();
  });

  document.addEventListener('click', function(event) {
      if (!menu.contains(event.target)) {
          menuItems.style.display = 'none';
      }
  });

  // Log out functionality
  logoutLink.addEventListener('click', function(event) {
      event.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'business-sign-in.html';
  });

  const createAdvertButton = document.getElementById('create-advert-button');
  const errorMessages = document.querySelectorAll('.error-message');
  const storedUserData = localStorage.getItem('currentUser');
  let serviceAdverts = JSON.parse(localStorage.getItem('serviceAdverts')) || [];
  let publicAdverts = JSON.parse(localStorage.getItem('publicAdverts')) || [];

  if (!storedUserData) {
      window.location.href = 'business-sign-in.html';
      return;
  }
  const currentUser = JSON.parse(storedUserData);
  const userSpecificKey = `user_${currentUser.id}_serviceAdverts`;

  createAdvertButton.addEventListener('click', function () {
      const requiredFields = document.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
          const errorMessage = field.parentElement.querySelector('.error-message');
          if (errorMessage) {
              if (!field.value) {
                  errorMessage.style.display = 'block';
                  valid = false;
              } else {
                  errorMessage.style.display = 'none';
              }
          }
      });

      const priceError = document.getElementById('price-error');
      const nameError = document.getElementById('name-error');
      const priceInput = document.getElementById('price');
      const priceType = document.getElementById('price-type');
      const durationInput = document.getElementById('duration');
      const durationError = document.getElementById('duration-error');
      const locationsContainer = document.getElementById('locations-container');
      const tagsContainer = document.getElementById('tags-container');
      const locationsError = document.getElementById('locations-error');
      const tagsError = document.getElementById('tags-error');

      if (locationsError) {
          if (locationsContainer.children.length === 0) {
              locationsError.style.display = 'block';
              valid = false;
          } else {
              locationsError.style.display = 'none';
          }
      }

      if (tagsError) {
          if (tagsContainer.children.length === 0) {
              tagsError.style.display = 'block';
              valid = false;
          } else {
              tagsError.style.display = 'none';
          }
      }

      if (durationError) {
          if (!durationInput.value) {
              durationError.style.display = 'block';
              valid = false;
          } else {
              durationError.style.display = 'none';
          }
      }

      if (!priceInput.value || !priceType.value) {
          priceError.style.display = 'block';
          valid = false;
      } else {
          priceError.style.display = 'none';
      }

      const nameInput = document.getElementById('name');
      if (!nameInput.value) {
          nameError.style.display = 'block';
          valid = false;
      } else {
          nameError.style.display = 'none';
      }

      if (valid) {
          let userServiceAdverts = JSON.parse(localStorage.getItem(userSpecificKey)) || [];
          const isDuplicateName = userServiceAdverts.some(advert => advert.name.toLowerCase() === nameInput.value.toLowerCase());

          if (isDuplicateName) {
              nameError.style.display = 'block';
              nameError.textContent = 'This name is already used by your business. Please choose another name.';
              alert('This name is already used by your business. Please choose another name.');
              return;
          }

          if (userServiceAdverts.length >= 50) {
              alert('Maximum advert limit reached. Please delete an existing advert to create a new one.');
              return;
          }

          let advertId = generateUniqueId();

          const file = document.getElementById('image').files[0];
          if (file) {
              compressImage(file, function (compressedDataUrl) {
                  const serviceAdvert = {
                      id: advertId,
                      creatorId: currentUser.id,
                      businessName: currentUser.businessName,
                      name: nameInput.value,
                      category: document.getElementById('category').value,
                      image: compressedDataUrl,
                      address: document.getElementById('address').value,
                      suite: document.getElementById('suite').value,
                      city: document.getElementById('city').value,
                      state: document.getElementById('state').value,
                      zip: document.getElementById('zip').value,
                      locations: Array.from(locationsContainer.children).map(child => child.textContent.replace('x', '').trim()),
                      mobile: document.getElementById('mobile').value,
                      duration: durationInput.value + ' ' + document.getElementById('duration-unit').value,
                      price: priceInput.value,
                      priceType: priceType.value,
                      specials: document.getElementById('specials').value,
                      extras: document.getElementById('extras').value,
                      tags: Array.from(tagsContainer.children).map(child => child.textContent.replace('x', '').trim()),
                      terms: document.getElementById('terms').value,
                      savedAt: new Date().toLocaleString()
                  };

                  userServiceAdverts.push(serviceAdvert);
                  localStorage.setItem(userSpecificKey, JSON.stringify(userServiceAdverts));

                  publicAdverts.push(serviceAdvert);
                  localStorage.setItem('publicAdverts', JSON.stringify(publicAdverts));

                  alert(`Advert created successfully! Advert ID: ${advertId}`);
                  refreshForm();
                  window.location.href = 'manage-calendar.html';
              });
          } else {
              alert('Please upload an image.');
          }
      } else {
          alert('Please complete all required fields.');
      }
  });

  function compressImage(file, callback) {
      const reader = new FileReader();
      reader.onload = function(event) {
          const img = new Image();
          img.src = event.target.result;
          img.onload = function() {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const maxWidth = 800;
              const scaleSize = maxWidth / img.width;
              canvas.width = maxWidth;
              canvas.height = img.height * scaleSize;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              callback(canvas.toDataURL('image/jpeg', 0.7));
          };
      };
      reader.readAsDataURL(file);
  }

  const tagsInput = document.getElementById('tags-input');
  const tagsContainer = document.getElementById('tags-container');
  const locationsInput = document.getElementById('locations-input');
  const locationsContainer = document.getElementById('locations-container');

  function createTagElement(text) {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = text;
      const removeSpan = document.createElement('span');
      removeSpan.textContent = 'x';
      removeSpan.addEventListener('click', function () {
          tagsContainer.removeChild(tag);
      });
      tag.appendChild(removeSpan);
      return tag;
  }

  tagsInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
          event.preventDefault();
          if (tagsInput.value.trim() !== '') {
              const tag = createTagElement(tagsInput.value.trim());
              tagsContainer.appendChild(tag);
              tagsInput.value = '';
          }
      }
  });

  function createLocationElement(text) {
      const location = document.createElement('div');
      location.className = 'location';
      location.textContent = text;
      const removeSpan = document.createElement('span');
      removeSpan.textContent = 'x';
      removeSpan.addEventListener('click', function () {
          locationsContainer.removeChild(location);
      });
      location.appendChild(removeSpan);
      return location;
  }

  locationsInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
          event.preventDefault();
          if (locationsInput.value.trim() !== '') {
              const location = createLocationElement(locationsInput.value.trim());
              locationsContainer.appendChild(location);
              locationsInput.value = '';
          }
      }
  });

  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('preview');
  const imageError = document.getElementById('image-error');

  imageInput.addEventListener('change', function () {
      const file = imageInput.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
              imagePreview.src = e.target.result;
              imagePreview.style.display = 'block';
              imageError.style.display = 'none';
          };
          reader.readAsDataURL(file);
      } else {
          imagePreview.style.display = 'none';
          imageError.style.display = 'block';
          imageError.textContent = 'Please complete this field.';
      }
  });

  function refreshForm() {
      document.getElementById('category').value = '';
      document.getElementById('image').value = '';
      document.getElementById('preview').style.display = 'none';
      document.getElementById('name').value = '';
      document.getElementById('address').value = '';
      document.getElementById('suite').value = '';
      document.getElementById('city').value = '';
      document.getElementById('state').value = '';
      document.getElementById('zip').value = '';
      document.getElementById('locations-input').value = '';
      document.getElementById('locations-container').innerHTML = '';
      document.getElementById('mobile').value = '';
      document.getElementById('duration').value = '';
      document.getElementById('duration-unit').value = '';
      document.getElementById('price').value = '';
      document.getElementById('price-type').value = '';
      document.getElementById('specials').value = '';
      document.getElementById('extras').value = '';
      document.getElementById('tags-input').value = '';
      document.getElementById('tags-container').innerHTML = '';
      document.getElementById('terms').value = '';
      errorMessages.forEach(error => error.style.display = 'none');
  }

  function generateUniqueId() {
      return '_' + Math.random().toString(36).substr(2, 9);
  }
});
