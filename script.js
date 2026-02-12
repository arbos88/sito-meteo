const apiBase = 'https://api.open-meteo.com/v1/forecast';
const geocodingBase = 'https://geocoding-api.open-meteo.com/v1/search';

document.getElementById('cerca').addEventListener('click', cercaMeteo);
document.getElementById('citta').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') cercaMeteo();
});

cercaMeteo(); // Carica subito Roma

async function cercaMeteo() {
    const citta = document.getElementById('citta').value.trim();
    if(!citta) return;

    try {
        // 1. Cerco le coordinate della città
        const geoRes = await fetch(${geocodingBase}?name=${citta}&count=1);
        const geoData = await geoRes.json();
        
        if(!geoData.results) {
            alert('Città non trovata');
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];
        
        // 2. Prendo il meteo con le coordinate
        const meteoRes = await fetch(
            ${apiBase}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&timezone=auto
        );
        const meteoData = await meteoRes.json();
        
        // 3. Aggiorno il DOM
        document.getElementById('nome-citta').textContent = name;
        document.getElementById('temperatura').textContent = 
            ${meteoData.current_weather.temperature}°C;
        document.getElementById('descrizione').textContent = 
            descriviMeteo(meteoData.current_weather.weathercode);
        
        // Umidità (primo valore orario disponibile)
        const umidita = meteoData.hourly.relativehumidity_2m[0];
        document.getElementById('dettagli').innerHTML = 
            <span>💧 Umidità: ${umidita}%</span>
            <span>💨 Vento: ${meteoData.current_weather.windspeed} km/h</span>
        ;
        
    } catch(error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento dei dati');
    }
}

function descriviMeteo(codice) {
    // Codici WMO: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    if(codice === 0) return '☀️ Sereno';
    if(codice === 1) return '🌤️ Poco nuvoloso';
    if(codice === 2) return '⛅ Parzialmente nuvoloso';
    if(codice === 3) return '☁️ Coperto';
    if(codice >= 51 && codice <= 55) return '🌧️ Pioggia leggera';
    if(codice >= 61 && codice <= 65) return '🌧️ Pioggia';
    if(codice >= 71 && codice <= 75) return '❄️ Neve';
    if(codice === 95) return '⛈️ Temporale';
    return '🌡️ ' + codice; // Altri casi
}