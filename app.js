// --- 1. LOCAL STORAGE & MESH NETWORKING ---
const meshChannel = new BroadcastChannel('weather_mesh_network');

const clearLocalData = async () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    const dbs = await window.indexedDB.databases();
    dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    
    updateUI("--", "Data Cleared. Awaiting input.");
    meshChannel.postMessage({ type: 'CLEAR' }); // Broadcast clear command to peers
};

// Listen for peer data (Simulating WebRTC/Local Mesh)
meshChannel.onmessage = (event) => {
    if (event.data.type === 'SYNC_WEATHER') {
        console.log("Data received from local mesh peer.");
        updateUI(event.data.temp, `Synced via Mesh: ${event.data.city}`);
    } else if (event.data.type === 'CLEAR') {
        updateUI("--", "Data Cleared by peer.");
    }
};

// --- 2. MULTI-SOURCE FUSION ENGINE ---
const fetchFusedWeather = async (lat, lon) => {
    // Fetching from 3 different forecasting models simultaneously
    const urls = [
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`, // Primary
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&models=gfs_global`, // GFS Model
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&models=icon_global` // ICON Model
    ];

    const responses = await Promise.allSettled(urls.map(url => fetch(url).then(r => r.json())));
    
    let validTemps = [];
    responses.forEach(res => {
        if (res.status === 'fulfilled' && res.value.current) {
            validTemps.push(res.value.current.temperature_2m);
        }
    });

    if (validTemps.length === 0) throw new Error("All data sources failed.");

    // Weighted Algorithm (Prioritizing the primary source, falling back to averages)
    const weights = [0.6, 0.2, 0.2]; 
    let synthesizedTemp = 0;
    let totalWeight = 0;

    validTemps.forEach((temp, index) => {
        const weight = weights[index] || (1 / validTemps.length);
        synthesizedTemp += temp * weight;
        totalWeight += weight;
    });

    return (synthesizedTemp / totalWeight).toFixed(1);
};

// --- 3. UI CONTROLLER ---
const updateUI = (temp, status) => {
    document.getElementById('temp').innerText = temp !== "--" ? `${temp}°C` : temp;
    document.getElementById('status').innerText = status;
};

document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value;
    if (!city) return;
    
    updateUI("...", "Aggregating 3 data sources...");
    if (navigator.vibrate) navigator.vibrate(15);
    document.getElementById('card').animate([{transform: 'scale(1)'}, {transform: 'scale(1.03)'}, {transform: 'scale(1)'}], 200);

    try {
        // 1. Geocode
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`).then(r => r.json());
        if (!geo.results) throw new Error("City not found");
        const { latitude, longitude, name } = geo.results[0];
        
        // 2. Synthesize Data
        const finalTemp = await fetchFusedWeather(latitude, longitude);
        
        // 3. Update UI
        updateUI(finalTemp, `Fused Weather in ${name}`);

        // 4. Broadcast to Mesh Network
        meshChannel.postMessage({ type: 'SYNC_WEATHER', temp: finalTemp, city: name });

    } catch (e) {
        updateUI("--", e.message || "Connection failed.");
    }
});

document.getElementById('clear-btn').addEventListener('click', clearLocalData);

// --- 4. OFFLINE SERVICE WORKER INIT ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error('SW sync failed:', err));
    });
}
