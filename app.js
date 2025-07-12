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

function createCollapsible(title, contentId) {  // Aka the biggest pain to get perfect.
  const container = document.createElement('div');
  container.style.backgroundColor = '#2c2c2c';
  container.style.color = '#e0e0e0';
  container.style.padding = '1rem';
  container.style.borderRadius = '6px';
  container.style.border = '1px solid #444';
  container.style.boxShadow = '0 0 10px #000';
  container.style.marginBottom = '1rem';
  container.style.userSelect = 'none';

  const button = document.createElement('button');
  button.textContent = title;
  button.style.width = '100%';
  button.style.background = 'none';
  button.style.border = 'none';
  button.style.color = '#6ee7b7';
  button.style.fontSize = '1.1rem';
  button.style.fontWeight = 'bold';
  button.style.textAlign = 'left';
  button.style.padding = '0';
  button.style.cursor = 'pointer';
  button.style.outline = 'none';

  const content = document.getElementById(contentId);
  content.style.overflow = 'hidden';
  content.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
  content.style.maxHeight = '0';
  content.style.paddingTop = '0';
  content.style.paddingBottom = '0';

  container.appendChild(button);
  container.appendChild(content.parentNode.removeChild(content));

  button.addEventListener('click', () => {
    if (content.style.maxHeight === '0px' || content.style.maxHeight === '') {
      content.style.maxHeight = content.scrollHeight + 20 + 'px';
      content.style.paddingTop = '1rem';
      content.style.paddingBottom = '1rem';
    } else {
      content.style.maxHeight = '0';
      content.style.paddingTop = '0';
      content.style.paddingBottom = '0';
    }
  });

  return container;
}

async function loadATCStatus() {
  try {
    const response = await fetch('https://ptfs.app/api/controllers');
    const data = await response.json();

    const atcContent = document.getElementById('atc-status');
    atcContent.innerHTML = '';
    atcContent.style.color = '#e0e0e0';

    const active = data.filter(entry => entry.holder !== '');

    if (active.length === 0) {
      atcContent.innerHTML = '<p>No active ATC.</p>';
      return;
    }

    active.forEach(ctrl => {
      const div = document.createElement('div');
      div.className = 'atc-entry';
      div.style.marginBottom = '10px';
      div.innerHTML = `
        <strong>${ctrl.airport}</strong> - ${ctrl.position}<br>
        <span style="color: #6ee7b7;">${ctrl.holder}</span>
      `;
      atcContent.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading ATC data:', err);
    document.getElementById('atc-status').innerText = 'Error loading ATC status.';
  }
}

async function loadFlightPlans() {
  try {
    const response = await fetch('https://24data.ptfs.app/acft-data'); // Use real endpoint
    const data = await response.json();

    const flightTrackerContent = document.getElementById('flight-tracker-status');
    flightTrackerContent.innerHTML = '';
    flightTrackerContent.style.color = '#e0e0e0';

    const entries = Object.entries(data);
    if (!entries.length) {
      flightTrackerContent.innerHTML = '<p>No active aircraft.</p>';
      return;
    }

    entries.forEach(([callsign, details]) => {
      const div = document.createElement('div');
      div.className = 'flight-tracker-entry';
      div.style.marginBottom = '10px';

      const isGround = details.isOnGround ? '🛬 Ground' : '✈️ Airborne';

      div.innerHTML = `
        <strong style="color:#6ee7b7;">${callsign}</strong> | ${details.aircraftType}<br>
        Pilot: ${details.playerName}<br>
        Altitude: ${details.altitude} ft | Speed: ${Math.round(details.speed)} kts<br>
        Heading: ${details.heading}° | ${isGround}<br>
        Wind: ${details.wind}
      `;
      flightTrackerContent.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading aircraft data:', err);
    document.getElementById('flight-tracker-status').innerText = 'Error loading aircraft data.';
  }
}



window.addEventListener('DOMContentLoaded', () => {  
    const atcWrapper = createCollapsible('Active ATC', 'atc-status');
    const flightTrackerWrapper = createCollapsible('Active Flight Tracker', 'flight-tracker-status');

    const footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.insertBefore(atcWrapper, footer);
        footer.parentNode.insertBefore(flightTrackerWrapper, footer);
    } else {
        document.body.appendChild(atcWrapper);
        document.body.appendChild(flightTrackerWrapper);
    }

    loadATCStatus();
    setInterval(loadATCStatus, 30000);

    loadFlightPlans();
    setInterval(loadFlightPlans, 30000);
});




