function togglePasswordVisibility(id) {
  var passwordInput = document.getElementById(id);
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

function saveUserData(user) {
  let users = JSON.parse(localStorage.getItem('endUsers')) || [];
  users.push(user);
  localStorage.setItem('endUsers', JSON.stringify(users));
  console.log(users);
}

document.addEventListener("DOMContentLoaded", function() {
  // Logo click goes home
  document.querySelector(".header-logo").addEventListener("click", function() {
    window.location.href = "plussible.html";
  });

  // Show/hide custom gender dropdown based on radio selection
  document.querySelector('input[value="custom"]').addEventListener('change', function () {
    document.getElementById('custom-gender').style.display = 'inline-block';
  });
  document.querySelector('input[value="male"]').addEventListener('change', function () {
    document.getElementById('custom-gender').style.display = 'none';
  });
  document.querySelector('input[value="female"]').addEventListener('change', function () {
    document.getElementById('custom-gender').style.display = 'none';
  });

  // Form submit handler with validation
  document.getElementById('sign-up-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var firstName = document.querySelector('input[placeholder="First Name *"]').value.trim();
    var lastName = document.querySelector('input[placeholder="Last Name *"]').value.trim();
    var email = document.querySelector('input[type="email"]').value.trim();
    var phoneCountryCode = document.querySelector('.phone-group select').value;
    var mobileNumber = document.querySelector('.phone-group input[type="tel"]').value.trim();
    var newPassword = document.getElementById('new-password').value;
    var reenterPassword = document.getElementById('reenter-password').value;
    var dateOfBirth = document.querySelector('input[type="date"]').value;
    var genderRadio = document.querySelector('input[name="gender"]:checked');
    var gender = genderRadio ? genderRadio.value : '';
    var customGender = document.getElementById('custom-gender').value;

    var emailError = document.getElementById('email-error');
    var newPasswordError = document.getElementById('new-password-error');
    var reenterPasswordError = document.getElementById('reenter-password-error');

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var valid = true;

    // Validate email
    if (!emailPattern.test(email)) {
      emailError.textContent = "Please enter a valid email address.";
      document.querySelector('input[type="email"]').classList.add("input-error");
      valid = false;
    } else {
      emailError.textContent = "";
      document.querySelector('input[type="email"]').classList.remove("input-error");
    }

    // Validate password length
    if (newPassword.length < 6) {
      newPasswordError.textContent = "New Password must be at least 6 characters long.";
      document.getElementById('new-password').classList.add("input-error");
      valid = false;
    } else {
      newPasswordError.textContent = "";
      document.getElementById('new-password').classList.remove("input-error");
    }

    // Validate password match
    if (newPassword !== reenterPassword) {
      reenterPasswordError.textContent = "New Password and Re-enter Password must match.";
      document.getElementById('reenter-password').classList.add("input-error");
      valid = false;
    } else {
      reenterPasswordError.textContent = "";
      document.getElementById('reenter-password').classList.remove("input-error");
    }

    if (valid) {
      var user = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneCountryCode: phoneCountryCode,
        mobileNumber: mobileNumber,
        password: newPassword,
        dateOfBirth: dateOfBirth,
        gender: gender,
        customGender: gender === "custom" ? customGender : ""
      };
      saveUserData(user);
      alert("User data saved successfully!");
      window.location.href = "sign-in.html";
    }
  });
});





