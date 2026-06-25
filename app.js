/**
 * AETHER WEATHER ENGINE // VERSION 2.0
 * Architecture: State-Persistent, Intersection-Triggered, Apple-Design compliant.
 */

const ENGINE = {
    state: {
        city: localStorage.getItem('user_city') || '',
        data: null,
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    },
    ui: {
        temp: document.getElementById('temp'),
        summary: document.getElementById('summary'),
        container: document.getElementById('weather-content'),
        input: document.getElementById('city-search')
    }
};

// 1. PERSISTENCE LAYER
const saveCity = (city) => {
    localStorage.setItem('user_city', city);
    ENGINE.state.city = city;
};

// 2. THEME ENGINE (Apple Style)
// Maps weather codes/conditions to "Pristine" or "Dark" states
const applyTheme = (isBad) => {
    if (isBad || ENGINE.state.isDarkMode) {
        document.body.style.backgroundColor = '#000000';
        document.body.style.color = '#ffffff';
    } else {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
    }
};

// 3. ANIMATION ENGINE (The "Native" Slide)
const initObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(ENGINE.ui.container);
};

// 4. DATA SYNTHESIS & SUMMARIZATION (The "Boring" Weather Analyst)
const getBoringSummary = (data) => {
    const { temp, precip, condition } = data;
    if (temp < 0) return 'It is freezing outside. Stay warm.';
    if (precip > 5) return 'Expect significant precipitation today.';
    return 'The weather is currently ' + condition.toLowerCase() + ' with a temperature of ' + temp + ' degrees.';
};

// 5. FETCH & RENDER LOOP
async function fetchWeather(city) {
    try {
        ENGINE.ui.summary.innerText = 'Updating...';
        
        // Simulating Fetch to API
        const response = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city));
        const json = await response.json();
        
        if (!json.results) throw new Error('City not found.');
        
        // Mock data structure representing synthesized forecast
        const weatherData = {
            temp: 22,
            precip: 0,
            condition: 'Clear'
        };

        // DOM Update
        ENGINE.ui.temp.innerText = weatherData.temp + '°';
        ENGINE.ui.summary.innerText = getBoringSummary(weatherData);
        
        // Dynamic Theme Shift
        applyTheme(weatherData.precip > 0);
        
    } catch (err) {
        ENGINE.ui.summary.innerText = err.message;
    }
}

// 6. INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    initObserver();
    
    if (ENGINE.state.city) {
        ENGINE.ui.input.value = ENGINE.state.city;
        fetchWeather(ENGINE.state.city);
    }

    ENGINE.ui.input.addEventListener('change', (e) => {
        const val = e.target.value;
        saveCity(val);
        fetchWeather(val);
    });
});
