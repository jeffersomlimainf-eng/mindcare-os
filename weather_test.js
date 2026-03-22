const fetch = require('node-fetch');

async function getClima(cidade) {
    try {
        console.log(`Buscando coordenadas para: ${cidade}...`);
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json`, {
            headers: { 'User-Agent': 'MindCareOS/1.0' }
        });
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) {
            console.log("Cidade não encontrada.");
            return;
        }
        const { lat, lon, display_name } = geoData[0];
        console.log(`Coordenadas: ${lat}, ${lon} (${display_name})`);

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`);
        const weatherData = await weatherRes.json();
        
        console.log("Clima Atual:", weatherData.current_weather);
        
        // Pegar umidade da hora atual
        const horaAtual = new Date().toISOString().substring(0, 13) + ":00";
        const indexHora = weatherData.hourly.time.indexOf(horaAtual);
        const umidade = indexHora >= 0 ? weatherData.hourly.relative_humidity_2m[indexHora] : "--";

        console.log(`Temperatura: ${weatherData.current_weather.temperature}°C`);
        console.log(`Código Clima: ${weatherData.current_weather.weathercode}`);
        console.log(`Vento: ${weatherData.current_weather.windspeed} km/h`);
        console.log(`Umidade: ${umidade}%`);

    } catch (e) {
        console.error("Erro:", e.message);
    }
}

getClima("São Paulo, SP");
