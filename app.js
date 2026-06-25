document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value;
    if (!city) return;

    // Trigger Haptic
    if (navigator.vibrate) navigator.vibrate(15);
    
    // Animate search
    document.getElementById('card').animate([{transform: 'scale(1)'}, {transform: 'scale(1.03)'}, {transform: 'scale(1)'}], 200);

    // Fetch from Open-Meteo (Free, no API key required)
    try {
        // 1. Get Coordinates first (Geocoding)
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`).then(r => r.json());
        const { latitude, longitude, name } = geo.results[0];

        // 2. Fetch Weather
        const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`).then(r => r.json());
        
        // 3. Update UI
        document.getElementById('temp').innerText = `${weather.current.temperature_2m}°C`;
        document.getElementById('status').innerText = `Weather in ${name}`;
    } catch (e) {
        document.getElementById('status').innerText = "City not found.";
    }
});
