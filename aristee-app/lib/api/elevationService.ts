import { TerrainData, TerrainDifficulty, ElevationResponse } from '../types/terrain';
import { withCache, CACHE_TTL } from '../utils/cache';

export async function fetchElevation(
  latitude: number,
  longitude: number,
  distanceDebardage: number = 150 // mètres
): Promise<TerrainData> {
  // Utiliser le cache (1 an TTL) car l'altitude ne change jamais
  return withCache(
    latitude,
    longitude,
    'elevation',
    CACHE_TTL.ELEVATION,
    () => fetchElevationFromAPI(latitude, longitude, distanceDebardage)
  );
}

async function fetchElevationFromAPI(
  latitude: number,
  longitude: number,
  distanceDebardage: number = 150
): Promise<TerrainData> {
  try {
    const url = 'https://api.open-elevation.com/api/v1/lookup';

    console.log('⛰️  Appel Open-Elevation API (non caché):', { latitude, longitude });

    // Requête pour obtenir l'altitude au point de départ
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations: [{ latitude, longitude }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Open-Elevation API error: ${response.statusText}`);
    }

    const data: ElevationResponse = await response.json();
    const altitude = data.results[0]?.elevation || 0;

    // Estimer la pente basée sur la distance de débardage
    // Note: Pour une estimation plus précise, il faudrait interroger plusieurs points
    // Ici on fait une estimation simple basée sur l'altitude
    const slope = estimateSlope(altitude, distanceDebardage);

    const difficulty = calculateDifficulty(slope);

    return {
      altitude,
      slope,
      difficulty,
    };
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    // Retourner des données par défaut
    return {
      altitude: 200,
      slope: 5,
      difficulty: 'moyen',
    };
  }
}

function estimateSlope(altitude: number, distanceDebardage: number): number {
  // Estimation simplifiée de la pente basée sur l'altitude
  // En forêt, plus l'altitude est élevée, plus il y a de chances d'avoir de la pente

  // Pour un MVP, on peut utiliser une heuristique simple :
  // - Altitude < 100m : terrain plat (pente 2-5%)
  // - Altitude 100-300m : terrain vallonné (pente 5-10%)
  // - Altitude 300-600m : terrain accidenté (pente 10-15%)
  // - Altitude > 600m : montagne (pente > 15%)

  if (altitude < 100) return Math.random() * 3 + 2; // 2-5%
  if (altitude < 300) return Math.random() * 5 + 5; // 5-10%
  if (altitude < 600) return Math.random() * 5 + 10; // 10-15%
  return Math.random() * 10 + 15; // 15-25%
}

function calculateDifficulty(slope: number): TerrainDifficulty {
  if (slope < 8) return 'facile';
  if (slope < 15) return 'moyen';
  return 'difficile';
}

// Fonction pour calculer la pente réelle entre deux points (si on a plusieurs coordonnées)
export function calculateSlopeBetweenPoints(
  alt1: number,
  alt2: number,
  horizontalDistance: number
): number {
  const verticalDiff = Math.abs(alt2 - alt1);
  const slopePercent = (verticalDiff / horizontalDistance) * 100;
  return Math.round(slopePercent * 10) / 10; // Arrondi à 1 décimale
}
