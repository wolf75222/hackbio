export interface WeatherForecast {
  date: string;
  precipitationProbability: number; // %
  precipitation: number; // mm
  temp: number; // °C
  weatherCode: number;
}

export interface WeatherData {
  forecast: WeatherForecast[];
  precipitationProbability: number; // % max sur 7 jours
  rainAccumulation7d: number; // mm
  currentTemp: number; // °C
}

export interface OpenMeteoResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    temperature_2m_max: number[];
    weathercode: number[];
  };
}
