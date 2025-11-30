
    const defaultIncome = [
  { id: 101, date: '2025-11-20', description: 'Salary', amount: 5000, category: 'Job' },
  { id: 102, date: '2025-11-25', description: 'Freelance', amount: 1200, category: 'Side Hustle' }
];

const defaultExpenses = [
  { id: 1, description: 'Groceries from supermarket', category: 'Food', amount: 300, date: '2025-11-21' },
  { id: 2, description: 'Electricity Bill November', category: 'Utilities', amount: 150, date: '2025-11-22' },
  { id: 3, description: 'Dinner at restaurant', category: 'Food', amount: 100, date: '2025-11-23' },
  { id: 4, description: 'Taxi fare', category: 'Travel', amount: 80, date: '2025-11-24' },
  { id: 5, description: 'Gym membership', category: 'Health', amount: 60, date: '2025-11-25' },
  { id: 6, description: 'Shopping mall purchases', category: 'Lifestyle', amount: 1500, date: '2025-11-26' },
  { id: 7, description: 'Movie tickets', category: 'Entertainment', amount: 400, date: '2025-11-27' },
  { id: 8, description: 'Doctor consultation', category: 'Health', amount: 700, date: '2025-11-28' },
  { id: 9, description: 'Weekend trip', category: 'Travel', amount: 2000, date: '2025-11-29' }
];

const getData = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const income = getData('income', defaultIncome);
const expenses = getData('expenses', defaultExpenses);
localStorage.setItem('income', JSON.stringify(income));
localStorage.setItem('expenses', JSON.stringify(expenses));

const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
const balance = totalIncome - totalExpense;
const budget = 6000;
const remainingBudget = budget - totalExpense;

document.getElementById('totalIncome').textContent = `₹${totalIncome}`;
document.getElementById('totalExpense').textContent = `₹${totalExpense}`;
document.getElementById('balance').textContent = `₹${balance}`;
document.getElementById('remainingBudget').textContent = `₹${remainingBudget}`;

const allTransactions = [
  ...income.map(i => ({ ...i, type: 'Income' })),
  ...expenses.map(e => ({ ...e, type: 'Expense' }))
];
allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

const tableBody = document.getElementById('transactionTable');
allTransactions.forEach(tx => {
  const row = `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.description}</td>
      <td>${tx.type}</td>
      <td>${tx.category}</td>
      <td class="text-end">₹${tx.amount}</td>
      
    </tr>`;
  tableBody.innerHTML += row;
});


   
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const chartData = Array(7).fill(0);
    expenses.forEach(e => {
      const d = new Date(e.date);
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      if (diff < 7) {
        const dayIndex = d.getDay();
        chartData[dayIndex] += e.amount;
      }
    });

    const chartContainer = document.getElementById('chartContainer');
    const chartLabels = document.getElementById('chartLabels');
    const maxVal = Math.max(...chartData, 100);
    chartData.forEach((val, i) => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${(val / maxVal) * 100}%`;
      chartContainer.appendChild(bar);

      const label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = days[i];
      chartLabels.appendChild(label);
    });

     
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good Morning!' : hour < 18 ? 'Good Afternoon!' : 'Good Evening!';
    document.getElementById('greeting').innerHTML = `
      <strong>${greeting}</strong><br>
      <span style="font-weight:300; color:black;">Your financial details</span>
    `;

   
    const syncedTime = `${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`;
    document.getElementById('lastSynced').textContent = `Last synced: ${syncedTime}`;


  
