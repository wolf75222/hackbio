import { WeatherData, WeatherForecast, OpenMeteoResponse } from '../types/weather';
import { withCache, CACHE_TTL } from '../utils/cache';

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  // Utiliser le cache (30 min TTL) car les prévisions météo sont mises à jour fréquemment
  return withCache(
    latitude,
    longitude,
    'weather',
    CACHE_TTL.WEATHER,
    () => fetchWeatherFromAPI(latitude, longitude)
  );
}

async function fetchWeatherFromAPI(latitude: number, longitude: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,weathercode&timezone=Europe/Paris`;

  try {
    console.log('🌦️  Appel Open-Meteo API (non caché):', { latitude, longitude });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }

    const data: OpenMeteoResponse = await response.json();

    // Convertir les données en format utilisable
    const forecast: WeatherForecast[] = data.daily.time.map((date, index) => ({
      date,
      precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
      precipitation: data.daily.precipitation_sum[index] || 0,
      temp: data.daily.temperature_2m_max[index] || 0,
      weatherCode: data.daily.weathercode[index] || 0,
    }));

    // Calculer les statistiques sur 7 jours
    const precipitationProbability = Math.max(...data.daily.precipitation_probability_max.slice(0, 7));
    const rainAccumulation7d = data.daily.precipitation_sum.slice(0, 7).reduce((a, b) => a + b, 0);
    const currentTemp = data.daily.temperature_2m_max[0] || 15;

    return {
      forecast: forecast.slice(0, 7), // 7 jours
      precipitationProbability,
      rainAccumulation7d,
      currentTemp,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Retourner des données par défaut en cas d'erreur
    return {
      forecast: [],
      precipitationProbability: 30, // Valeur moyenne par défaut
      rainAccumulation7d: 10,
      currentTemp: 15,
    };
  }
}

// Helper pour interpréter les codes météo Open-Meteo
export function getWeatherIcon(weatherCode: number): string {
  if (weatherCode === 0) return '☀️'; // Ciel dégagé
  if (weatherCode <= 3) return '🌤️'; // Partiellement nuageux
  if (weatherCode <= 48) return '🌫️'; // Brouillard
  if (weatherCode <= 67) return '🌧️'; // Pluie
  if (weatherCode <= 77) return '🌨️'; // Neige
  if (weatherCode <= 82) return '🌧️'; // Averses
  if (weatherCode <= 86) return '🌨️'; // Averses de neige
  return '⛈️'; // Orage
}

export function getWeatherDescription(weatherCode: number): string {
  if (weatherCode === 0) return 'Ciel dégagé';
  if (weatherCode <= 3) return 'Partiellement nuageux';
  if (weatherCode <= 48) return 'Brouillard';
  if (weatherCode <= 67) return 'Pluie';
  if (weatherCode <= 77) return 'Neige';
  if (weatherCode <= 82) return 'Averses';
  if (weatherCode <= 86) return 'Averses de neige';
  return 'Orage';
}
