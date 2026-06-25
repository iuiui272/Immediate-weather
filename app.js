const cityInput = document.getElementById('city-search');
const tempEl = document.getElementById('temp');

// 1. Persist City
cityInput.addEventListener('change', (e) => {
    localStorage.setItem('savedCity', e.target.value);
    fetchWeather(e.target.value);
});

// 2. Dynamic Theme (Apple-style Boring/Dark)
const updateTheme = (isNight, isBadWeather) => {
    document.body.classList.toggle('dark-mode', isNight || isBadWeather);
};

// 3. Scroll Animations (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

observer.observe(document.getElementById('weather-content'));

// 4. Initialization
window.onload = () => {
    const savedCity = localStorage.getItem('savedCity');
    if (savedCity) {
        cityInput.value = savedCity;
        fetchWeather(savedCity);
    }
};

[span_2](start_span)async function fetchWeather(city) {
    // API logic goes here[span_2](end_span)
    // After fetch, call updateTheme based on condition
    updateTheme(false, false); 
}
