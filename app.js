// Local-First P2P Data Layer
const meshNetwork = new BroadcastChannel('liquid_weather_mesh');

// UI Element Targets
const elements = {
    temp: document.getElementById('temp'),
    status: document.getElementById('status'),
    feels: document.getElementById('val-feels'),
    precip: document.getElementById('val-precip'),
    humidity: document.getElementById('val-humidity'),
    pressure: document.getElementById('val-pressure'),
    visibility: document.getElementById('val-visibility'),
    uv: document.getElementById('val-uv'),
    card: document.getElementById('card'),
    cityInput: document.getElementById('city-input')
};

// Render Interface States
const renderMetrics = (metrics, locationName) => {
    elements.temp.innerText = `${metrics.temp}°C`;
    elements.status.innerText = `Fused Model: ${locationName}`;
    elements.feels.innerText = `${metrics.feelsLike}°C`;
    elements.precip.innerText = `${metrics.precipitation} mm`;
    elements.humidity.innerText = `${metrics.humidity}%`;
    elements.pressure.innerText = `${metrics.pressure} hPa`;
    elements.visibility.innerText = `${metrics.visibility} km`;
    elements.uv.innerText = metrics.uvIndex;
};

// Listen to Mesh Network Synchronization Broadcasts
meshNetwork.onmessage = (event) => {
    if (event.data.type === 'MESH_SYNC') {
        console.log('Synchronized metrics over mesh node.');
        renderMetrics(event.data.metrics, event.data.location);
    } else if (event.data.type === 'MESH_PURGE') {
        resetUI('Cache purged via adjacent node.');
    }
};

// Data Fusion Engine (Aggregates 3 distinct global models via Open-Meteo)
const runDataFusion = async (lat, lon) => {
    const endpoints = [
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,visibility,uv_index`, // Model 1: Best Match
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,visibility,uv_index&models=gfs_global`, // Model 2: GFS
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,visibility,uv_index&models=icon_global` // Model 3: ICON
    ];

    const tasks = await Promise.allSettled(endpoints.map(url => fetch(url).then(r => r.json())));
    
    // Extracted clean array sets
    const models = tasks.filter(t => t.status === 'fulfilled' && t.value.current).map(t => t.value.current);
    if (models.length === 0) throw new Error("Data synthesis platforms unavailable.");

    // Weight allocations for synthesis engine (Primary: 50%, Secondary: 25% each)
    const weights = [0.5, 0.25, 0.25];
    
    const extractWeightedValue = (key) => {
        let sum = 0;
        let runningWeight = 0;
        models.forEach((model, i) => {
            if (model[key] !== undefined) {
                sum += model[key] * weights[i];
                runningWeight += weights[i];
            }
        });
        return (sum / runningWeight);
    };

    return {
        temp: extractWeightedValue('temperature_2m').toFixed(1),
        feelsLike: extractWeightedValue('apparent_temperature').toFixed(1),
        precipitation: extractWeightedValue('precipitation').toFixed(2),
        humidity: Math.round(extractWeightedValue('relative_humidity_2m')),
        pressure: Math.round(extractWeightedValue('pressure_msl')),
        visibility: (extractWeightedValue('visibility') / 1000).toFixed(1), // Convert meters to km
        uvIndex: extractWeightedValue('uv_index').toFixed(1)
    };
};

// Event Coordinators
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = elements.cityInput.value.trim();
    if (!query) return;

    if (navigator.vibrate) navigator.vibrate(12);
    elements.card.animate([{transform: 'scale(1)'}, {transform: 'scale(1.02)'}, {transform: 'scale(1)'}], 250);
    elements.status.innerText = "Interrogating multi-provider streams...";

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`).then(r => r.json());
        if (!geoResponse.results || geoResponse.results.length === 0) throw new Error("Target city unrecognized.");
        
        const { latitude, longitude, name } = geoResponse.results[0];
        const fusedMetrics = await runDataFusion(latitude, longitude);

        // Update Context UI
        renderMetrics(fusedMetrics, name);

        // Disseminate to P2P App Instances over Mesh
        meshNetwork.postMessage({
            type: 'MESH_SYNC',
            location: name,
            metrics: fusedMetrics
        });

    } catch (err) {
        elements.status.innerText = err.message;
    }
});

const resetUI = (msg = "Local instance reset.") => {
    elements.temp.innerText = "--°C";
    elements.status.innerText = msg;
    ['val-feels', 'val-precip', 'val-humidity', 'val-pressure', 'val-visibility', 'val-uv'].forEach(id => {
        document.getElementById(id).innerText = "--";
    });
};

document.getElementById('clear-btn').addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    const databases = await window.indexedDB.databases();
    databases.forEach(db => window.indexedDB.deleteDatabase(db.name));
    const cachesKeys = await caches.keys();
    await Promise.all(cachesKeys.map(k => caches.delete(k)));
    
    resetUI("Local cache purged.");
    meshNetwork.postMessage({ type: 'MESH_PURGE' });
});

// Offline Core Standup
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}
