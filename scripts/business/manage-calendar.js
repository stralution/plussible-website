document.addEventListener('DOMContentLoaded', function () {
  console.log("manage-calendar.js loaded");

  function capitalizeWords(str) {
      return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  function populateSelects() {
      const employeeSelect = document.getElementById('employee-select');
      const machinerySelect = document.getElementById('machinery-select');

      const storedUserData = localStorage.getItem('currentUser');
      if (!storedUserData) {
          window.location.href = 'business-sign-in.html';
          return;
      }
      const currentUser = JSON.parse(storedUserData);

      let employees = JSON.parse(localStorage.getItem('employees')) || [];
      let machinery = JSON.parse(localStorage.getItem('machinery')) || [];

      employees = employees.filter(emp => emp.creatorId === currentUser.id).map(emp => capitalizeWords(emp.name));
      machinery = machinery.filter(mach => mach.creatorId === currentUser.id).map(mach => capitalizeWords(mach.name));

      employeeSelect.innerHTML = '<option value="">Select Employee</option>';
      machinerySelect.innerHTML = '<option value="">Select Machinery</option>';

      employees.forEach(employee => {
          const option = document.createElement('option');
          option.value = employee;
          option.textContent = employee;
          employeeSelect.appendChild(option);
      });

      machinery.forEach(machine => {
          const option = document.createElement('option');
          option.value = machine;
          option.textContent = machine;
          machinerySelect.appendChild(option);
      });
  }

  function populateServiceNames() {
      const serviceNameSelect = document.getElementById('service-name');
      const storedUserData = localStorage.getItem('currentUser');
      if (!storedUserData) {
          window.location.href = 'business-sign-in.html';
          return;
      }
      const currentUser = JSON.parse(storedUserData);
      const userSpecificKey = `user_${currentUser.id}_serviceAdverts`;
      const serviceAdverts = JSON.parse(localStorage.getItem(userSpecificKey)) || [];

      serviceNameSelect.innerHTML = '<option value="">Select Service Name</option>';
      serviceAdverts.forEach(service => {
          const option = document.createElement('option');
          option.value = service.name;
          option.textContent = service.name;
          serviceNameSelect.appendChild(option);
      });
  }

  function parseTime(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
  }

  function calculateDuration(startTime, endTime) {
      return parseTime(endTime) - parseTime(startTime);
  }

  function validateServiceDuration(serviceName, workHoursStart, workHoursEnd) {
      const storedUserData = localStorage.getItem('currentUser');
      if (!storedUserData) {
          window.location.href = 'business-sign-in.html';
          return;
      }
      const currentUser = JSON.parse(storedUserData);
      const userSpecificKey = `user_${currentUser.id}_serviceAdverts`;
      const serviceAdverts = JSON.parse(localStorage.getItem(userSpecificKey)) || [];
      const service = serviceAdverts.find(s => s.name === serviceName);

      if (!service) {
          alert('Service not found.');
          return false;
      }

      const serviceDuration = parseInt(service.duration.split(' ')[0], 10) * (service.duration.includes('hour') ? 60 : 1);
      const availableDuration = calculateDuration(workHoursStart, workHoursEnd);

      if (serviceDuration > availableDuration) {
          alert(`The service duration (${service.duration}) exceeds the available work hours (${workHoursStart} to ${workHoursEnd}).`);
          return false;
      }

      return true;
  }

  populateSelects();
  populateServiceNames();

  document.querySelectorAll('input[name="performed-by"]').forEach(radio => {
      radio.addEventListener('change', function () {
          const employeeSelectGroup = document.getElementById('employee-select-group');
          const machinerySelectGroup = document.getElementById('machinery-select-group');
          if (this.value === 'employee') {
              employeeSelectGroup.style.display = 'block';
              machinerySelectGroup.style.display = 'none';
          } else if (this.value === 'machinery') {
              employeeSelectGroup.style.display = 'none';
              machinerySelectGroup.style.display = 'block';
          }
      });
  });

  const previewCalendarModal = document.getElementById('preview-calendar-modal');
  const manpowerPopup = document.getElementById('manpower-popup');

  const closeModalButtons = document.querySelectorAll('.modal .close');
  closeModalButtons.forEach(btn => {
      btn.addEventListener('click', function () {
          this.closest('.modal').style.display = 'none';
      });
  });

  window.addEventListener('click', function (event) {
      closeModalButtons.forEach(btn => {
          if (event.target === btn.closest('.modal')) {
              btn.closest('.modal').style.display = 'none';
          }
      });
  });

  document.getElementById('save-work-hours').addEventListener('click', function () {
      const serviceName = document.getElementById('service-name').value.trim();
      const workDays = Array.from(document.querySelectorAll('input[name="work-day"]:checked')).map(checkbox => checkbox.value);
      const workHoursStart = document.getElementById('work-hours-start').value;
      const workHoursEnd = document.getElementById('work-hours-end').value;

      const performedBy = document.querySelector('input[name="performed-by"]:checked');
      let performer = null;

      if (performedBy) {
          performer = performedBy.value === 'employee' ? document.getElementById('employee-select').value : document.getElementById('machinery-select').value;
      }

      if (!serviceName || workDays.length === 0 || !workHoursStart || !workHoursEnd || !performer) {
          alert('Please complete all fields.');
          return;
      }

      if (!validateServiceDuration(serviceName, workHoursStart, workHoursEnd)) {
          return;
      }

      const storedUserData = localStorage.getItem('currentUser');
      if (!storedUserData) {
          window.location.href = 'business-sign-in.html';
          return;
      }
      const currentUser = JSON.parse(storedUserData);

      let workHoursData = JSON.parse(localStorage.getItem('workHoursData')) || [];

      // Check if the exact same entry already exists
      const existingEntry = workHoursData.some(workHour => 
          workHour.name === serviceName &&
          workHour.workHoursStart === workHoursStart &&
          workHour.workHoursEnd === workHoursEnd &&
          workHour.performer === performer &&
          workHour.creatorId === currentUser.id &&
          workDays.includes(workHour.day)
      );

      if (existingEntry) {
          alert('The exact information has already been saved. Please delete the existing entry before saving this information again.');
          return;
      }

      workDays.forEach(day => {
          const workHours = {
              id: '_' + Math.random().toString(36).substr(2, 9),
              name: serviceName,
              day,
              workHoursStart,
              workHoursEnd,
              performer,
              creatorId: currentUser.id
          };
          workHoursData.push(workHours);
      });

      localStorage.setItem('workHoursData', JSON.stringify(workHoursData));
      alert('Work hours saved successfully!');
      location.reload();  // Refresh the page
  });

  document.getElementById('preview-calendar').addEventListener('click', function () {
      previewCalendarModal.style.display = 'flex';
      renderCalendar();
  });

  function renderCalendar() {
      const viewCalendar = document.getElementById('view-calendar');
      const storedUserData = localStorage.getItem('currentUser');
      if (!storedUserData) {
          window.location.href = 'business-sign-in.html';
          return;
      }
      const currentUser = JSON.parse(storedUserData);

      const workHoursData = JSON.parse(localStorage.getItem('workHoursData')) || [];
      const userWorkHoursData = workHoursData.filter(workHour => workHour.creatorId === currentUser.id);

      console.log("workHoursData: ", userWorkHoursData); // Log the data to see if it exists

      // Filter out entries with undefined or invalid days
      const validWorkHoursData = userWorkHoursData.filter(workHour => workHour.day);

      // Group work hours by day
      const groupedByDay = validWorkHoursData.reduce((acc, curr) => {
          (acc[curr.day] = acc[curr.day] || []).push(curr);
          return acc;
      }, {});

      console.log("groupedByDay: ", groupedByDay); // Log the grouped data

      let tableContent = `
          <table>
              <thead>
                  <tr>
                      <th>Day</th>
                      <th>Service Name</th>
                      <th>Work Hours</th>
                      <th>Performer</th>
                      <th>ID</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
      `;

      if (validWorkHoursData.length === 0) {
          tableContent += `
              <tr>
                  <td colspan="6">No work hours saved.</td>
              </tr>
          `;
      } else {
          for (const day in groupedByDay) {
              const dayGroup = groupedByDay[day];
              console.log("Day group: ", day, dayGroup); // Log each day group
              dayGroup.forEach((workHour, index) => {
                  tableContent += `
                      <tr>
                          ${index === 0 ? `<td rowspan="${dayGroup.length}">${workHour.day.charAt(0).toUpperCase() + workHour.day.slice(1)}</td>` : ''}
                          <td>${workHour.name}</td>
                          <td>${workHour.workHoursStart} to ${workHour.workHoursEnd}</td>
                          <td>${workHour.performer}</td>
                          <td>${workHour.id}</td>
                          <td><button class="delete-button" data-id="${workHour.id}">Delete</button></td>
                      </tr>
                  `;
              });
          }
      }

      tableContent += `
              </tbody>
          </table>
      `;

      console.log("tableContent: ", tableContent); // Log the table content

      viewCalendar.innerHTML = tableContent;

      document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', function () {
              const id = this.getAttribute('data-id');
              let workHoursData = JSON.parse(localStorage.getItem('workHoursData')) || [];
              workHoursData = workHoursData.filter(workHour => workHour.id !== id);
              localStorage.setItem('workHoursData', JSON.stringify(workHoursData));
              renderCalendar();
          });
      });
  }

  document.getElementById('confirm-manpower').addEventListener('click', function () {
      manpowerPopup.style.display = 'none';
  });

  renderCalendar();
});
