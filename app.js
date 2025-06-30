document.addEventListener('DOMContentLoaded', () => {
  const airportSelect = document.getElementById('airportSelect');
  const chartList = document.getElementById('chartList');
  fetch('data/airports.json')
    .then(response => response.json())
    .then(data => {
      Object.keys(data).forEach(icao => {
        const option = document.createElement('option');
        option.value = icao;
        option.textContent = `${icao} - ${data[icao].name}`;
        airportSelect.appendChild(option);
      });
      airportSelect.addEventListener('change', () => {
        const selected = airportSelect.value;
        chartList.innerHTML = '';
        if (!selected) return;
        const charts = data[selected].charts;
        charts.forEach(chart => {
          const link = document.createElement('a');
          link.href = `charts/${selected}/${chart.filename}`;
          link.textContent = chart.title;
          link.target = '_blank';
          link.className = 'chart-item';
          chartList.appendChild(link);
          chartList.appendChild(document.createElement('br'));
        });
      });
    });
});

async function loadATCStatus() {
  try {
    const response = await fetch('https://ptfs.app/api/controllers');
    const data = await response.json();

    const atcContainer = document.getElementById('atc-status');
    atcContainer.innerHTML = '';

    const active = data.filter(entry => entry.holder !== '');

    if (active.length === 0) {
      atcContainer.innerHTML = '<p>No active ATC.</p>';
      return;
    }

    active.forEach(ctrl => {
      const div = document.createElement('div');
      div.className = 'atc-entry';
      div.innerHTML = `
        <strong>${ctrl.airport}</strong> - ${ctrl.position}<br>
        <span style="color: #6ee7b7;">${ctrl.holder}</span>
      `;
      atcContainer.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading ATC data:', err);
    document.getElementById('atc-status').innerText = 'Error loading ATC status.';
  }
}

loadATCStatus();

setInterval(loadATCStatus, 30000);
