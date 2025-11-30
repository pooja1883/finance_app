const defaultIncomes = [
  { id: 1, title: 'Salary', source: 'Job', amount: 50000, date: '2025-11-01' },
  { id: 2, title: 'Freelance Project', source: 'Freelancing', amount: 15000, date: '2025-11-05' },
  { id: 3, title: 'Stock Dividends', source: 'Investments', amount: 8000, date: '2025-11-10' },
  { id: 4, title: 'Rental Income', source: 'Property', amount: 12000, date: '2025-11-15' },
  { id: 5, title: 'Consulting Fee', source: 'Consulting', amount: 20000, date: '2025-11-20' },
  { id: 6, title: 'Part-time Teaching', source: 'Education', amount: 7000, date: '2025-11-22' },
  { id: 7, title: 'Bonus', source: 'Job', amount: 10000, date: '2025-11-25' },
  { id: 8, title: 'Interest Income', source: 'Bank', amount: 3000, date: '2025-11-27' }
];

let incomes = JSON.parse(localStorage.getItem('incomes')) || defaultIncomes;
let editId = null;

const titleInput = document.getElementById('title');
const sourceInput = document.getElementById('source');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const incomeTable = document.getElementById('incomeTable');
const monthSelect = document.getElementById('monthSelect');

function saveIncomes() {
  localStorage.setItem('incomes', JSON.stringify(incomes));
}

addBtn.addEventListener('click', () => {
  const newIncome = {
    id: Date.now(),
    title: titleInput.value,
    source: sourceInput.value,
    amount: Number(amountInput.value),
    date: dateInput.value
  };
  incomes.push(newIncome);
  saveIncomes();
  renderIncomes();
  clearForm();
});

function editIncome(id) {
  const income = incomes.find(i => i.id === id);
  if (!income) return;
  titleInput.value = income.title;
  sourceInput.value = income.source;
  amountInput.value = income.amount;
  dateInput.value = income.date;
  editId = id;
  addBtn.style.display = 'none';
  updateBtn.style.display = 'inline';
  document.getElementById('incomeForm').scrollIntoView({ behavior: 'smooth' });
}

updateBtn.addEventListener('click', () => {
  if (editId !== null) {
    const index = incomes.findIndex(i => i.id === editId);
    if (index !== -1) {
      incomes[index] = {
        ...incomes[index],
        title: titleInput.value,
        source: sourceInput.value,
        amount: Number(amountInput.value),
        date: dateInput.value
      };
    }
  }
  saveIncomes();
  renderIncomes();
  clearForm();
  addBtn.style.display = 'inline';
  updateBtn.style.display = 'none';
  editId = null;
});


function deleteIncome(id) {
  const confirmDelete = confirm("Are you sure you want to delete this income?");
  if (confirmDelete) {
    incomes = incomes.filter(i => i.id !== id);
    saveIncomes();
    renderIncomes();
    alert("Income deleted successfully!");
  }
}

function renderIncomes() {
  incomeTable.innerHTML = '';
  incomes.forEach(i => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i.title}</td>
      <td>${i.source}</td>
      <td>₹${i.amount}</td>
      <td>${i.date}</td>
      <td class="text-center">
        <div class="d-flex gap-2">
          <button class="btn btn-warning btn-sm" onclick="editIncome(${i.id})">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteIncome(${i.id})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </td>
    `;
    incomeTable.appendChild(row);
  });
  updateSummary();
  renderChart();
}

function updateLastSynced() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: true });
  document.getElementById('lastSynced').textContent = `Last synced: ${dateStr} at ${timeStr}`;
}

function clearForm() {
  titleInput.value = '';
  sourceInput.value = '';
  amountInput.value = '';
  dateInput.value = '';
}

function updateSummary() {
  const selectedMonth = monthSelect.value;
  let filteredIncomes = incomes;
  if (selectedMonth !== "") {
    filteredIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === Number(selectedMonth);
    });
  }

  if (filteredIncomes.length === 0) {
    document.getElementById('monthlyIncome').textContent = '₹0';
    document.getElementById('topSource').textContent = '-';
    document.getElementById('entryCount').textContent = '0';
    return;
  }

  const total = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  document.getElementById('monthlyIncome').textContent = `₹${total}`;
  document.getElementById('entryCount').textContent = filteredIncomes.length;

  const sourceTotals = filteredIncomes.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount;
    return acc;
  }, {});
  const topSource = Object.keys(sourceTotals).reduce((a, b) =>
    sourceTotals[a] > sourceTotals[b] ? a : b
  );
  document.getElementById('topSource').textContent = topSource;
}

function renderChart() {
  const chartContainer = document.getElementById('chartContainer');
  chartContainer.innerHTML = '';

  const selectedMonth = monthSelect.value;
  let filteredIncomes = incomes;
  if (selectedMonth !== "") {
    filteredIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === Number(selectedMonth);
    });
  }

  if (filteredIncomes.length === 0) {
    chartContainer.innerHTML = '<p style="text-align:center;color:#888;">No data for this month</p>';
    return;
  }

  const sourceTotals = filteredIncomes.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount;
    return acc;
  }, {});

  const maxIncome = Math.max(...Object.values(sourceTotals));

  Object.entries(sourceTotals).forEach(([source, amount]) => {
    const barWrapper = document.createElement('div');
    barWrapper.className = 'bar-wrapper';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(amount / maxIncome) * 200}px`;
    bar.textContent = `₹${amount}`;

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = source;

    barWrapper.appendChild(bar);
    barWrapper.appendChild(label);
    chartContainer.appendChild(barWrapper);
  });
}

monthSelect.addEventListener('change', () => {
  updateSummary();
  renderChart();
});


window.addEventListener("DOMContentLoaded", () => {
  monthSelect.value = ""; 
  updateSummary();
  renderChart();
});

updateLastSynced();
renderIncomes();