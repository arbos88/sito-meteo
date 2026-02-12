const apiBase = 'https://api.open-meteo.com/v1/forecast';
const geocodingBase = 'https://geocoding-api.open-meteo.com/v1/search';

document.getElementById('cerca').addEventListener('click', function() {
    const citta = document.getElementById('citta').value.trim();
    if (citta) {
        cercaMeteo(citta);
    }
});

document.getElementById('citta').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const citta = document.getElementById('citta').value.trim();
        if (citta) {
            cercaMeteo(citta);
        }
    }
});

window.addEventListener('load', function() {
    cercaMeteo('Roma');
});

async function cercaMeteo(citta) {
    if (!citta) return;
    
    try {
        const geoRes = await fetch(geocodingBase + '?name=' + citta + '&count=1&language=it');
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            alert('Città non trovata');
            return;
        }
        
        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const nome = geoData.results[0].name;
        
        const meteoRes = await fetch(apiBase + '?latitude=' + lat + '&longitude=' + lon + '&current_weather=true&hourly=relativehumidity_2m&timezone=auto');
        const meteoData = await meteoRes.json();
        
        document.getElementById('nome-citta').textContent = nome;
        document.getElementById('temperatura').textContent = meteoData.current_weather.temperature + '°C';
        document.getElementById('descrizione').textContent = descriviMeteo(meteoData.current_weather.weathercode);
        
        let umidita = '--';
        if (meteoData.hourly && meteoData.hourly.relativehumidity_2m && meteoData.hourly.relativehumidity_2m.length > 0) {
            umidita = meteoData.hourly.relativehumidity_2m[0];
        }
        
        document.getElementById('dettagli').innerHTML = '<span>💧 Umidità: ' + umidita + '%</span> <span>💨 Vento: ' + meteoData.current_weather.windspeed + ' km/h</span>';
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento dei meteo. Riprova.');
    }
}

function descriviMeteo(codice) {
    if (codice === 0) return '☀️ Sereno';
    if (codice === 1) return '🌤️ Poco nuvoloso';
    if (codice === 2) return '⛅ Parzialmente nuvoloso';
    if (codice === 3) return '☁️ Coperto';
    if (codice >= 45 && codice <= 48) return '🌫️ Nebbia';
    if (codice >= 51 && codice <= 55) return '🌧️ Pioviggine';
    if (codice >= 61 && codice <= 65) return '🌧️ Pioggia';
    if (codice >= 71 && codice <= 75) return '❄️ Neve';
    if (codice === 95) return '⛈️ Temporale';
    return '🌡️ Altro';
}
