import { GeocodingResult } from '../types/location';
import { withCache, CACHE_TTL } from '../utils/cache';

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  // Utiliser le cache (30 jours TTL) car les adresses changent rarement
  return withCache(
    latitude,
    longitude,
    'geocoding',
    CACHE_TTL.GEOCODING,
    () => reverseGeocodeFromAPI(latitude, longitude)
  );
}

async function reverseGeocodeFromAPI(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    console.log('📍 Appel Nominatim API (non caché):', { latitude, longitude });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AristeeApp/1.0', // Nominatim requires User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data: GeocodingResult = await response.json();

    // Construire une adresse lisible
    const { address } = data;
    const parts = [
      address.city || address.town || address.village,
      address.county,
      address.state,
    ].filter(Boolean);

    return parts.join(', ') || data.display_name;
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

// Fonction pour rechercher des coordonnées depuis une adresse (optionnel pour MVP)
export async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AristeeApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
