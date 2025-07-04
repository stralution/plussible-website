document.addEventListener("DOMContentLoaded", () => {
  const piBox = document.getElementById('pi-box');
  const piOpenBtn = document.getElementById('pi-open-btn');
  const piCloseBtn = document.getElementById('pi-close-btn');
  const quickSearchButton = document.getElementById('quick-search-btn');
  const searchInput = document.getElementById('search-input');
  const errorMessage = document.querySelector('.error-message');
  const animatedPlaceholder = document.getElementById('animated-placeholder');
  const dropdown = document.querySelector('.dropdown');
  const trendTitles = Array.from(document.querySelectorAll('.trend-title')).map(el => el.textContent.toLowerCase());

  const nativeTimeInput = document.getElementById('time-picker');
  const customTimePicker = document.getElementById('custom-time-picker');
  const preferredDateInput = document.getElementById('preferred-date');

  // Set min date for date picker to today
  function setMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    preferredDateInput.min = `${yyyy}-${mm}-${dd}`; // disallow dates before today
  }
  setMinDate();

  // Populate custom time picker with 30-min intervals for 24 hours starting from 6:00AM
  function populateTimeOptions() {
    customTimePicker.innerHTML = '<option value="">Select a time</option>';
    for (let i = 0; i < 48; i++) {
      let h = (6 + Math.floor(i / 2)) % 24;
      let m = (i % 2) * 30;
      let hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      let ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
      if (h === 0) ampm = 'AM';
      if (h === 12) ampm = 'PM';
      const minuteStr = m === 0 ? '00' : '30';
      const opt = document.createElement('option');
      opt.value = `${h.toString().padStart(2, '0')}:${minuteStr}`;
      opt.textContent = `${hour12}:${minuteStr} ${ampm}`;
      customTimePicker.appendChild(opt);
    }
  }
  populateTimeOptions();

  // Sync custom time picker with native time input
  customTimePicker.addEventListener('change', () => {
    nativeTimeInput.value = customTimePicker.value;
  });

  // ========== ALL OTHER LOGIC BELOW THIS LINE ==========

  // Animated sliding placeholder setup
  const slides = [
    "Find trusted experts",
    "Nearby or anywhere",
    "Fix my leaky pipe",
    "Mow my lawn",
    "Service my Toyota",
    "Web & app developer",
    "Female hair stylist"
  ];

  let slideIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let slidePaused = false;

  function tick() {
    if (slidePaused) {
      setTimeout(tick, 300);
      return;
    }
    const fullText = slides[slideIndex];
    if (!deleting) {
      animatedPlaceholder.textContent = fullText.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === fullText.length) {
        deleting = true;
        setTimeout(tick, 500);
        return;
      }
    } else {
      animatedPlaceholder.textContent = fullText.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        slideIndex = (slideIndex + 1) % slides.length;
        setTimeout(tick, 500);
        return;
      }
    }
    setTimeout(tick, 70);
  }
  tick();

  // Pause animation on input focus or text present
  searchInput.addEventListener('focus', () => {
    slidePaused = true;
    animatedPlaceholder.style.display = 'none';
    closeModal();
  });

  searchInput.addEventListener('input', () => {
    slidePaused = searchInput.value.length > 0;
    animatedPlaceholder.style.display = slidePaused ? 'none' : 'block';
    closeModal();
  });

  searchInput.addEventListener('blur', () => {
    if (!searchInput.value) {
      slidePaused = false;
      animatedPlaceholder.style.display = 'block';
    }
  });

  // Dropdown show/hide on search input
  searchInput.addEventListener('focus', () => {
    dropdown.style.display = 'block';
  });

  searchInput.addEventListener('input', () => {
    const inputValue = searchInput.value.toLowerCase().trim();
    const matches = trendTitles.some(title => title.startsWith(inputValue));
    dropdown.style.display = matches ? 'block' : 'none';
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => dropdown.style.display = 'none', 200);
  });

  dropdown.addEventListener('mousedown', event => {
    const trendItem = event.target.closest('.trend-item');
    if (trendItem) {
      const title = trendItem.querySelector('.trend-title').textContent.trim();
      searchInput.value = title;
      dropdown.style.display = 'none';
      quickSearchButton.click();
    }
  });

  // Close Plussible Intelligence modal if clicking outside modal, button, or input
  window.addEventListener('click', e => {
    if (
      piBox.style.display === 'flex' &&
      !piBox.contains(e.target) &&
      !piOpenBtn.contains(e.target) &&
      !searchInput.contains(e.target)
    ) {
      closeModal();
    }
  });

  // Open Plussible Intelligence modal
  piOpenBtn.addEventListener('click', () => {
    resetModal();
    piBox.style.display = 'flex';
    const expertTypeInput = document.getElementById('expert-type-input');
    expertTypeInput.value = searchInput.value.trim();
    expertTypeInput.focus();
  });

  // Close modal on close button click
  piCloseBtn.addEventListener('click', () => {
    closeModal();
  });

  // Live clear validation errors on user input
  ['expert-type-input', 'preferred-date', 'custom-time-picker', 'additional-details'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      el.classList.remove('input-error');
      const msg = document.getElementById(id + '-validation');
      if (msg) msg.remove();
      errorMessage.textContent = '';
    });
  });

  // Reset modal inputs and validation states
  function resetModal() {
    document.getElementById('expert-type-input').value = '';
    document.getElementById('preferred-date').value = '';
    nativeTimeInput.value = '';
    customTimePicker.value = '';
    document.getElementById('additional-details').value = '';
    errorMessage.textContent = '';

    // Remove validation errors
    ['expert-type-input', 'preferred-date', 'custom-time-picker', 'additional-details'].forEach(id => {
      document.getElementById(id).classList.remove('input-error');
      const msg = document.getElementById(id + '-validation');
      if (msg) msg.remove();
    });
  }

  // Close modal helper
  function closeModal() {
    resetModal();
    piBox.style.display = 'none';
  }

  // Quick Search button
  quickSearchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      errorMessage.textContent = 'Please enter a search term.';
      return;
    }
    errorMessage.textContent = '';

    const allAdvertsKeys = Object.keys(localStorage).filter(
      key => key.startsWith('user_') && key.endsWith('_serviceAdverts')
    );
    let allAdverts = [];
    allAdvertsKeys.forEach(key => {
      const adverts = JSON.parse(localStorage.getItem(key)) || [];
      allAdverts = allAdverts.concat(adverts);
    });
    const results = allAdverts.filter(offer =>
      Object.values(offer).some(value =>
        (typeof value === 'string' || Array.isArray(value)) &&
        value.toString().toLowerCase().includes(query)
      )
    );

    if (results.length === 0) {
      errorMessage.textContent = 'No adverts found for the entered search term.';
      return;
    }

    localStorage.setItem('searchResults', JSON.stringify(results));
    localStorage.setItem('searchQuery', query);
    window.location.href = 'search-page.html';
  });

  // Find Best Expert button click - validate inputs then search for special offers
  document.getElementById('find-expert-btn').addEventListener('click', () => {
    errorMessage.textContent = '';
    const expertTypeInput = document.getElementById('expert-type-input');
    const preferredDate = preferredDateInput.value;
    const preferredTime = customTimePicker.value;
    const additionalDetails = document.getElementById('additional-details').value.trim();

    // Remove previous validation messages
    ['expert-type-input', 'preferred-date', 'custom-time-picker', 'additional-details'].forEach(id => {
      document.getElementById(id).classList.remove('input-error');
      const msg = document.getElementById(id + '-validation');
      if (msg) msg.remove();
    });

    let valid = true;

    // Validate fields
    if (!expertTypeInput.value.trim()) {
      addValidationError(expertTypeInput, 'Expert Type is required.');
      valid = false;
    }
    if (!preferredDate) {
      addValidationError(preferredDateInput, 'Preferred Date is required.');
      valid = false;
    }
    if (!preferredTime) {
      addValidationError(customTimePicker, 'Preferred Time is required.');
      valid = false;
    }
    if (!additionalDetails) {
      addValidationError(document.getElementById('additional-details'), 'Additional details are required.');
      valid = false;
    }

    if (!valid) {
      errorMessage.textContent = 'Please fill all required fields.';
      return;
    }

    // Search special adverts
    const allAdvertsKeys = Object.keys(localStorage).filter(
      key => key.startsWith('user_') && key.endsWith('_serviceAdverts')
    );
    let allAdverts = [];
    allAdvertsKeys.forEach(key => {
      const adverts = JSON.parse(localStorage.getItem(key)) || [];
      allAdverts = allAdverts.concat(adverts);
    });
    const filteredAdverts = allAdverts.filter(offer => 
      offer.specials &&
      Object.values(offer).some(value =>
        (typeof value === 'string' || Array.isArray(value)) &&
        value.toString().toLowerCase().includes(expertTypeInput.value.toLowerCase())
      )
    );

    if (filteredAdverts.length === 0) {
      // Show full page blur and thinking message
      showThinkingScreen();
      return;
    }

    // Save search and redirect to special offers search page
    localStorage.setItem('searchResults', JSON.stringify(filteredAdverts));
    localStorage.setItem('searchQuery', expertTypeInput.value.toLowerCase());
    closeModal();
    window.location.href = 'so-search-page.html';
  });

  // Helper to add validation error messages
  function addValidationError(inputElement, message) {
    inputElement.classList.add('input-error');
    const msg = document.createElement('div');
    msg.id = inputElement.id + '-validation';
    msg.className = 'validation-message';
    msg.textContent = message;
    inputElement.parentNode.insertBefore(msg, inputElement.nextSibling);
  }

  // Show full screen thinking overlay with modern Apple-like style
  function showThinkingScreen() {
    // Create overlay div
    const overlay = document.createElement('div');
    overlay.id = 'thinking-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0', left: '0', right: '0', bottom: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
      fontSize: '1.75rem',
      color: '#007aff',
      fontWeight: '600',
      userSelect: 'none',
      transition: 'opacity 0.5s ease',
      opacity: '0',
    });

    // Brain emoji with subtle pulse animation
    const brain = document.createElement('div');
    brain.textContent = '🧠';
    brain.style.fontSize = '6rem';
    brain.style.marginBottom = '1.2rem';
    brain.style.animation = 'pulse 2s infinite ease-in-out';
    overlay.appendChild(brain);

    // Thinking text
    const text = document.createElement('div');
    text.textContent = 'Thinking...';
    overlay.appendChild(text);

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // After 3 seconds, show "No expert found" message
    setTimeout(() => {
      text.textContent = 'No expert found for the entered details.';
      // After another 3 seconds fade out overlay and remove it
      overlay.style.opacity = '1';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 3000);
    }, 3000);
  }

  // Add CSS keyframes for pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);

  // Redirect logged-in user to c-plussible.html if already logged in
  const storedUserData = localStorage.getItem('currentUser');
  if (storedUserData) {
    window.location.href = 'c-plussible.html';
  }
});
