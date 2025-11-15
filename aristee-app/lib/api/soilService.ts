import { SoilData, DrainageLevel, SoilSensitivity, SoilGridsResponse } from '../types/soil';
import { withCache, CACHE_TTL } from '../utils/cache';
import { interpretSoilData } from './mistralService';

export async function fetchSoil(latitude: number, longitude: number): Promise<SoilData> {
  // Utiliser le cache (24h TTL) pour éviter de dépasser la limite de 5 req/min
  return withCache(
    latitude,
    longitude,
    'soil',
    CACHE_TTL.SOIL,
    () => fetchSoilFromAPI(latitude, longitude)
  );
}

async function fetchSoilFromAPI(latitude: number, longitude: number): Promise<SoilData> {
  // SoilGrids API - récupère argile, sable, et densité du sol
  const properties = ['clay', 'sand', 'silt'];
  const depth = '0-5cm'; // Surface du sol (important pour débardage)

  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${latitude}&lon=${longitude}&property=${properties.join('&property=')}&depth=${depth}`;

    console.log('🌍 Appel SoilGrids API (non caché):', { latitude, longitude });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SoilGrids API error: ${response.statusText}`);
    }

    const data: SoilGridsResponse = await response.json();

    // Extraire les valeurs (en g/kg, il faut diviser par 10 pour avoir des %)
    const clayLayer = data.properties.layers.find((l) => l.name === 'clay');
    const sandLayer = data.properties.layers.find((l) => l.name === 'sand');
    const siltLayer = data.properties.layers.find((l) => l.name === 'silt');

    const clayContent = clayLayer?.depths[0]?.values?.mean / 10 || 20;
    const sandContent = sandLayer?.depths[0]?.values?.mean / 10 || 40;
    const siltContent = siltLayer?.depths[0]?.values?.mean / 10 || 40;

    // Calculer le drainage basé sur la texture
    const drainage = calculateDrainage(clayContent, sandContent);

    // Calculer la sensibilité aux ornières
    const sensitivity = calculateSensitivity(clayContent, drainage);

    // Classifier le drainage pour Mistral
    const drainageClass = getDrainageClass(drainage, clayContent);

    // Appeler Mistral pour interpréter le sol
    const aiInterpretation = await interpretSoilData(
      clayContent,
      sandContent,
      siltContent,
      drainageClass
    );

    return {
      clayContent,
      sandContent,
      siltContent,
      drainage,
      sensitivity,
      drainageClass,
      aiInterpretation,
    };
  } catch (error) {
    console.error('Error fetching soil data:', error);
    // Retourner des données par défaut
    return {
      clayContent: 25,
      sandContent: 40,
      siltContent: 35,
      drainage: 'moyen',
      sensitivity: 'moyenne',
    };
  }
}

function calculateDrainage(clayContent: number, sandContent: number): DrainageLevel {
  // Sol très sableux (>60% sable) : excellent drainage
  if (sandContent > 60) return 'excellent';

  // Sol sableux (>50% sable, <20% argile) : bon drainage
  if (sandContent > 50 && clayContent < 20) return 'bon';

  // Sol argileux (>35% argile) : faible drainage
  if (clayContent > 35) return 'faible';

  // Sol moyennement argileux (25-35% argile) : drainage moyen
  if (clayContent > 25) return 'moyen';

  // Autres : bon drainage
  return 'bon';
}

function calculateSensitivity(clayContent: number, drainage: DrainageLevel): SoilSensitivity {
  // Sol très argileux avec mauvais drainage : haute sensibilité
  if (clayContent > 35 && (drainage === 'faible' || drainage === 'moyen')) {
    return 'elevee';
  }

  // Sol argileux : sensibilité moyenne
  if (clayContent > 25) {
    return 'moyenne';
  }

  // Sol sableux : faible sensibilité
  return 'faible';
}

function getDrainageClass(drainage: DrainageLevel, clayContent: number): string {
  // Convertit le drainage en classification standard
  if (drainage === 'excellent') return 'well drained';
  if (drainage === 'bon') return 'moderately well drained';
  if (drainage === 'moyen' && clayContent > 30) return 'imperfectly drained';
  if (drainage === 'moyen') return 'moderately well drained';
  if (drainage === 'faible' && clayContent > 35) return 'poorly drained';
  return 'imperfectly drained';
}

export function getSoilDescription(soil: SoilData): string {
  if (soil.sandContent > 60) return 'Sableux';
  if (soil.clayContent > 35) return 'Argileux';
  if (soil.siltContent > 40) return 'Limoneux';
  if (soil.sandContent > soil.clayContent) return 'Sablo-limoneux';
  return 'Argilo-limoneux';
}
