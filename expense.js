let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editId = null;

const titleInput = document.getElementById('title');
const categoryInput = document.getElementById('category'); 
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const expenseTable = document.getElementById('expenseTable');
const sortOptions = document.getElementById('sortOptions');                
const filterOptions = document.getElementById('filterOptions');
const filterCategory = document.getElementById('filterCategory'); 

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}


const params = new URLSearchParams(window.location.search);
const action = params.get("action");
const idParam = params.get("id");
const id = idParam ? Number(idParam) : null;

if (action === "edit" && id) {
  editExpense(id);
}
if (action === "delete" && id) {
  deleteExpense(id);
}


function populateCategoryDropdown() {
  categoryInput.innerHTML = '<option value="" disabled selected>Select Category</option>';
  const categories = [...new Set(expenses.map(e => e.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryInput.appendChild(option);
  });
  const otherOption = document.createElement('option');
  otherOption.value = "Other";
  otherOption.textContent = "Other";
  categoryInput.appendChild(otherOption);
}

function populateFilterCategoryDropdown() {
  filterCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';
  const categories = [...new Set(expenses.map(e => e.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
  const otherOption = document.createElement('option');
  otherOption.value = "Other";
  otherOption.textContent = "Other";
  filterCategory.appendChild(otherOption);
}


addBtn.addEventListener('click', () => {
  const expenseData = {
    description: titleInput.value,
    category: categoryInput.value,
    amount: Number(amountInput.value),
    date: dateInput.value
  };
  const newExpense = { id: Date.now(), ...expenseData };
  expenses.push(newExpense);
  saveExpenses();
  renderExpenses();
  clearForm();
  updateLastSynced();
  populateCategoryDropdown();
  populateFilterCategoryDropdown();
});


function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (!expense) return;
  const { description, category, amount, date } = expense;
  titleInput.value = description;
  categoryInput.value = category;
  amountInput.value = amount;
  dateInput.value = date;
  editId = id;
  addBtn.style.display = 'none';
  updateBtn.style.display = 'inline';
  const formSection = document.getElementById('expenseForm');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


updateBtn.addEventListener('click', () => {
  if (editId !== null) {
    const expenseIndex = expenses.findIndex(e => e.id === editId);
    if (expenseIndex !== -1) {
      expenses[expenseIndex] = {
        ...expenses[expenseIndex],
        description: titleInput.value.trim(),
        category: categoryInput.value,
        amount: Number(amountInput.value),
        date: dateInput.value
      };
    }
    saveExpenses();
    renderExpenses();
    clearForm();
    addBtn.style.display = 'inline';
    updateBtn.style.display = 'none';
    editId = null;
    updateLastSynced();
    populateCategoryDropdown();
    populateFilterCategoryDropdown();
  } else {
    alert("Please select an expense to edit first.");
  }
});


function deleteExpense(id) {
 
  const confirmDelete = confirm("Are you sure you want to delete this expense?");
  
  if (confirmDelete) {
   
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses();
    renderExpenses();
    updateLastSynced();
    populateCategoryDropdown();
    populateFilterCategoryDropdown();
    alert("Expense deleted successfully!");
  }
}


function renderExpenses() {
  expenseTable.innerHTML = '';
  let displayExpenses = [...expenses];

  
  if (sortOptions.value === 'amount') {
    displayExpenses.sort((a, b) => b.amount - a.amount);
  } else if (sortOptions.value === 'category') {
    displayExpenses.sort((a, b) => a.category.localeCompare(b.category));
  } else if (sortOptions.value === 'date') {
    displayExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  
  const today = new Date();
  if (filterOptions.value === 'today') {
    displayExpenses = displayExpenses.filter(e => new Date(e.date).toDateString() === today.toDateString());
  } else if (filterOptions.value === 'week') {
    const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7);
    displayExpenses = displayExpenses.filter(e => new Date(e.date) >= weekAgo);
  } else if (filterOptions.value === 'month') {
    const month = today.getMonth();
    const year = today.getFullYear();
    displayExpenses = displayExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  } else if (filterOptions.value === 'category') {
    filterCategory.style.display = 'inline';
    if (filterCategory.value) {
      displayExpenses = displayExpenses.filter(e => e.category === filterCategory.value);
    }
  } else {
    filterCategory.style.display = 'none';
  }

 
  displayExpenses.forEach(e => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-bs-toggle="tooltip" data-bs-placement="top" title="${e.description}">
        ${e.description}
      </td>
      <td>${e.category}</td>
      <td>₹${e.amount}</td>
      <td>${e.date}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editExpense(${e.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})">Delete</button>
      </td>
    `;
    expenseTable.appendChild(row);
  });

  
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = (total / expenses.length).toFixed(2);
    const highest = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);

    document.getElementById('totalExpense').textContent = `₹${total}`;
    document.getElementById('averageExpense').textContent = `₹${avg}`;
    document.getElementById('highestExpense').textContent = `₹${highest}`;
  } else {
    document.getElementById('totalExpense').textContent = '₹0';
    document.getElementById('averageExpense').textContent = '₹0';
    document.getElementById('highestExpense').textContent = '₹0';
  }
}


function clearForm() {
  titleInput.value = '';
  categoryInput.value = '';
  amountInput.value = '';
  dateInput.value = '';
}


function updateLastSynced() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: true });
  document.getElementById('lastSynced').textContent = `Last synced: ${dateStr} at ${timeStr}`;
}


sortOptions.addEventListener('change', renderExpenses);
filterOptions.addEventListener('change', renderExpenses);
filterCategory.addEventListener('change', renderExpenses);


renderExpenses();
populateCategoryDropdown();
populateFilterCategoryDropdown();
updateLastSynced();
setInterval(updateLastSynced, 60000);