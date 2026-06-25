// Function to update the city display in the UI
function updateCityDisplay(cityName) {
    const cityDisplay = document.getElementById('city-display');
    if (cityDisplay) {
        cityDisplay.innerText = cityName;
    }
}

// Update your existing event listener
document.getElementById('city-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = e.target.value;
        localStorage.setItem('lastCity', city);
        
        // Update the UI immediately
        updateCityDisplay(city);
        alert('City saved: ' + city);
    }
});

// Restore on page load
window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        updateCityDisplay(savedCity);
    }
});
