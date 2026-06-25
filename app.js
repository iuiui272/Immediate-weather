const clearLocalData = async () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    const dbs = await window.indexedDB.databases();
    dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    document.getElementById('temp').innerText = "--°C";
    document.getElementById('status').innerText = "Data Cleared.";
};

document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value;
    if (!city) return;
    
    try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`).then(r => r.json());
        const { latitude, longitude, name } = geo.results[0];
        const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`).then(r => r.json());
        
        document.getElementById('temp').innerText = `${weather.current.temperature_2m}°C`;
        document.getElementById('status').innerText = `Weather in ${name}`;
    } catch (e) {
        document.getElementById('status').innerText = "City not found.";
    }
});

document.getElementById('clear-btn').addEventListener('click', clearLocalData);
