import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

export function useDashboardWeather() {
  const [cidade, setCidade] = useState(() => localStorage.getItem('dashboard_clima_cidade') || 'São Paulo, SP');
  const [dadosClima, setDadosClima] = useState({ temp: 26, condicao: 'Ensolarado', icone: 'wb_sunny', umidade: 60, vento: 12 });
  const [loadingClima, setLoadingClima] = useState(false);
  const [editandoCidade, setEditandoCidade] = useState(false);

  const fetchClima = useCallback(async (cidadeBusca = cidade, coords = null) => {
    if (!cidadeBusca && !coords) return;
    setLoadingClima(true);
    try {
      let lat, lon, nomeCidade;

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
        
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: { 'User-Agent': 'Meu Sistema PSIOS/1.0' }
          });
          const revData = await revRes.json();
          nomeCidade = revData.address.city || revData.address.town || revData.address.village || revData.address.suburb || "Localidade Atual";
          setCidade(nomeCidade);
          localStorage.setItem('dashboard_clima_cidade', nomeCidade);
        } catch (err) {
          logger.error("Erro no reverse geocoding:", err);
        }
      } else {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidadeBusca)}&format=json`, {
          headers: { 'User-Agent': 'Meu Sistema PSIOS/1.0' }
        });
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = geoData[0].lat;
          lon = geoData[0].lon;
        }
      }

      if (lat && lon) {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`);
        const weatherData = await weatherRes.json();
        
        if (weatherData.current_weather) {
          const current = weatherData.current_weather;
          const horaAtual = new Date().toISOString().substring(0, 13) + ":00";
          const indexHora = weatherData.hourly?.time.indexOf(horaAtual) ?? -1;
          const umidade = indexHora >= 0 ? weatherData.hourly.relative_humidity_2m[indexHora] : 60;

          const code = current.weathercode;
          let condicao = 'Ensolarado';
          let icone = 'wb_sunny';
          
          if (code === 0) { condicao = 'Ensolarado'; icone = 'wb_sunny'; }
          else if ([1, 2, 3].includes(code)) { condicao = 'Parcialmente Nublado'; icone = 'partly_cloudy_day'; }
          else if ([45, 48].includes(code)) { condicao = 'Névoa'; icone = 'foggy'; }
          else if ([51, 53, 55, 61, 63, 65].includes(code)) { condicao = 'Chuva'; icone = 'rainy'; }
          else if ([95].includes(code)) { condicao = 'Tempestade'; icone = 'thunderstorm'; }

          setDadosClima({
            temp: Math.round(current.temperature),
            condicao,
            icone,
            umidade,
            vento: Math.round(current.windspeed)
          });
        }
      }
    } catch (e) {
      logger.error("Erro ao buscar clima:", e);
    } finally {
      setLoadingClima(false);
    }
  }, [cidade]);

  const handleAutoLocalizar = useCallback(() => {
    if (!navigator.geolocation) return;

    setLoadingClima(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchClima(null, { lat: latitude, lon: longitude });
      },
      (err) => {
        logger.error("Erro ao obter localização:", err);
        setLoadingClima(false);
        if (!localStorage.getItem('dashboard_clima_cidade')) {
          fetchClima('São Paulo, SP');
        }
      },
      { timeout: 10000 }
    );
  }, [fetchClima]);

  useEffect(() => {
    const salva = localStorage.getItem('dashboard_clima_cidade');
    if (!salva) {
      handleAutoLocalizar();
    } else {
      fetchClima(salva);
    }
  }, [handleAutoLocalizar, fetchClima]);

  useEffect(() => {
    if (cidade) localStorage.setItem('dashboard_clima_cidade', cidade);
  }, [cidade]);

  return {
    cidade,
    setCidade,
    dadosClima,
    loadingClima,
    editandoCidade,
    setEditandoCidade,
    fetchClima,
    handleAutoLocalizar
  };
}
