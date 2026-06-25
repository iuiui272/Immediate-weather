const menu = document.getElementById('menu');
const cityDisplay = document.getElementById('city-display');

// Toggle Menu
function toggleMenu() { menu.classList.toggle('open'); }

// Persistent Save & Load
function saveCity(name) {
    localStorage.setItem('lastCity', name);
    cityDisplay.innerText = name;
    toggleMenu();
    fetchWeather(name);
}

// Fetch Engine
async function fetchWeather(city) {
    // This connects to the Open-Meteo API
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const geoData = await geoRes.json();
    
    if (geoData.results) {
        const { latitude, longitude } = geoData.results[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await res.json();
        document.getElementById('temp-display').innerText = data.current_weather.temperature + '°';
    }
}

// Startup
window.addEventListener('load', () => {
    const saved = localStorage.getItem('lastCity') || 'Regina';
    cityDisplay.innerText = saved;
    fetchWeather(saved);
});
