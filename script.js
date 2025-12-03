// Ensure DOM is fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
  // Check the current page to initialize the correct logic
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('login.html');
  const isSignUpPage = currentPath.includes('signup.html');
  const isMainPage = currentPath.endsWith('index.html') || currentPath === '/expense-tracker/' || currentPath === '/';

  // Session Management
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // Store the logged-in user's email

  // Helper function to hash passwords
  function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  // Helper function to get all users from localStorage
  function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
  }

  // Helper function to save users to localStorage
  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Toggle Log In/Log Out visibility
  function updateNavBar() {
    const navLogin = document.getElementById('navLogin');
    const navLogOut = document.getElementById('navLogOut');
    if (navLogin && navLogOut) {
      if (loggedInUser) {
        navLogin.classList.add('hidden');
        navLogOut.classList.remove('hidden');
      } else {
        navLogin.classList.remove('hidden');
        navLogOut.classList.add('hidden');
      }
    }
  }

  // Log Out functionality
  function handleLogOut() {
    localStorage.removeItem('loggedInUser');
    updateNavBar();
    // Redirect to login page
    window.location.href = isMainPage ? 'pages/login.html' : 'login.html';
  }

  const navLogOut = document.getElementById('navLogOut');
  if (navLogOut) {
    navLogOut.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogOut();
    });
  }

  // Logic for Login page
  if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.loginEmail.value.trim().toLowerCase();
        const password = loginForm.loginPassword.value;

        const users = getUsers();
        const hashedPassword = hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);

        if (user) {
          // Successful login
          localStorage.setItem('loggedInUser', JSON.stringify({ email }));
          loginForm.reset();
          alert('Login successful!');
          window.location.href = '../index.html'; // Redirect to index.html
        } else {
          alert('Invalid email or password.');
        }
      });
    }
    return; // Exit early since this is the login page
  }

  // Logic for Sign Up page
  if (isSignUpPage) {
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = signUpForm.signUpFullName.value.trim();
        const email = signUpForm.signUpEmail.value.trim().toLowerCase();
        const password = signUpForm.signUpPassword.value;
        const confirmPassword = signUpForm.signUpConfirmPassword.value;

        if (password !== confirmPassword) {
          alert('Passwords do not match!');
          return;
        }

        const users = getUsers();
        if (users.some(u => u.email === email)) {
          alert('Email already registered. Please log in or use a different email.');
          return;
        }

        const hashedPassword = hashPassword(password);
        const newUser = { email, password: hashedPassword, fullName };
        users.push(newUser);
        saveUsers(users);

        // Auto-login after signup
        localStorage.setItem('loggedInUser', JSON.stringify({ email }));
        signUpForm.reset();
        alert('Sign Up successful!');
        window.location.href = '../index.html'; // Redirect to index.html
      });
    }
    return; // Exit early since this is the sign-up page
  }

  // Main page logic (index.html)
  if (isMainPage) {
    // Redirect to login if not logged in
    if (!loggedInUser) {
      window.location.href = 'pages/login.html';
      return;
    }

    // Update navbar state
    updateNavBar();

    // Navigation elements
    const navBudgets = document.getElementById('navBudgets');
    const navExpenses = document.getElementById('navExpenses');
    const navDashboard = document.getElementById('navDashboard');
    const navProfile = document.getElementById('navProfile');
    const expensesScreen = document.getElementById('expensesScreen');
    const budgetsScreen = document.getElementById('budgetsScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const profileScreen = document.getElementById('profileScreen');

    // Function to show a specific screen and hide others
    function showScreen(screen) {
      console.log('Showing screen:', screen.id);
      const screens = [expensesScreen, budgetsScreen, dashboardScreen, profileScreen];
      screens.forEach(s => {
        if (s) s.classList.add('hidden');
      });
      screen.classList.remove('hidden');
    }

    // Navigation handlers
    if (navBudgets) {
      navBudgets.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(budgetsScreen);
        updateBudgets();
      });
    }

    if (navExpenses) {
      navExpenses.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(expensesScreen);
      });
    }

    if (navDashboard) {
      navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(dashboardScreen);
        updateDashboard();
      });
    }

    if (navProfile) {
      navProfile.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(profileScreen);
        populateProfileForm();
      });
    }

    // Populate Profile Form with User Data
    function populateProfileForm() {
      const users = getUsers();
      const user = users.find(u => u.email === loggedInUser.email);
      if (user) {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
          profileForm.fullName.value = user.fullName || '';
          profileForm.email.value = user.email || '';
          profileForm.email.disabled = true; // Prevent editing email
        }
      }
    }

    // Profile Form Logic
    const profileForm = document.getElementById('profileForm');
    const logOutBtn = document.getElementById('logOutBtn');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = profileForm.fullName.value.trim();
        const phone = profileForm.phone.value.trim();
        const username = profileForm.username.value.trim();
        const accountType = profileForm.accountType.value;

        // Update user data in localStorage
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === loggedInUser.email);
        if (userIndex !== -1) {
          users[userIndex].fullName = fullName;
          users[userIndex].phone = phone;
          users[userIndex].username = username;
          users[userIndex].accountType = accountType;
          saveUsers(users);
          alert('Profile updated successfully!');
        }
      });
    }

    if (logOutBtn) {
      logOutBtn.addEventListener('click', () => {
        handleLogOut();
      });
    }

    // Expense Modal Logic
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const expenseModal = document.getElementById('expenseModal');
    const closeExpenseModalBtn = document.getElementById('closeExpenseModalBtn');
    const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
    const expenseForm = document.getElementById('expenseForm');
    const expenseTableBody = document.getElementById('expenseTableBody');
    const expenseModalTitle = document.getElementById('expenseModalTitle');
    const submitExpenseBtn = document.getElementById('submitExpenseBtn');

    let expenseEditMode = false;
    let expenseEditRow = null;

    function openExpenseModal() {
      console.log('Opening expense modal');
      expenseModal.classList.remove('hidden');
      modalBackdrop.classList.remove('hidden');
    }

    function closeExpenseModal() {
      console.log('Closing expense modal');
      expenseModal.classList.add('hidden');
      modalBackdrop.classList.add('hidden');
      expenseForm.reset();
      expenseEditMode = false;
      expenseEditRow = null;
      expenseModalTitle.textContent = 'Add New Expense';
      submitExpenseBtn.textContent = 'Add Expense';
      expenseForm.expenseDate.removeAttribute('disabled');
    }

    if (addExpenseBtn) {
      addExpenseBtn.addEventListener('click', () => {
        openExpenseModal();
      });
    }

    if (closeExpenseModalBtn) {
      closeExpenseModalBtn.addEventListener('click', closeExpenseModal);
    }

    if (cancelExpenseBtn) {
      cancelExpenseBtn.addEventListener('click', closeExpenseModal);
    }

    // Budget Modal Logic
    const addBudgetBtn = document.getElementById('addBudgetBtn');
    const budgetModal = document.getElementById('budgetModal');
    const closeBudgetModalBtn = document.getElementById('closeBudgetModalBtn');
    const cancelBudgetBtn = document.getElementById('cancelBudgetBtn');
    const budgetForm = document.getElementById('budgetForm');
    const budgetTableBody = document.getElementById('budgetTableBody');
    const budgetModalTitle = document.getElementById('budgetModalTitle');
    const submitBudgetBtn = document.getElementById('submitBudgetBtn');

    let budgetEditMode = false;
    let budgetEditRow = null;

    function openBudgetModal() {
      console.log('Opening budget modal');
      budgetModal.classList.remove('hidden');
      modalBackdrop.classList.remove('hidden');
    }

    function closeBudgetModal() {
      console.log('Closing budget modal');
      budgetModal.classList.add('hidden');
      modalBackdrop.classList.add('hidden');
      budgetForm.reset();
      budgetEditMode = false;
      budgetEditRow = null;
      budgetModalTitle.textContent = 'Add New Budget';
      submitBudgetBtn.textContent = 'Add Budget';
      budgetForm.budgetMonth.removeAttribute('disabled');
    }

    if (addBudgetBtn) {
      addBudgetBtn.addEventListener('click', () => {
        openBudgetModal();
      });
    }

    if (closeBudgetModalBtn) {
      closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
    }

    if (cancelBudgetBtn) {
      cancelBudgetBtn.addEventListener('click', closeBudgetModal);
    }

    // Close both modals when clicking the backdrop
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => {
        closeExpenseModal();
        closeBudgetModal();
      });
    }

    // Function to calculate spent amount for a given month and category
    function calculateSpent(month, category) {
      const expenseRows = Array.from(expenseTableBody.querySelectorAll('tr'));
      let spent = 0;

      expenseRows.forEach(row => {
        const tds = row.querySelectorAll('td');
        const dateText = tds[0].textContent.trim();
        const expenseCategory = tds[1].querySelector('span').textContent.trim();
        const amountText = tds[3].textContent.trim().replace('$', '');
        const amount = parseFloat(amountText) || 0;

        const expenseDate = new Date(dateText);
        const expenseMonth = expenseDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (expenseMonth === month && expenseCategory === category) {
          spent += amount;
        }
      });

      return spent.toFixed(2);
    }

    // Function to update all budgets
    function updateBudgets() {
      const budgetRows = Array.from(budgetTableBody.querySelectorAll('tr'));
      budgetRows.forEach(row => {
        const tds = row.querySelectorAll('td');
        const month = tds[0].textContent.trim();
        const category = tds[1].textContent.trim();
        const budgetAmount = parseFloat(tds[2].textContent.replace('$', '')) || 0;

        const spent = parseFloat(calculateSpent(month, category));
        const remaining = (budgetAmount - spent).toFixed(2);
        const progress = budgetAmount > 0 ? ((spent / budgetAmount) * 100).toFixed(0) : 0;

        tds[3].textContent = `$${spent}`;
        tds[4].textContent = `$${remaining}`;
        const progressBar = tds[5].querySelector('progress');
        progressBar.value = progress;
        tds[5].querySelector('.progress-text').textContent = `${progress}%`;
      });
    }

    // Function to check for duplicate budgets
    function hasDuplicateBudget(month, category, excludeRow = null) {
      const budgetRows = Array.from(budgetTableBody.querySelectorAll('tr'));
      return budgetRows.some(row => {
        if (excludeRow && row === excludeRow) return false;
        const tds = row.querySelectorAll('td');
        const existingMonth = tds[0].textContent.trim();
        const existingCategory = tds[1].textContent.trim();
        return existingMonth === month && existingCategory === category;
      });
    }

    // Expense Form Submission
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const dateValue = new Date(expenseForm.expenseDate.value);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateValue.toLocaleDateString(undefined, options);

        const categoryValue = expenseForm.expenseCategory.value;
        const descriptionValue = expenseForm.expenseDescription.value.trim();
        const amountValue = parseFloat(expenseForm.expenseAmount.value).toFixed(2);

        if (expenseEditMode && expenseEditRow) {
          // Update existing row
          const tds = expenseEditRow.querySelectorAll('td');
          tds[0].textContent = formattedDate;
          const categorySpan = tds[1].querySelector('span');
          categorySpan.textContent = categoryValue;
          tds[2].textContent = descriptionValue;
          tds[3].textContent = `$${amountValue}`;
        } else {
          // Create new row
          const tr = document.createElement('tr');

          // Date cell
          const tdDate = document.createElement('td');
          tdDate.textContent = formattedDate;
          tr.appendChild(tdDate);

          // Category cell with badge
          const tdCategory = document.createElement('td');
          const spanCategory = document.createElement('span');
          spanCategory.className = 'category-badge';
          spanCategory.textContent = categoryValue;
          tdCategory.appendChild(spanCategory);
          tr.appendChild(tdCategory);

          // Description cell
          const tdDescription = document.createElement('td');
          tdDescription.textContent = descriptionValue;
          tr.appendChild(tdDescription);

          // Amount cell
          const tdAmount = document.createElement('td');
          tdAmount.className = 'amount';
          tdAmount.textContent = `$${amountValue}`;
          tr.appendChild(tdAmount);

          // Actions cell
          const tdActions = document.createElement('td');
          tdActions.className = 'actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'edit-btn';
          editBtn.textContent = 'Edit';

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = 'Delete';

          tdActions.appendChild(editBtn);
          tdActions.appendChild(deleteBtn);
          tr.appendChild(tdActions);

          expenseTableBody.appendChild(tr);
        }

        closeExpenseModal();
        updateBudgets();
        updateDashboard();
      });
    }

    // Handle edit and delete buttons for expenses
    if (expenseTableBody) {
      expenseTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
          const row = e.target.closest('tr');
          if (row) {
            row.remove();
            updateBudgets();
            updateDashboard();
          }
        } else if (e.target.classList.contains('edit-btn')) {
          const row = e.target.closest('tr');
          if (!row) return;

          expenseEditMode = true;
          expenseEditRow = row;

          // Fill form with current values
          const tds = row.querySelectorAll('td');

          // Parse date text back to yyyy-mm-dd for input[type=date]
          const dateText = tds[0].textContent.trim();
          const parsedDate = new Date(dateText);
          const yyyy = parsedDate.getFullYear();
          const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(parsedDate.getDate()).padStart(2, '0');
          expenseForm.expenseDate.value = `${yyyy}-${mm}-${dd}`;

          // Disable date input to prevent changing date on edit
          expenseForm.expenseDate.setAttribute('disabled', 'disabled');

          const categoryText = tds[1].querySelector('span').textContent.trim();
          expenseForm.expenseCategory.value = categoryText;

          expenseForm.expenseDescription.value = tds[2].textContent.trim();

          const amountText = tds[3].textContent.trim().replace('$', '');
          expenseForm.expenseAmount.value = parseFloat(amountText);

          expenseModalTitle.textContent = 'Edit Expense';
          submitExpenseBtn.textContent = 'Save Changes';

          openExpenseModal();
        }
      });
    }

    // Budget Form Submission
    if (budgetForm) {
      budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const monthValue = new Date(budgetForm.budgetMonth.value);
        const formattedMonth = monthValue.toLocaleString('default', { month: 'long', year: 'numeric' });

        const categoryValue = budgetForm.budgetCategory.value;
        const budgetAmountValue = parseFloat(budgetForm.budgetAmount.value).toFixed(2);

        // Check for duplicates
        if (hasDuplicateBudget(formattedMonth, categoryValue, budgetEditMode ? budgetEditRow : null)) {
          alert(`A budget for ${categoryValue} in ${formattedMonth} already exists. Please edit the existing budget or choose a different month/category.`);
          return;
        }

        // Calculate spent and remaining
        const spentValue = parseFloat(calculateSpent(formattedMonth, categoryValue));
        const remainingValue = (budgetAmountValue - spentValue).toFixed(2);
        const progressValue = budgetAmountValue > 0 ? ((spentValue / budgetAmountValue) * 100).toFixed(0) : 0;

        if (budgetEditMode && budgetEditRow) {
          // Update existing row
          const tds = budgetEditRow.querySelectorAll('td');
          tds[0].textContent = formattedMonth;
          tds[1].textContent = categoryValue;
          tds[2].textContent = `$${budgetAmountValue}`;
          tds[3].textContent = `$${spentValue}`;
          tds[4].textContent = `$${remainingValue}`;
          const progressBar = tds[5].querySelector('progress');
          progressBar.value = progressValue;
          tds[5].querySelector('.progress-text').textContent = `${progressValue}%`;
        } else {
          // Create new row
          const tr = document.createElement('tr');

          // Month cell
          const tdMonth = document.createElement('td');
          tdMonth.textContent = formattedMonth;
          tr.appendChild(tdMonth);

          // Category cell
          const tdCategory = document.createElement('td');
          tdCategory.textContent = categoryValue;
          tr.appendChild(tdCategory);

          // Budget Amount cell
          const tdBudgetAmount = document.createElement('td');
          tdBudgetAmount.textContent = `$${budgetAmountValue}`;
          tr.appendChild(tdBudgetAmount);

          // Spent cell
          const tdSpent = document.createElement('td');
          tdSpent.textContent = `$${spentValue}`;
          tr.appendChild(tdSpent);

          // Remaining cell
          const tdRemaining = document.createElement('td');
          tdRemaining.textContent = `$${remainingValue}`;
          tr.appendChild(tdRemaining);

          // Progress cell
          const tdProgress = document.createElement('td');
          const progressBar = document.createElement('progress');
          progressBar.max = 100;
          progressBar.value = progressValue;
          const progressText = document.createElement('div');
          progressText.className = 'progress-text';
          progressText.textContent = `${progressValue}%`;
          tdProgress.appendChild(progressBar);
          tdProgress.appendChild(progressText);
          tr.appendChild(tdProgress);

          // Actions cell
          const tdActions = document.createElement('td');
          tdActions.className = 'actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'edit-btn';
          editBtn.textContent = 'Edit';

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = 'Delete';

          tdActions.appendChild(editBtn);
          tdActions.appendChild(deleteBtn);
          tr.appendChild(tdActions);

          budgetTableBody.appendChild(tr);
        }

        closeBudgetModal();
        updateBudgets();
      });
    }

    // Handle edit and delete buttons for budgets
    if (budgetTableBody) {
      budgetTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
          const row = e.target.closest('tr');
          if (row) {
            row.remove();
            updateBudgets();
          }
        } else if (e.target.classList.contains('edit-btn')) {
          const row = e.target.closest('tr');
          if (!row) return;

          budgetEditMode = true;
          budgetEditRow = row;

          // Fill form with current values
          const tds = row.querySelectorAll('td');

          // Parse month text back to yyyy-mm for input[type=month]
          const monthText = tds[0].textContent.trim();
          const parsedMonth = new Date(monthText);
          const yyyy = parsedMonth.getFullYear();
          const mm = String(parsedMonth.getMonth() + 1).padStart(2, '0');
          budgetForm.budgetMonth.value = `${yyyy}-${mm}`;

          // Disable month input to prevent changing month on edit
          budgetForm.budgetMonth.setAttribute('disabled', 'disabled');

          const categoryText = tds[1].textContent.trim();
          budgetForm.budgetCategory.value = categoryText;

          const budgetAmountText = tds[2].textContent.trim().replace('$', '');
          budgetForm.budgetAmount.value = parseFloat(budgetAmountText);

          budgetModalTitle.textContent = 'Edit Budget';
          submitBudgetBtn.textContent = 'Save Changes';

          openBudgetModal();
        }
      });
    }

    // Dashboard Charts and Data
    const totalExpenseElem = document.getElementById('totalExpense');
    const pieChartCtx = document.getElementById('pieChart')?.getContext('2d');
    const barChartCtx = document.getElementById('barChart')?.getContext('2d');
    const pieLegend = document.getElementById('pieLegend');

    let pieChart, barChart;

    function updateDashboard() {
      console.log('Updating dashboard');
      const rows = Array.from(expenseTableBody.querySelectorAll('tr'));
      const categoryTotals = {};
      const monthlyTotals = {};

      let totalExpense = 0;

      rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        const dateText = tds[0].textContent.trim();
        const category = tds[1].querySelector('span').textContent.trim();
        const amountText = tds[3].textContent.trim().replace('$', '');
        const amount = parseFloat(amountText) || 0;

        totalExpense += amount;

        if (!categoryTotals[category]) categoryTotals[category] = 0;
        categoryTotals[category] += amount;

        const date = new Date(dateText);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
        monthlyTotals[monthKey] += amount;
      });

      if (totalExpenseElem) {
        totalExpenseElem.textContent = `$${totalExpense.toFixed(2)}`;
      }

      const pieLabels = Object.keys(categoryTotals);
      const pieData = pieLabels.map(label => categoryTotals[label]);
      const pieColors = pieLabels.map((_, i) => `hsl(${(i * 360 / pieLabels.length)}, 70%, 50%)`);

      if (pieChartCtx) {
        if (pieChart) pieChart.destroy();

        pieChart = new Chart(pieChartCtx, {
          type: 'pie',
          data: {
            labels: pieLabels,
            datasets: [{
              data: pieData,
              backgroundColor: pieColors,
              borderWidth: 1,
              borderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      if (pieLegend) {
        pieLegend.innerHTML = '';
        pieLabels.forEach((label, i) => {
          const li = document.createElement('li');
          li.className = 'flex items-center space-x-2';
          li.innerHTML = `<span style="background-color: ${pieColors[i]}"></span><span>${label}</span>`;
          pieLegend.appendChild(li);
        });
      }

      const sortedMonths = Object.keys(monthlyTotals).sort();
      const barLabels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      const barData = sortedMonths.map(m => monthlyTotals[m]);

      if (barChartCtx) {
        if (barChart) barChart.destroy();

        barChart = new Chart(barChartCtx, {
          type: 'bar',
          data: {
            labels: barLabels,
            datasets: [{
              label: 'Amount',
              data: barData,
              backgroundColor: 'rgba(37, 99, 235, 0.7)',
              borderColor: 'rgba(37, 99, 235, 1)',
              borderWidth: 1,
              borderRadius: 4,
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value;
                  }
                }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    // Initialize the main page
    console.log('Page loaded - initializing main app');
    closeExpenseModal();
    closeBudgetModal();
    showScreen(expensesScreen); // Default to Expenses screen on load
    updateBudgets();
    updateDashboard();
    populateProfileForm();
  }
});
