const searchInput = document.getElementById('city-search');
const resultsList = document.getElementById('results');
const cityDisplay = document.getElementById('city-display');

// Load saved city on startup
window.addEventListener('load', () => {
    const saved = localStorage.getItem('lastCity');
    if (saved) cityDisplay.innerText = saved;
});

// Autocomplete Logic
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 2) { resultsList.innerHTML = ''; return; }

    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`);
    const data = await res.json();
    
    resultsList.innerHTML = '';
    if (data.results) {
        data.results.forEach(city => {
            const li = document.createElement('li');
            li.className = 'result-item';
            li.innerText = `${city.name}, ${city.country}`;
            li.onclick = () => saveCity(city.name);
            resultsList.appendChild(li);
        });
    }
});

function saveCity(name) {
    localStorage.setItem('lastCity', name);
    cityDisplay.innerText = name;
    resultsList.innerHTML = '';
    searchInput.value = '';
}
