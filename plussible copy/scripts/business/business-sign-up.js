document.addEventListener("DOMContentLoaded", function() {
  function logStorageContents() {
      console.log("businessUsers:", JSON.parse(localStorage.getItem('businessUsers') || '[]'));
  }

  document.addEventListener("DOMContentLoaded", function() {
      // Log the storage contents on page load
      logStorageContents();

      document.querySelector(".header-logo").addEventListener("click", function() {
          window.location.href = "plussible.html";
      });

      document.querySelectorAll('input[name="gender"]').forEach(function(elem) {
          elem.addEventListener('change', function() {
              if (this.value === 'custom') {
                  document.getElementById('custom-gender').style.display = 'block';
              } else {
                  document.getElementById('custom-gender').style.display = 'none';
              }
          });
      });

      document.getElementById('sign-up-form').addEventListener('submit', function(event) {
          event.preventDefault();

          var firstName = document.querySelector('input[placeholder="First Name *"]').value;
          var lastName = document.querySelector('input[placeholder="Last Name *"]').value;
          var address = document.querySelector('input[placeholder="Address *"]').value;
          var apartment = document.querySelector('input[placeholder="Apartment or House No *"]').value;
          var city = document.querySelector('input[placeholder="City *"]').value;
          var state = document.querySelector('input[placeholder="State *"]').value;
          var zipCode = document.querySelector('input[placeholder="ZIP Code *"]').value;
          var email = document.querySelector('input[placeholder="Email *"]').value;
          var mobileNumber = document.querySelector('input[placeholder="Mobile Number *"]').value;
          var position = document.querySelector('input[placeholder="Position *"]').value;
          var gender = document.querySelector('input[name="gender"]:checked').value;
          var businessName = document.querySelector('input[placeholder="Business Name *"]').value;
          var businessAddress = document.querySelector('input[placeholder="Business Address *"]').value;
          var businessApartment = document.querySelector('input[placeholder="Apartment or Suite No *"]').value;
          var businessCity = document.querySelector('input[placeholder="City *"]').value;
          var businessState = document.querySelector('input[placeholder="State *"]').value;
          var businessZipCode = document.querySelector('input[placeholder="ZIP Code *"]').value;
          var businessPhone = document.querySelector('input[placeholder="Business Phone *"]').value;
          var businessEmail = document.querySelector('input[placeholder="Business Email *"]').value;
          var businessType = document.querySelector('input[placeholder="Business Type (For example, accounting, plumbing and so on)*"]').value;
          var businessRegistrationType = document.querySelector('input[placeholder="Business Registration Type *"]').value;
          var businessStatus = document.querySelector('input[name="business-status"]:checked').value;
          var describeBusiness = document.querySelector('textarea[placeholder="Describe Your Business *"]').value;
          var productOrServices = document.querySelector('textarea[placeholder="Your Product or Services *"]').value;
          var uniqueSellingPoints = document.querySelector('textarea[placeholder="Unique Selling Points *"]').value;
          var expectationsFromPlussible = document.querySelector('textarea[placeholder="Expectations from Plussible *"]').value;
          var serviceLocations = document.querySelector('textarea[placeholder="Service Locations *"]').value;
          var username = document.getElementById('username').value;
          var newPassword = document.getElementById('new-password').value;
          var reenterPassword = document.getElementById('reenter-password').value;

          var isValid = true;

          if (!validateEmail(username)) {
              displayError('username-error', 'Please enter a valid email address.');
              isValid = false;
          } else {
              clearError('username-error');
          }

          if (newPassword.length < 6) {
              displayError('new-password-error', 'New Password must be at least 6 characters long.');
              isValid = false;
          } else {
              clearError('new-password-error');
          }

          if (newPassword !== reenterPassword) {
              displayError('reenter-password-error', 'Passwords do not match.');
              isValid = false;
          } else {
              clearError('reenter-password-error');
          }

          if (isValid) {
              // Retrieve existing users from local storage
              let users = JSON.parse(localStorage.getItem('businessUsers') || '[]');

              // Check if email or mobile number already exists
              let emailExists = users.some(user => user.email === email);
              let phoneExists = users.some(user => user.mobileNumber === mobileNumber);

              if (emailExists) {
                  displayError('username-error', 'This email is already registered.');
                  return;
              }

              if (phoneExists) {
                  displayError('phone-error', 'This phone number is already registered.');
                  return;
              }

              // Create the new user object with a unique ID
              const newUser = {
                  id: Date.now(),
                  firstName,
                  lastName,
                  address,
                  apartment,
                  city,
                  state,
                  zipCode,
                  email,
                  mobileNumber,
                  position,
                  gender,
                  businessName,
                  businessAddress,
                  businessApartment,
                  businessCity,
                  businessState,
                  businessZipCode,
                  businessPhone,
                  businessEmail,
                  businessType,
                  businessRegistrationType,
                  businessStatus,
                  describeBusiness,
                  productOrServices,
                  uniqueSellingPoints,
                  expectationsFromPlussible,
                  serviceLocations,
                  username,
                  password: newPassword
              };

              // Add the new user to the array
              users.push(newUser);

              // Save the updated array back to local storage
              localStorage.setItem('businessUsers', JSON.stringify(users));

              // Log the storage contents to the console
              logStorageContents();

              alert('Sign up successful! Your data has been saved.');
              // Optionally redirect to the sign-in page
              window.location.href = 'business-sign-in.html';
          }
      });

      function validateEmail(email) {
          var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(String(email).toLowerCase());
      }

      function displayError(elementId, message) {
          var errorElement = document.getElementById(elementId);
          errorElement.textContent = message;
          errorElement.style.display = 'block';
      }

      function clearError(elementId) {
          var errorElement = document.getElementById(elementId);
          errorElement.textContent = '';
          errorElement.style.display = 'none';
      }
  });
});

