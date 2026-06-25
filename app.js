// Local Mesh Peer Synchronization Topology
const localMesh = new BroadcastChannel('atmospheric_mesh_matrix');

const UI = {
    temp: document.getElementById('temp-display'),
    location: document.getElementById('loc-display'),
    analyst: document.getElementById('analyst-view'),
    glow: document.getElementById('dynamic-glow'),
    card: document.getElementById('card'),
    input: document.getElementById('city-input'),
    fields: {
        feels: document.getElementById('m-feels'),
        precip: document.getElementById('m-precip'),
        humidity: document.getElementById('m-humidity'),
        wind: document.getElementById('m-wind'),
        pressure: document.getElementById('m-pressure'),
        visibility: document.getElementById('m-visibility'),
        uv: document.getElementById('m-uv'),
        direction: document.getElementById('m-direction')
    }
};

// Autonomous Smart Content Engine (Client-Side Intelligence Layer)
const runAtmosphericAnalysis = (m) => {
    let summary = "<strong>ANALYSIS:</strong> Standard operations parameters nominal.";
    
    // Dynamic Liquid Glass Aura Shifts
    if (m.temp <= 5) {
        UI.glow.style.background = "radial-gradient(circle, rgba(0, 150, 255, 0.4) 0%, rgba(0,0,0,0) 70%)";
        UI.card.style.borderColor = "rgba(0, 150, 255, 0.3)";
        summary = "<strong>ALERT: Extreme Cold Vector.</strong> Wrap skin layers immediately. <em>Tip: Deploy Hand and Toe warmers before exterior deployment.</em>";
    } else if (m.uvIndex >= 7) {
        UI.glow.style.background = "radial-gradient(circle, rgba(255, 110, 0, 0.4) 0%, rgba(0,0,0,0) 70%)";
        UI.card.style.borderColor = "rgba(255, 110, 0, 0.3)";
        summary = "<strong>ALERT: High UV Radiation.</strong> Unprotected solar contact will result in immediate cellular degradation. Apply SPF 50+ barriers.";
    } else if (m.precipitation > 2) {
        UI.glow.style.background = "radial-gradient(circle, rgba(120, 130, 150, 0.5) 0%, rgba(0,0,0,0) 70%)";
        UI.card.style.borderColor = "rgba(255,255,255,0.2)";
        summary = "<strong>NOTIFICATION: Severe Precipitation Active.</strong> Liquid/frozen moisture levels descending rapidly. Structural visibility compromised.";
    } else {
        // Default pristine state
        UI.glow.style.background = "radial-gradient(circle, rgba(0, 198, 255, 0.35) 0%, rgba(0,0,0,0) 70%)";
        UI.card.style.borderColor = "rgba(255,255,255,0.12)";
    }
    
    UI.analyst.innerHTML = summary;
};

const renderUpdate = (metrics, area) => {
    UI.temp.innerText = `${metrics.temp}°`;
    UI.location.innerText = area;
    UI.fields.feels.innerText = `${metrics.feelsLike}°C`;
    UI.fields.precip.innerText = `${metrics.precipitation} mm`;
    UI.fields.humidity.innerText = `${metrics.humidity}%`;
    UI.fields.wind.innerText = `${metrics.windSpeed} km/h`;
    UI.fields.pressure.innerText = `${metrics.pressure} hPa`;
    UI.fields.visibility.innerText = `${metrics.visibility} km`;
    UI.fields.uv.innerText = metrics.uvIndex;
    UI.fields.direction.innerText = `${metrics.windDirection}°`;
    
    runAtmosphericAnalysis(metrics);
};

// Mesh Node Intercepts
localMesh.onmessage = (e) => {
    if (e.data.type === 'MESH_PUSH') {
        renderUpdate(e.data.metrics, `${e.data.name} (P2P Mesh)`);
    } else if (e.data.type === 'MESH_WIPE') {
        wipeUI("System cleared by remote network peer.");
    }
};

// Multi-Source Synthesis Framework
const fetchSynthesizedArray = async (lat, lon) => {
    const vectors = [
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index`,
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index&models=gfs_global`,
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index&models=icon_global`
    ];

    const tasks = await Promise.allSettled(vectors.map(v => fetch(v).then(r => r.json())));
    const validPacks = tasks.filter(t => t.status === 'fulfilled' && t.value.current).map(t => t.value.current);
    
    if (validPacks.length === 0) throw new Error("All pipeline arrays timed out.");

    const compound = (key) => {
        let runningTotal = 0;
        validPacks.forEach(p => runningTotal += p[key]);
        return runningTotal / validPacks.length;
    };

    return {
        temp: compound('temperature_2m').toFixed(1),
        feelsLike: compound('apparent_temperature').toFixed(1),
        precipitation: compound('precipitation').toFixed(1),
        humidity: Math.round(compound('relative_humidity_2m')),
        windSpeed: compound('wind_speed_10m').toFixed(1),
        pressure: Math.round(compound('pressure_msl')),
        visibility: (compound('visibility') / 1000).toFixed(1),
        uvIndex: compound('uv_index').toFixed(1),
        windDirection: Math.round(compound('wind_direction_10m'))
    };
};

document.getElementById('search-btn').addEventListener('click', async () => {
    const query = UI.input.value.trim();
    if (!query) return;

    if (navigator.vibrate) navigator.vibrate(15);
    UI.card.animate([{transform:'scale(1)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], {duration:200});
    UI.analyst.innerHTML = "<strong>PROCESSING:</strong> Running triple-model predictive telemetry matrix...";

    try {
        const resolution = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`).then(r => r.json());
        if (!resolution.results || resolution.results.length === 0) throw new Error("Target destination vector invalid.");
        
        const { latitude, longitude, name } = resolution.results[0];
        const computedMetrics = await fetchSynthesizedArray(latitude, longitude);

        renderUpdate(computedMetrics, name);

        localMesh.postMessage({
            type: 'MESH_PUSH',
            name: name,
            metrics: computedMetrics
        });
    } catch (err) {
        UI.analyst.innerHTML = `<strong>ERROR:</strong> ${err.message}`;
    }
});

const wipeUI = (text) => {
    UI.temp.innerText = "--°";
    UI.location.innerText = "Global Terminal";
    UI.analyst.innerHTML = `<strong>SYSTEM RESET:</strong> ${text}`;
    Object.keys(UI.fields).forEach(f => UI.fields[f].innerText = "--");
};

document.getElementById('clear-btn').addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    const dbs = await window.indexedDB.databases();
    dbs.forEach(d => window.indexedDB.deleteDatabase(d.name));
    const storageKeys = await caches.keys();
    await Promise.all(storageKeys.map(k => caches.delete(k)));
    
    wipeUI("Mesh framework cleared entirely.");
    localMesh.postMessage({ type: 'MESH_WIPE' });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}
