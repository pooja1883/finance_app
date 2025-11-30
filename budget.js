
  
  const defaultIncomes = [
    { id: 1, title: 'Salary', source: 'Job', amount: 50000, date: '2025-11-01' },
    { id: 2, title: 'Freelance Project', source: 'Freelancing', amount: 15000, date: '2025-11-05' },
    { id: 3, title: 'Stock Dividends', source: 'Investments', amount: 8000, date: '2025-11-10' }
  ];

  const defaultExpenses = [
    { id: 1, title: 'Groceries', category: 'Food', amount: 12000, date: '2025-11-03' },
    { id: 2, title: 'Rent', category: 'Housing', amount: 20000, date: '2025-11-05' },
    { id: 3, title: 'Electricity Bill', category: 'Utilities', amount: 5000, date: '2025-11-08' },
    { id: 4, title: 'Transport', category: 'Travel', amount: 8000, date: '2025-11-12' }
  ];

  const defaultBudgets = [
    { month: 'October', amount: 60000, totalExpense: 45000, remaining: 15000, status: 'Within' }
  ];

  if (!localStorage.getItem('incomes')) {
    localStorage.setItem('incomes', JSON.stringify(defaultIncomes));
  }
  if (!localStorage.getItem('expenses')) {
    localStorage.setItem('expenses', JSON.stringify(defaultExpenses));
  }
  if (!localStorage.getItem('budgets')) {
    localStorage.setItem('budgets', JSON.stringify(defaultBudgets));
  }

  let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

  function calculateTotalIncome() {
    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }

  function calculateTotalExpense() {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function calculateRemainingBudget(budgetAmount) {
    return budgetAmount - calculateTotalExpense();
  }

  const budgetForm = document.getElementById('budgetForm');
  const budgetMonth = document.getElementById('budgetMonth');
  const budgetAmount = document.getElementById('budgetAmount');
  const budgetTable = document.getElementById('budgetTable');
  const progressBar = document.getElementById('progressBar');
  const remainingAmount = document.getElementById('remainingAmount');
  const lastSynced = document.getElementById('lastSynced');

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const month = budgetMonth.value;
    const amount = Number(budgetAmount.value);
    if (!month) {
      alert('Please select a month');
      return;
    }
    if (!amount || isNaN(amount)) {
      alert('Budget must be a number');
      return;
    }
    if (amount <= 100) {
      alert('Budget must be greater than 100');
      return;
    }

    const totalExpense = calculateTotalExpense();
    const remaining = amount - totalExpense;
    const status = remaining >= 0 ? 'Within' : 'Exceeded';

    const year = new Date().getFullYear();
    const budgetRecord = { month, amount, totalExpense, remaining, status, year };
    budgets.push(budgetRecord);
    localStorage.setItem('budgets', JSON.stringify(budgets));

    renderBudgets();
    updateProgress(amount, totalExpense);
    updateLastSynced(month, year);
    budgetForm.reset();
  });

  function renderBudgets() {
    budgetTable.innerHTML = '';
    budgets.forEach(b => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${b.month} ${b.year || ''}</td>
        <td>₹${b.amount}</td>
        <td>₹${b.totalExpense}</td>
        <td>₹${b.remaining}</td>
        <td>${b.status}</td>
      `;
      budgetTable.appendChild(row);
    });
  }
  function updateProgress(budget, expense) {
    const percent = Math.min((expense / budget) * 100, 100);
    progressBar.style.width = percent + '%';
    progressBar.textContent = Math.round(percent) + '%';
    progressBar.classList.remove('bg-success', 'bg-danger');
    progressBar.classList.add(expense > budget ? 'bg-danger' : 'bg-success');
    remainingAmount.textContent = '₹' + (budget - expense);
  }
  function updateLastSynced(month, year) {
    lastSynced.textContent = ` ${month} ${year}`;
  }
  renderBudgets();
  if (budgets.length > 0) {
    const lastBudget = budgets[budgets.length - 1];
    updateProgress(lastBudget.amount, lastBudget.totalExpense);
    updateLastSynced(lastBudget.month, lastBudget.year || new Date().getFullYear());
  }

  function getDashboardSummary() {
    const totalIncome = calculateTotalIncome();
    const totalExpense = calculateTotalExpense();
    const lastBudget = budgets[budgets.length - 1] || { amount: 0 };
    const remainingBudget = calculateRemainingBudget(lastBudget.amount);

    return {
      income: totalIncome,
      expense: totalExpense,
      budget: lastBudget.amount,
      remaining: remainingBudget
    };
  }