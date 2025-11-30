
    const apiURL = "https://api.exchangerate-api.com/v4/latest/USD";

    const currencyForm = document.getElementById('currencyForm');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const amountInput = document.getElementById('amount');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const historyTable = document.getElementById('historyTable');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const lastSynced = document.getElementById('lastSynced');


    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    renderHistory();

    currencyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const from = fromCurrency.value;
      const to = toCurrency.value;
      const amount = Number(amountInput.value);

      if (!from || !to || !amount) {
        alert("Please fill all fields correctly.");
        return;
      }

      try {
        loading.style.display = 'block';

        const res = await fetch(apiURL);
        if (!res.ok) throw new Error("Server error while fetching rates.");

        const data = await res.json();
        const { rates } = data;

        if (!rates[from]) throw new Error(`Invalid currency: ${from}`);
        if (!rates[to]) throw new Error(`Invalid currency: ${to}`);

       
        const usdAmount = amount / rates[from];
        const converted = usdAmount * rates[to];

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        
        const output = `${amount} ${from} → ${converted.toFixed(2)} ${to}`;
        result.textContent = output;

        
        const record = {
          conversion: output,
          rate: `1 ${from} = ${(rates[to] / rates[from]).toFixed(4)} ${to}`,
          date: dateStr,
          time: timeStr
        };
        conversionHistory.push(record);
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));

        renderHistory();
        updateLastSynced(dateStr, timeStr);
      } catch (err) {
        result.textContent = `Error: ${err.message}`;
      } finally {
        loading.style.display = 'none';
      }
    });

    function renderHistory() {
      historyTable.innerHTML = '';
      conversionHistory.forEach(rec => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${rec.conversion}</td>
          <td>${rec.rate}</td>
          <td>${rec.date}</td>
          <td>${rec.time}</td>
        `;
        historyTable.appendChild(row);
      });
    }

    function updateLastSynced(dateStr, timeStr) {
      lastSynced.textContent = `Last synced: ${dateStr} at ${timeStr}`;
    }

    clearHistoryBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all history?")) {
        conversionHistory = [];
        localStorage.removeItem('conversionHistory');
        renderHistory();
        result.textContent = '';
        lastSynced.textContent = '';
      }
    });

   
    if (conversionHistory.length > 0) {
      const last = conversionHistory[conversionHistory.length - 1];
      updateLastSynced(last.date, last.time);
      result.textContent = last.conversion;
    }
    function updateLastSynced() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: true });
    document.getElementById('lastSynced').textContent = `Last synced: ${dateStr} at ${timeStr}`;
  }
  updateLastSynced();