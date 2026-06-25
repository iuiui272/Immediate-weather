document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');

    // 1. Service Worker & Priority Background Sync
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Offline core mounted:', registration.scope);
            
            // Trigger background sync for severe weather immediately
            if ('sync' in registration) {
                await registration.sync.register('priority-weather-fetch');
            }
        } catch (error) {
            console.error('Offline core failure:', error);
        }
    }

    // 2. Request Smart Warning Permissions
    if ('Notification' in window && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Emergency alerts enabled.');
        }
    }

    // 3. Initialize Haptics Engine (Navigator Vibrate)
    const triggerHaptic = (pattern = [10, 30, 10]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    // Attach haptic feedback to the main card for UI engagement
    document.getElementById('weather-container').addEventListener('click', () => {
        triggerHaptic([15]); // Light tap
    });

    statusText.innerText = "Awaiting peer discovery and sensor data...";
});
