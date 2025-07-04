document.addEventListener("DOMContentLoaded", function () {
  const step1 = document.getElementById("sign-in-step-1");
  const step2 = document.getElementById("sign-in-step-2");
  const emailOrPhoneInput = document.getElementById("emailOrPhone");
  const continueBtn = document.getElementById("continueBtn");
  const loginBtn = document.getElementById("loginBtn");
  const userIdentifierSpan = document.getElementById("user-identifier");
  const changeUserBtn = document.getElementById("changeUser");

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  // Normalize phone number by removing non-digit characters
  function normalizePhone(phone) {
    return phone.replace(/\D/g, "");
  }

  // Show country code only if input starts with digits (and no '@')
  emailOrPhoneInput.addEventListener("input", () => {
    const val = emailOrPhoneInput.value.trim();
    const isNumericStart = /^\d/.test(val);
    const isEmail = val.includes("@");
    const countryCodeSpan = document.getElementById("country-code");

    if (isNumericStart && !isEmail) {
      countryCodeSpan.style.display = "inline";
      emailOrPhoneInput.style.paddingLeft = "60px";
    } else {
      countryCodeSpan.style.display = "none";
      emailOrPhoneInput.style.paddingLeft = "12px";
    }
    // Clear error message on input change
    emailError.style.display = "none";
    emailError.textContent = "";
  });

  // Toggle password visibility
  window.togglePasswordVisibility = function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  };

  // Continue button handler - validate and move to step 2
  continueBtn.addEventListener("click", () => {
    const identifier = emailOrPhoneInput.value.trim();
    if (!identifier) {
      emailError.textContent = "Please enter your email or mobile number.";
      emailError.style.display = "block";
      return;
    }

    const users = JSON.parse(localStorage.getItem("endUsers")) || [];
    const matchedUser = users.find(user => {
      const emailMatch = user.email && user.email.trim().toLowerCase() === identifier.toLowerCase();

      // Combine country code and mobile number for stored phone
      const storedFullPhone = (user.phoneCountryCode || '') + (user.mobileNumber || '');
      const phoneMatch = storedFullPhone && normalizePhone(storedFullPhone) === normalizePhone(identifier);

      return emailMatch || phoneMatch;
    });

    if (!matchedUser) {
      emailError.textContent = "The email or mobile number you entered isn’t connected to an account.";
      emailError.style.display = "block";
      return;
    }

    // Clear error message
    emailError.style.display = "none";
    emailError.textContent = "";

    // Show step 2, populate user summary
    step1.style.display = "none";
    step2.style.display = "flex";

    userIdentifierSpan.textContent = identifier;
  });

  // Change button handler - go back to step 1 for editing
  changeUserBtn.addEventListener("click", () => {
    step2.style.display = "none";
    step1.style.display = "flex";
    emailOrPhoneInput.focus();
    // Clear password input and error when going back
    document.getElementById("password").value = "";
    passwordError.style.display = "none";
    passwordError.textContent = "";
  });

  // Login button handler - validate password and sign in
  loginBtn.addEventListener("click", () => {
    const identifier = userIdentifierSpan.textContent;
    const password = document.getElementById("password").value;

    if (!password) {
      passwordError.textContent = "Please enter your password.";
      passwordError.style.display = "block";
      return;
    }

    const users = JSON.parse(localStorage.getItem("endUsers")) || [];
    const matchedUser = users.find(user => {
      const emailMatch = user.email && user.email.trim().toLowerCase() === identifier.toLowerCase();

      const storedFullPhone = (user.phoneCountryCode || '') + (user.mobileNumber || '');
      const phoneMatch = storedFullPhone && normalizePhone(storedFullPhone) === normalizePhone(identifier);

      return (emailMatch || phoneMatch) && user.password === password;
    });

    if (matchedUser) {
      passwordError.style.display = "none";
      passwordError.textContent = "";

      localStorage.setItem("currentUser", JSON.stringify(matchedUser));
      window.location.href = "c-plussible.html";
    } else {
      passwordError.textContent = "The password you’ve entered is incorrect.";
      passwordError.style.display = "block";
    }
  });

  // Clicking logo goes home
  document.querySelector(".header-logo").addEventListener("click", () => {
    window.location.href = "plussible.html";
  });
});






