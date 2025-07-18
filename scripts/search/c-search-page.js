document.addEventListener("DOMContentLoaded", function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
      window.location.href = 'sign-in.html';
      return;
  }

  const headerLogo = document.querySelector(".header-logo img");
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".menu");

  if (headerLogo) {
      headerLogo.addEventListener("click", function() {
          window.location.href = "c-plussible.html";
      });
  }

  menuButton.addEventListener("click", function() {
      menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  });

  window.logOut = function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'sign-in.html';
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

  // --- UNIQUE KEY HELPER ---
  function makeAdvertKey(name, businessName) {
      return `${name}__${businessName}`;
  }

  function searchAdverts(query) {
      const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
      let allAdverts = [];
      allAdvertsKeys.forEach(key => {
          const adverts = JSON.parse(localStorage.getItem(key)) || [];
          allAdverts = allAdverts.concat(adverts);
      });

      return allAdverts.filter(offer => {
          return Object.values(offer).some(value =>
              (typeof value === 'string' || Array.isArray(value)) &&
              value.toString().toLowerCase().includes(query)
          );
      });
  }

  const searchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
  const searchQuery = localStorage.getItem('searchQuery') || '';
  resultsHeading.textContent = `Results for: ${searchQuery}`;
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

  // --- FIX: Engagement is now per (name, businessName) ---
  function calculateEngagementCounts(selectedTimeSlots) {
      const engagementCounts = {};
      selectedTimeSlots.forEach(slot => {
          const advertKey = makeAdvertKey(slot.offerName, slot.businessName);
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
          const advertKey = makeAdvertKey(offer.name, offer.businessName);
          offer.engagementCount = engagementCounts[advertKey] || 0;
      });
  }

  function renderOffers(offers, page = 1) {
      offerList.innerHTML = '';
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      const paginatedOffers = offers.slice(start, end);
      paginatedOffers.forEach(offer => {
          if (!isOfferLive(offer.name)) return;

          const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
          const offerWorkHours = workHoursData.filter(wh => wh.name === offer.name);
          if (offerWorkHours.length === 0) return;

          const businessName = offer.businessName || 'Business Name';
          const engagementCount = offer.engagementCount || 0;
          const engagementText = engagementCount === 1 ? '1 time' : `${engagementCount} times`;

          const offerCard = document.createElement('div');
          offerCard.classList.add('offer-card');
          offerCard.innerHTML = `
              <div class="left">
                  <img src="${offer.image}" alt="${capitalizeFirstLetter(offer.name)}">
              </div>
              <div class="middle">
                  <div class="offer-name">${capitalizeFirstLetter(businessName)}</div>
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
                  <a href="#" class="engage-btn" onclick="showCalendar('${offer.name}', '${offer.priceType}', '${offer.duration}', '${offer.businessName}')">Engage Service</a>
              </div>
          `;
          offerList.appendChild(offerCard);

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
          prevLink.addEventListener('click', function(event) {
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
          pageLink.addEventListener('click', function(event) {
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
          nextLink.addEventListener('click', function(event) {
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

  searchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
          quickSearchButton.click();
      }
  });

  quickSearchButton.addEventListener('click', function(event) {
      event.preventDefault();
      const query = searchInput.value.toLowerCase().trim();
      const results = searchAdverts(query);

      if (results.length === 0) {
          errorMessage.textContent = 'No adverts found for the entered search term.';
      } else {
          errorMessage.textContent = '';
          localStorage.setItem('searchResults', JSON.stringify(results));
          localStorage.setItem('searchQuery', query);
          resultsHeading.textContent = `Results for: ${query}`;
          const engagementCounts = calculateEngagementCounts(JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]'));
          updateOffersWithEngagementCounts(results, engagementCounts);
          renderOffers(sortOffers(results, getSelectedFilters()), 1);
          renderPagination(results.length, itemsPerPage, 1);
      }
  });

  filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
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

document.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("calendarModal");
  const span = document.getElementsByClassName("close");

  Array.from(span).forEach(element => {
      element.onclick = function() {
          modal.style.display = "none";
      }
  });

  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
});

// --- Add businessName to calendar and engagement logic ---
function showCalendar(offerName, priceType, duration, businessName) {
  console.log(`showCalendar called for offer: ${offerName} / ${businessName}`);
  const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
  let allAdverts = [];
  allAdvertsKeys.forEach(key => {
      const adverts = JSON.parse(localStorage.getItem(key)) || [];
      allAdverts = allAdverts.concat(adverts);
  });
  const offer = allAdverts.find(offer => offer.name === offerName && offer.businessName === businessName);

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
      generateCalendar(offerName, calendarContainer, duration, undefined, undefined, businessName);
  }
}

function displayServiceProviderList(offer, duration) {
  console.log('displayServiceProviderList called');
  const serviceProviderListContainer = document.createElement('div');
  serviceProviderListContainer.classList.add('service-provider-list-container');

  const workHoursData = JSON.parse(localStorage.getItem('workHoursData') || '[]');
  // --- FIX: Only show performers for this business's service ---
  const performers = [
    ...new Set(
      workHoursData
        .filter(wh => wh.name === offer.name && wh.businessName === offer.businessName)
        .map(wh => wh.performer)
    )
  ];

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
          generateCalendarForPerformer(performer, duration, offer.name, offer.businessName);
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

function generateCalendarForPerformer(performerName, duration, offerName, businessName) {
  console.log(`generateCalendarForPerformer called for performer: ${performerName}`);
  const modal = document.getElementById("calendarModal");
  const calendarContainer = document.getElementById("calendarContainer");

  modal.style.display = "block";

  if (currentYear === undefined || currentMonth === undefined) {
      const date = new Date();
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
  }

  generateCalendar(performerName, calendarContainer, duration, currentYear, currentMonth, offerName, businessName);
}

function generateCalendar(performerName, container, duration, year, month, offerName, businessName) {
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
          ${month > new Date().getMonth() || year > new Date().getFullYear() ? `<button onclick="changeMonth(-1, '${performerName}', '${duration}', '${offerName}', '${businessName}')">«</button>` : ''}
          ${monthName} ${year}
          <button onclick="changeMonth(1, '${performerName}', '${duration}', '${offerName}', '${businessName}')">»</button>
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
              ${generateCalendarRows(new Date(year, month, 1).getDay(), new Date(year, month + 1, 0).getDate(), workHours, duration, performerName, startTime, endTime, serviceDuration, offerName, businessName)}
          </tbody>
      </table>
  `;
  console.log('Calendar generated and displayed');
}

function changeMonth(offset, performerName, duration, offerName, businessName) {
  const now = new Date();
  const current = new Date(currentYear, currentMonth);
  const nextMonth = new Date(current.setMonth(currentMonth + offset));

  if (nextMonth >= now || nextMonth.getFullYear() > now.getFullYear() || nextMonth.getMonth() >= now.getMonth()) {
      currentMonth = nextMonth.getMonth();
      currentYear = nextMonth.getFullYear();
      generateCalendar(performerName, document.getElementById('calendarContainer'), duration, currentYear, currentMonth, offerName, businessName);
  }
}

function generateCalendarRows(firstDayOfWeek, daysInMonth, workHours, duration, performerName, startTime, endTime, serviceDuration, offerName, businessName) {
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
                  const timeSlotsForDay = selectedTimeSlots.filter(slot => slot.date === dateStr && slot.performerName === performerName && slot.offerName === offerName && slot.businessName === businessName);

                  const availableSlots = getAvailableSlotsForDay(startTime, endTime, serviceDuration, timeSlotsForDay, currentDate);

                  if (availableSlots.length > 0 && !isPastDate) {
                      rows += `<td class="selectable" onclick="selectDate(${day}, '${encodeURIComponent(JSON.stringify(workHours))}', '${duration}', '${performerName}', '${offerName}', '${businessName}', event)">${day}</td>`;
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

function selectDate(day, workHours, duration, performerName, offerName, businessName, event) {
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
  const selectedTimeSlotsForDay = selectedTimeSlots.filter(slot => slot.date === `${currentYear}-${currentMonth + 1}-${day}` && slot.performerName === performerName && slot.offerName === offerName && slot.businessName === businessName);

  const availableSlots = getAvailableSlotsForDay(startTime, endTime, serviceDuration, selectedTimeSlotsForDay, selectedDay);

  availableSlots.forEach(slot => {
      const button = document.createElement('button');
      button.textContent = `${slot.start} - ${slot.end}`;
      button.onclick = () => {
          selectTimeSlot(slot.start, slot.end, performerName, day, selectedDay, offerName, businessName);
      };
      timeSlotContainer.appendChild(button);
  });

  document.getElementById('calendarContainer').appendChild(timeSlotContainer);

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

function selectTimeSlot(start, end, performerName, day, selectedDay, offerName, businessName) {
  const formattedDate = selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  alert(`You have selected the time slot from ${start} to ${end} on ${formattedDate}`);

  const selectedTimeSlots = JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]');
  selectedTimeSlots.push({ performerName, date: `${currentYear}-${currentMonth + 1}-${day}`, start, end, offerName, businessName });
  localStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots));

  updateServiceEngagementCount(offerName, businessName);
  addPendingOrder(offerName, businessName); // Function to add offer to pending orders
  location.reload();
}

// --- fix: engagement only for correct (offerName, businessName) ---
function updateServiceEngagementCount(offerName, businessName) {
  const allAdvertsKeys = Object.keys(localStorage).filter(key => key.startsWith('user_') && key.endsWith('_serviceAdverts'));
  allAdvertsKeys.forEach(key => {
      let adverts = JSON.parse(localStorage.getItem(key)) || [];
      const offerIndex = adverts.findIndex(offer => offer.name === offerName && offer.businessName === businessName);
      if (offerIndex !== -1) {
          adverts[offerIndex].engagementCount = (adverts[offerIndex].engagementCount || 0) + 1;
          localStorage.setItem(key, JSON.stringify(adverts));
      }
  });
}

function addPendingOrder(offerName, businessName) {
  const searchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
  const offer = searchResults.find(offer => offer.name === offerName && offer.businessName === businessName);
  if (offer) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userPendingOrdersKey = `pendingOrders_${currentUser.username}`;
      const pendingOrders = JSON.parse(localStorage.getItem(userPendingOrdersKey)) || [];
      pendingOrders.push(offer);
      localStorage.setItem(userPendingOrdersKey, JSON.stringify(pendingOrders));
  }
}

function logStorageContents() {
  console.log("serviceAdverts:", JSON.parse(localStorage.getItem('serviceAdverts') || '[]'));
  console.log("searchResults:", JSON.parse(localStorage.getItem('searchResults') || '[]'));
  console.log("searchQuery:", localStorage.getItem('searchQuery') || '');
  console.log("userZipCode:", localStorage.getItem('userZipCode') || '');
  console.log("workHoursData:", JSON.parse(localStorage.getItem('workHoursData') || '[]'));
  console.log("selectedTimeSlots:", JSON.parse(localStorage.getItem('selectedTimeSlots') || '[]'));
}

logStorageContents();
