document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'sign-in.html';
    return;
  }

  const offerList = document.getElementById('offer-list');
  const pagination = document.getElementById('pagination');
  const searchInput = document.querySelector('.search-box input[type="text"]');
  const quickSearchButton = document.querySelector('.search-box button');
  const container = document.querySelector('.container');
  const resultsHeading = document.getElementById('results-heading');
  const zipCodeElement = document.getElementById('zip-code');
  const filterCheckboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');
  const lowestPriceCheckbox = document.querySelector('.filter-box input[value="lowest-price"]');
  const highestPriceCheckbox = document.querySelector('.filter-box input[value="highest-price"]');

  if (!offerList || !pagination || !searchInput || !quickSearchButton || !container || !resultsHeading || !zipCodeElement) {
    console.error('One or more elements are missing in the DOM.');
    return;
  }

  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  container.appendChild(errorMessage);

  function searchAdverts(query) {
    const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
    let allAdverts = [];
    allAdvertsKeys.forEach(key => {
      const adverts = JSON.parse(localStorage.getItem(key)) || [];
      allAdverts = allAdverts.concat(adverts);
    });

    return allAdverts.filter(offer => {
      return offer.specials && Object.values(offer).some(value =>
        (typeof value === 'string' || Array.isArray(value)) &&
        value.toString().toLowerCase().includes(query)
      );
    });
  }

  const searchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
  const searchQuery = localStorage.getItem('searchQuery') || '';
  resultsHeading.textContent = `PI(π) Results for: ${searchQuery}`;
  const userZipCode = localStorage.getItem('userZipCode') || 'undefined';
  zipCodeElement.textContent = `Area: ${userZipCode}`;
  const itemsPerPage = 10;
  let currentPage = 1;

  function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function formatDuration(duration) {
    return duration.replace(/(\d+)\s+(hours?|minutes?)/g, (match, p1, p2) => {
      const singularOrPlural = parseInt(p1) === 1 ? p2.slice(0, -1) : p2;
      return `${p1} ${singularOrPlural}`;
    });
  }

  function defaultSort(offers) {
    return offers.sort((a, b) => a.price - b.price);
  }

  function calculateEngagementCounts(selectedTimeSlots) {
    const engagementCounts = {};
    selectedTimeSlots.forEach(slot => {
      const advertKey = slot.offerName;
      if (engagementCounts[advertKey]) {
        engagementCounts[advertKey]++;
      } else {
        engagementCounts[advertKey] = 1;
      }
    });
    return engagementCounts;
  }

  function updateOffersWithEngagementCounts(offers, engagementCounts) {
    offers.forEach(offer => {
      offer.engagementCount = engagementCounts[offer.name] || 0;
    });
  }

  function renderOffers(offers, page = 1) {
    offerList.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    const paginatedOffers = offers.slice(start, end);
    paginatedOffers.forEach(offer => {
      if (!isOfferLive(offer.name)) return;  // Skip non-live offers

      const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
      const offerWorkHours = workHoursData.filter(wh => wh.name === offer.name);
      if (offerWorkHours.length === 0) return; // Skip if no work hours data found for the offer

      const businessName = offer.businessName || 'Business Name';
      const engagementCount = offer.engagementCount || 0;  // Set default value for engagementCount
      const engagementText = engagementCount === 1 ? '1 time' : `${engagementCount} times`;

      const offerCard = document.createElement('div');
      offerCard.classList.add('offer-card');
      offerCard.innerHTML = `
        <div class="left">
          <img src="${offer.image}" alt="${capitalizeFirstLetter(offer.name)}">
        </div>
        <div class="middle">
          <div class="offer-name">${capitalizeFirstLetter(businessName)}</div>
          <div class="offer-special">${capitalizeFirstLetter(offer.specials)}</div>
          <div class="offer-chat">
            <button>Active</button>
          </div>
          <div class="service-engaged">Service Engaged (${engagementText})</div>
          <div class="offer-rating">
            <span class="star">&#9733;</span>
            <span>${offer.rating}</span>
          </div>
          <div class="offer-reviews">
            ${offer.reviews} reviews
          </div>
        </div>
        <div class="right">
          <div class="price">$${offer.price}</div>
          <div class="service">${capitalizeFirstLetter(offer.name)}</div>
          <div class="details">Duration: ${formatDuration(offer.duration)}</div>
          <div class="details">Extras: ${offer.extras}</div>
          <div class="details">${offer.distance}</div>
          <a href="#" class="engage-btn" onclick="showCalendar('${offer.name}', '${offer.priceType}', '${offer.duration}')">Engage Service</a>
        </div>
      `;
      offerList.appendChild(offerCard);

      // Debugging logs
      console.log(`Offer: ${offer.name}, Engagement Count: ${engagementCount}`);
    });
  }

  function renderPagination(totalItems, itemsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = '';

    if (currentPage > 1) {
      const prevLink = document.createElement('a');
      prevLink.textContent = '«';
      prevLink.href = '#';
      prevLink.classList.add('prev');
      prevLink.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage--;
        renderOffers(defaultSort(searchResults), currentPage);
        renderPagination(totalItems, itemsPerPage, currentPage);
      });
      pagination.appendChild(prevLink);
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.textContent = i;
      pageLink.href = '#';
      pageLink.classList.toggle('active', i === currentPage);
      pageLink.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage = i;
        renderOffers(defaultSort(searchResults), currentPage);
        renderPagination(totalItems, itemsPerPage, currentPage);
      });
      pagination.appendChild(pageLink);
    }

    if (currentPage < totalPages) {
      const nextLink = document.createElement('a');
      nextLink.textContent = '»';
      nextLink.href = '#';
      nextLink.classList.add('next');
      nextLink.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage++;
        renderOffers(defaultSort(searchResults), currentPage);
        renderPagination(totalItems, itemsPerPage, currentPage);
      });
      pagination.appendChild(nextLink);
    }
  }

  function getSelectedFilters() {
    return Array.from(filterCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
  }

  function sortOffers(offers, filters) {
    const sortedOffers = [...offers];
    filters.forEach(filter => {
      switch (filter) {
        case 'lowest-price':
          sortedOffers.sort((a, b) => a.price - b.price);
          break;
        case 'highest-price':
          sortedOffers.sort((a, b) => b.price - a.price);
          break;
        case 'highest-rating':
          sortedOffers.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'most-reviews':
          sortedOffers.sort((a, b) => b.reviews - a.reviews);
          break;
        case 'closest-distance':
          sortedOffers.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
          break;
        default:
          break;
      }
    });
    return sortedOffers;
  }

  function isOfferLive(offerName) {
    const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
    return workHoursData.some(wh => wh.name === offerName);
  }

  searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      quickSearchButton.click();
    }
  });

  quickSearchButton.addEventListener('click', function (event) {
    event.preventDefault();
    const query = searchInput.value.toLowerCase().trim();
    const results = searchAdverts(query);

    if (results.length === 0) {
      errorMessage.textContent = 'No adverts found for the entered search term.';
    } else {
      errorMessage.textContent = '';
      localStorage.setItem('searchResults', JSON.stringify(results));
      localStorage.setItem('searchQuery', query);
      resultsHeading.textContent = `PI(π) Results for: ${query}`;
      const engagementCounts = calculateEngagementCounts(JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]'));
      updateOffersWithEngagementCounts(results, engagementCounts);
      renderOffers(sortOffers(results, getSelectedFilters()), 1);
      renderPagination(results.length, itemsPerPage, 1);
    }
  });

  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      if (this.value === 'lowest-price' && this.checked) {
        highestPriceCheckbox.checked = false;
      }
      if (this.value === 'highest-price' && this.checked) {
        lowestPriceCheckbox.checked = false;
      }
      renderOffers(sortOffers(searchResults, getSelectedFilters()), currentPage);
      renderPagination(searchResults.length, itemsPerPage, currentPage);
    });
  });

  const engagementCounts = calculateEngagementCounts(JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]'));
  updateOffersWithEngagementCounts(searchResults, engagementCounts);
  renderOffers(sortOffers(searchResults, getSelectedFilters()), currentPage);
  renderPagination(searchResults.length, itemsPerPage, currentPage);
});

document.addEventListener("DOMContentLoaded", function () {
  const headerLogo = document.querySelector(".header-logo img");
  if (headerLogo) {
    headerLogo.addEventListener("click", function () {
      window.location.href = "c-plussible.html";
    });
  }
});

// Modal and calendar functionality
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("calendarModal");
  const span = document.getElementsByClassName("close");

  Array.from(span).forEach(element => {
    element.onclick = function () {
      modal.style.display = "none";
    }
  });

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

function showCalendar(offerName, priceType, duration) {
  console.log(`showCalendar called for offer: ${offerName}`);
  const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
  let allAdverts = [];
  allAdvertsKeys.forEach(key => {
    const adverts = JSON.parse(localStorage.getItem(key)) || [];
    allAdverts = allAdverts.concat(adverts);
  });
  const offer = allAdverts.find(offer => offer.name === offerName);

  if (!offer) {
    console.error(`Offer not found: ${offerName}`);
    return;
  }

  if (priceType === 'fixed') {
    console.log(`Fixed price detected for offer: ${offerName}`);
    displayServiceProviderList(offer, duration);
  } else {
    const modal = document.getElementById("calendarModal");
    const calendarContainer = document.getElementById("calendarContainer");
    modal.style.display = "block";
    generateCalendar(offerName, calendarContainer, duration);
  }
}

function displayServiceProviderList(offer, duration) {
  console.log('displayServiceProviderList called');
  const serviceProviderListContainer = document.createElement('div');
  serviceProviderListContainer.classList.add('service-provider-list-container');

  const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
  const performers = [...new Set(workHoursData.filter(wh => wh.name === offer.name).map(wh => wh.performer))];

  console.log('Performers:', performers);

  const promptText = document.createElement('p');
  promptText.textContent = 'Select Service Provider:';
  serviceProviderListContainer.appendChild(promptText);

  performers.forEach(performer => {
    console.log(`Adding button for performer: ${performer}`);
    const performerButton = document.createElement('button');
    performerButton.textContent = performer;
    performerButton.onclick = () => {
      console.log(`Performer selected: ${performer}`);
      document.getElementById("calendarModal").style.display = "block";
      generateCalendarForPerformer(performer, duration, offer.name);
    };
    serviceProviderListContainer.appendChild(performerButton);
  });

  const calendarContainer = document.getElementById('calendarContainer');
  calendarContainer.innerHTML = '';
  calendarContainer.appendChild(serviceProviderListContainer);

  const modal = document.getElementById("calendarModal");
  modal.style.display = "block";

  console.log('Service Provider list container appended to calendar container');
}

let currentYear, currentMonth;

function generateCalendarForPerformer(performerName, duration, offerName) {
  console.log(`generateCalendarForPerformer called for performer: ${performerName}`);
  const modal = document.getElementById("calendarModal");
  const calendarContainer = document.getElementById("calendarContainer");

  modal.style.display = "block";

  if (currentYear === undefined || currentMonth === undefined) {
    const date = new Date();
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
  }

  generateCalendar(performerName, calendarContainer, duration, currentYear, currentMonth, offerName);
}

function generateCalendar(performerName, container, duration, year, month, offerName) {
  console.log(`generateCalendar called for performer: ${performerName}`);
  const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
  const workHours = workHoursData.filter(wh => wh.performer === performerName);

  if (workHours.length === 0) {
    console.error(`Work hours data not found for performer: ${performerName}`);
    return;
  }

  const date = new Date(year, month);
  const monthName = date.toLocaleString('default', { month: 'long' });

  const workHoursForDay = workHours[0];
  const startTime = parseTime(workHoursForDay.workHoursStart);
  const endTime = parseTime(workHoursForDay.workHoursEnd);
  const serviceDuration = parseDuration(duration);

  container.innerHTML = `
    <h2>
      ${month > new Date().getMonth() || year > new Date().getFullYear() ? `<button onclick="changeMonth(-1, '${performerName}', '${duration}', '${offerName}')">«</button>` : ''}
      ${monthName} ${year}
      <button onclick="changeMonth(1, '${performerName}', '${duration}', '${offerName}')">»</button>
    </h2>
    <table class="calendar">
      <thead>
        <tr>
          <th>Sun</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
        </tr>
      </thead>
      <tbody>
        ${generateCalendarRows(new Date(year, month, 1).getDay(), new Date(year, month + 1, 0).getDate(), workHours, duration, performerName, startTime, endTime, serviceDuration, offerName)}
      </tbody>
    </table>
  `;
  console.log('Calendar generated and displayed');
}

function changeMonth(offset, performerName, duration, offerName) {
  const now = new Date();
  const current = new Date(currentYear, currentMonth);
  const nextMonth = new Date(current.setMonth(currentMonth + offset));

  if (nextMonth >= now || nextMonth.getFullYear() > now.getFullYear() || nextMonth.getMonth() >= now.getMonth()) {
    currentMonth = nextMonth.getMonth();
    currentYear = nextMonth.getFullYear();
    generateCalendar(performerName, document.getElementById('calendarContainer'), duration, currentYear, currentMonth, offerName);
  }
}

function generateCalendarRows(firstDayOfWeek, daysInMonth, workHours, duration, performerName, startTime, endTime, serviceDuration, offerName) {
  let rows = '';
  let day = 1;
  const selectedTimeSlots = JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]');

  for (let i = 0; i < 6; i++) {
    rows += '<tr>';
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfWeek) {
        rows += '<td></td>';
      } else if (day > daysInMonth) {
        rows += '<td></td>';
      } else {
        const currentDate = new Date(currentYear, currentMonth, day);
        const now = new Date();

        const isPastDate = currentDate < now && currentDate.toDateString() !== now.toDateString();
        const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const isWorkDay = workHours.some(wh => wh.day.toLowerCase() === dayOfWeek);

        if (isWorkDay) {
          const dateStr = `${currentYear}-${currentMonth + 1}-${day}`;
          const timeSlotsForDay = selectedTimeSlots.filter(slot => slot.date === dateStr && slot.performerName === performerName);

          const availableSlots = getAvailableSlotsForDay(startTime, endTime, serviceDuration, timeSlotsForDay, currentDate);

          if (availableSlots.length > 0 && !isPastDate) {
            rows += `<td class="selectable" onclick="selectDate(${day}, '${encodeURIComponent(JSON.stringify(workHours))}', '${duration}', '${performerName}', '${offerName}', event)">${day}</td>`;
          } else if (isPastDate) {
            rows += `<td class="past-date" title="This date has passed">${day}</td>`;
          } else {
            rows += `<td class="disabled" title="This day is fully booked">${day}</td>`;
          }
        } else {
          rows += `<td class="disabled" title="Business isn't working on this day">${day}</td>`;
        }
        day++;
      }
    }
    rows += '</tr>';
  }

  return rows;
}

function getAvailableSlotsForDay(startTime, endTime, serviceDuration, timeSlotsForDay, currentDate) {
  let availableSlots = [];
  const now = new Date();

  for (let time = startTime; time + serviceDuration <= endTime; time += serviceDuration) {
    const slotStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), time / (60 * 60 * 1000), (time % (60 * 60 * 1000)) / (60 * 1000));
    const slotEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), (time + serviceDuration) / (60 * 60 * 1000), ((time + serviceDuration) % (60 * 60 * 1000)) / (60 * 1000));

    if (slotStart > now) {
      const isSlotTaken = timeSlotsForDay.some(slot => {
        const slotStart = parseTime(slot.start);
        const slotEnd = parseTime(slot.end);
        return (slotStart <= time && slotEnd >= time + serviceDuration) || (slotStart < time + serviceDuration && slotEnd > time);
      });
      if (!isSlotTaken) {
        availableSlots.push({ start: formatTime(time), end: formatTime(time + serviceDuration) });
      }
    }
  }
  return availableSlots;
}

function selectDate(day, workHours, duration, performerName, offerName, event) {
  console.log(`selectDate called for day: ${day}`);
  const parsedWorkHours = JSON.parse(decodeURIComponent(workHours));
  const timeSlotContainer = document.createElement('div');
  timeSlotContainer.classList.add('time-slot-container');

  const selectedDay = new Date(currentYear, currentMonth, day);
  const dayOfWeek = selectedDay.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const workHoursForDay = parsedWorkHours.find(wh => wh.day.toLowerCase() === dayOfWeek);
  if (!workHoursForDay) {
    console.error(`Work hours not found for day: ${dayOfWeek}`);
    return;
  }

  const startTime = parseTime(workHoursForDay.workHoursStart);
  const endTime = parseTime(workHoursForDay.workHoursEnd);
  const serviceDuration = parseDuration(duration);

  const existingTimeSlotContainers = document.querySelectorAll('.time-slot-container');
  existingTimeSlotContainers.forEach(container => container.remove());

  const selectedTimeSlots = JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]');
  const selectedTimeSlotsForDay = selectedTimeSlots.filter(slot => slot.date === `${currentYear}-${currentMonth + 1}-${day}` && slot.performerName === performerName);

  const availableSlots = getAvailableSlotsForDay(startTime, endTime, serviceDuration, selectedTimeSlotsForDay, selectedDay);

  availableSlots.forEach(slot => {
    const button = document.createElement('button');
    button.textContent = `${slot.start} - ${slot.end}`;
    button.onclick = () => {
      selectTimeSlot(slot.start, slot.end, performerName, day, selectedDay, offerName);
    };
    timeSlotContainer.appendChild(button);
  });

  document.getElementById('calendarContainer').appendChild(timeSlotContainer);

  // Change color for the selected date
  const previouslySelected = document.querySelector('.calendar td.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }
  event.target.classList.add('selected');
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
}

function formatTime(time) {
  const hours = Math.floor(time / (60 * 60 * 1000));
  const minutes = (time % (60 * 60 * 1000)) / (60 * 1000);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function parseDuration(durationStr) {
  const [value, unit] = durationStr.split(' ');
  const duration = parseInt(value, 10);

  if (unit.includes('hour')) {
    return duration * 60 * 60 * 1000;
  } else if (unit.includes('minute')) {
    return duration * 60 * 1000;
  }
  return 0;
}

function selectTimeSlot(start, end, performerName, day, selectedDay, offerName) {
  const formattedDate = selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  alert(`You have selected the time slot from ${start} to ${end} on ${formattedDate}`);

  const selectedTimeSlots = JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]');
  selectedTimeSlots.push({ performerName, date: `${currentYear}-${currentMonth + 1}-${day}`, start, end, offerName });
  localStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots));

  updateServiceEngagementCount(offerName);
  location.reload();  // Refresh the page
}

function updateServiceEngagementCount(offerName) {
  const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
  allAdvertsKeys.forEach(key => {
    let adverts = JSON.parse(localStorage.getItem(key)) || [];
    const offerIndex = adverts.findIndex(offer => offer.name === offerName);
    if (offerIndex !== -1) {
      adverts[offerIndex].engagementCount = (adverts[offerIndex].engagementCount || 0) + 1;
      localStorage.setItem(key, JSON.stringify(adverts));
    }
  });
}

function logStorageContents() {
  console.log("serviceAdverts:", JSON.parse(localStorage.getItem('serviceAdverts') || '[]'));
  console.log("searchResults:", JSON.parse(localStorage.getItem('searchResults') || '[]'));
  console.log("searchQuery:", localStorage.getItem('searchQuery') || '');
  console.log("userZipCode:", localStorage.getItem('userZipCode') || '');
  console.log("workHoursData:", JSON.parse(localStorage.getItem('workHoursData') || '[]'));
  console.log("selectedTimeSlots:", JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]'));
}

// Call the logStorageContents function to log the contents of local storage
logStorageContents();

document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.menu');

    menuButton.addEventListener('click', function () {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', function (event) {
        if (!menu.contains(event.target) && event.target !== menuButton) {
            menu.style.display = 'none';
        }
    });
});

function logOut() {
    console.log('Logging out...');
    // Perform any logout actions here, like clearing tokens or redirecting to the login page
    localStorage.removeItem('userToken'); // Example of removing a token from localStorage
    window.location.href = 'sign-in.html'; // Redirect to the sign-in page
}
