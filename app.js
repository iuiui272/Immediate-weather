document.addEventListener('DOMContentLoaded', async () => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            if ('sync' in reg) await reg.sync.register('priority-weather-fetch');
        } catch (e) { console.error(e); }
    }

    // 2. Request Notifications
    if (Notification.permission !== 'granted') await Notification.requestPermission();

    // 3. Interaction & Haptics
    document.getElementById('card').addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(15);
        document.getElementById('card').animate([{transform: 'scale(1)'}, {transform: 'scale(1.03)'}, {transform: 'scale(1)'}], 200);
    });
});
