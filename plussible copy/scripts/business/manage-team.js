document.addEventListener('DOMContentLoaded', function () {
  function showForm(formId) {
      document.getElementById('employee-form').style.display = formId === 'employee-form' ? 'block' : 'none';
      document.getElementById('machinery-form').style.display = formId === 'machinery-form' ? 'block' : 'none';
  }

  function createTagElement(value, container) {
      const tag = document.createElement('div');
      tag.className = 'function-tag';
      tag.innerHTML = `
          <span>${value}</span>
          <button type="button" class="remove-tag">&times;</button>
      `;
      container.appendChild(tag);
      tag.querySelector('.remove-tag').addEventListener('click', function () {
          container.removeChild(tag);
      });
  }

  function getTags(container) {
      return Array.from(container.querySelectorAll('.function-tag span')).map(tag => tag.textContent);
  }

  document.getElementById('register-employee').addEventListener('click', function () {
      showForm('employee-form');
  });

  document.getElementById('register-machinery').addEventListener('click', function () {
      showForm('machinery-form');
  });

  document.getElementById('employee-functions').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
          createTagElement(this.value.trim(), document.getElementById('employee-function-tags'));
          this.value = '';
          e.preventDefault();
      }
  });

  document.getElementById('machinery-functions').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
          createTagElement(this.value.trim(), document.getElementById('machinery-function-tags'));
          this.value = '';
          e.preventDefault();
      }
  });

  document.getElementById('save-employee').addEventListener('click', function () {
      const firstName = document.getElementById('employee-first-name').value.trim();
      const lastName = document.getElementById('employee-last-name').value.trim();
      const functions = getTags(document.getElementById('employee-function-tags'));
      const employeeName = `${firstName} ${lastName}`;

      if (!firstName || !lastName || functions.length === 0) {
          alert('Please fill in all fields.');
          return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      let employees = JSON.parse(localStorage.getItem('employees')) || [];
      const existingEmployee = employees.find(employee => employee.name === employeeName && employee.creatorId === currentUser.id);

      if (existingEmployee) {
          const overlappingFunctions = existingEmployee.functions.some(func => functions.includes(func));
          if (overlappingFunctions) {
              alert('An employee with this name and one or more of the same functions already exists.');
              return;
          } else {
              const confirmNewFunction = confirm(`${employeeName} already exists but with a different function. Do you agree it is the same employee but with a new function?`);
              if (!confirmNewFunction) {
                  return;
              }
              existingEmployee.functions = [...new Set([...existingEmployee.functions, ...functions])];
              localStorage.setItem('employees', JSON.stringify(employees));
              alert('Employee updated with new functions successfully!');
              location.reload();
              return;
          }
      }

      const uniqueId = '_' + Math.random().toString(36).substr(2, 9);
      employees.push({ id: uniqueId, name: employeeName, functions, creatorId: currentUser.id });
      localStorage.setItem('employees', JSON.stringify(employees));
      alert('Employee saved successfully!');
      location.reload();
  });

  document.getElementById('save-machinery').addEventListener('click', function () {
      const machineName = document.getElementById('machinery-name').value.trim();
      const functions = getTags(document.getElementById('machinery-function-tags'));

      if (!machineName || functions.length === 0) {
          alert('Please fill in all fields.');
          return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      let machinery = JSON.parse(localStorage.getItem('machinery')) || [];
      const existingMachine = machinery.find(machine => machine.name === machineName && machine.creatorId === currentUser.id);

      if (existingMachine) {
          const overlappingFunctions = existingMachine.functions.some(func => functions.includes(func));
          if (overlappingFunctions) {
              alert('A machine with this name and one or more of the same functions already exists.');
              return;
          } else {
              const confirmNewFunction = confirm(`${machineName} already exists but with a different function. Do you agree it is the same machine but with a new function?`);
              if (!confirmNewFunction) {
                  return;
              }
              existingMachine.functions = [...new Set([...existingMachine.functions, ...functions])];
              localStorage.setItem('machinery', JSON.stringify(machinery));
              alert('Machinery updated with new functions successfully!');
              location.reload();
              return;
          }
      }

      const uniqueId = '_' + Math.random().toString(36).substr(2, 9);
      machinery.push({ id: uniqueId, name: machineName, functions, creatorId: currentUser.id });
      localStorage.setItem('machinery', JSON.stringify(machinery));
      alert('Machinery saved successfully!');
      location.reload();
  });

  document.getElementById('preview-team').addEventListener('click', function () {
      document.getElementById('preview-team-modal').style.display = 'flex';
      renderTeam();
  });

  document.getElementById('close-preview-team').addEventListener('click', function () {
      document.getElementById('preview-team-modal').style.display = 'none';
  });

  window.addEventListener('click', function (event) {
      if (event.target === document.getElementById('preview-team-modal')) {
          document.getElementById('preview-team-modal').style.display = 'none';
      }
  });

  function renderTeam() {
      const viewTeam = document.getElementById('view-team');
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      const employees = JSON.parse(localStorage.getItem('employees')) || [];
      const machinery = JSON.parse(localStorage.getItem('machinery')) || [];

      console.log("Employees data:", employees);
      console.log("Machinery data:", machinery);

      let tableContent = `
          <table>
              <thead>
                  <tr>
                      <th>Type</th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Functions</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
      `;

      const userEmployees = employees.filter(employee => employee.creatorId === currentUser.id);
      const userMachinery = machinery.filter(machine => machine.creatorId === currentUser.id);

      if (userEmployees.length === 0 && userMachinery.length === 0) {
          tableContent += `
              <tr>
                  <td colspan="5">No team members saved.</td>
              </tr>
          `;
      } else {
          userEmployees.forEach(employee => {
              tableContent += `
                  <tr>
                      <td>Employee</td>
                      <td>${employee.id}</td>
                      <td>${employee.name}</td>
                      <td>${employee.functions.join(', ')}</td>
                      <td><button class="delete-button" data-type="employee" data-id="${employee.id}">Delete</button></td>
                  </tr>
              `;
          });

          userMachinery.forEach(machine => {
              tableContent += `
                  <tr>
                      <td>Machinery</td>
                      <td>${machine.id}</td>
                      <td>${machine.name}</td>
                      <td>${machine.functions.join(', ')}</td>
                      <td><button class="delete-button" data-type="machinery" data-id="${machine.id}">Delete</button></td>
                  </tr>
              `;
          });
      }

      tableContent += `
              </tbody>
          </table>
      `;

      viewTeam.innerHTML = tableContent;

      document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', function () {
              const type = this.getAttribute('data-type');
              const id = this.getAttribute('data-id');

              if (type === 'employee') {
                  let employees = JSON.parse(localStorage.getItem('employees')) || [];
                  employees = employees.filter(employee => employee.id !== id);
                  localStorage.setItem('employees', JSON.stringify(employees));
              } else if (type === 'machinery') {
                  let machinery = JSON.parse(localStorage.getItem('machinery')) || [];
                  machinery = machinery.filter(machine => machine.id !== id);
                  localStorage.setItem('machinery', JSON.stringify(machinery));
              }

              renderTeam();
          });
      });
  }

  // Check login status
  const storedUserData = localStorage.getItem('currentUser');
  if (!storedUserData) {
      // Redirect to login page if not logged in
      window.location.href = 'business-sign-in.html';
  }
});
