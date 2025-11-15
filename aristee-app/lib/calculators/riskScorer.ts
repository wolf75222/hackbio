import { ChantierInput, Season } from '../types/chantier';

export interface RiskAssessment {
  scoreTotal: number; // 0-100
  scoreMeteo: number;
  scoreSol: number;
  scorePente: number;
  scoreSaison: number;
  riskFactors: string[];
  riskLevel: 'faible' | 'moyen' | 'eleve' | 'critique';
}

export function calculateRisk(chantier: ChantierInput): RiskAssessment {
  if (!chantier.autoData) {
    throw new Error('Auto data required for risk calculation');
  }

  const { weather, soil, terrain, season } = chantier.autoData;

  // 1. Score météo (0-100)
  const scoreMeteo = calculateWeatherRisk(
    weather.precipitationProbability,
    weather.rainAccumulation7d
  );

  // 2. Score sol (0-100)
  const scoreSol = calculateSoilRisk(soil.drainage, soil.clayContent);

  // 3. Score pente (0-100)
  const scorePente = calculateSlopeRisk(terrain.slope);

  // 4. Score saison (0-100)
  const scoreSaison = calculateSeasonRisk(season);

  // 5. Score total pondéré
  let scoreTotal =
    scoreMeteo * 0.35 +
    scoreSol * 0.25 +
    scorePente * 0.2 +
    scoreSaison * 0.2;

  // 6. Bonus risque pour combinaisons critiques
  const riskFactors: string[] = [];

  // Hiver + pluie prévue + sol argileux
  if (
    season === 'hiver' &&
    weather.precipitationProbability > 50 &&
    soil.clayContent > 30
  ) {
    scoreTotal += 25;
    riskFactors.push('⚠️ Combinaison critique : hiver + pluie + sol argileux');
  }

  // Pente forte + sol à faible drainage
  if (terrain.slope > 12 && (soil.drainage === 'faible' || soil.drainage === 'moyen')) {
    scoreTotal += 15;
    riskFactors.push('⚠️ Pente forte sur sol sensible');
  }

  // Pluie dans 48h + sol sensible
  if (weather.precipitationProbability > 60 && soil.sensitivity === 'elevee') {
    scoreTotal += 15;
    riskFactors.push('⚠️ Forte probabilité de pluie sur sol très sensible');
  }

  // Plafonner à 100
  scoreTotal = Math.min(100, scoreTotal);

  // 7. Ajouter les facteurs de risque individuels
  if (weather.precipitationProbability > 60) {
    riskFactors.push(`🌧️ Pluie prévue à ${weather.precipitationProbability}%`);
  }

  if (soil.drainage === 'faible') {
    riskFactors.push('💧 Sol à faible drainage (risque d\'ornières)');
  }

  if (terrain.slope > 15) {
    riskFactors.push(`⛰️ Pente forte (${terrain.slope}%)`);
  }

  if (season === 'hiver') {
    riskFactors.push('❄️ Période hivernale (conditions plus difficiles)');
  }

  // Végétation ancienne = grumes difficiles à trouver
  if (chantier.tempsCoupeVegetation === 'ancien') {
    riskFactors.push('🌿 Végétation avancée (temps de travail +35%)');
  }

  // Densité forte = beaucoup de petits arbres
  if (chantier.densiteArbres === 'forte') {
    riskFactors.push('🌳 Densité forte (nombreux allers-retours, temps +25%)');
  }

  // 8. Niveau de risque
  const riskLevel = getRiskLevel(scoreTotal);

  return {
    scoreTotal: Math.round(scoreTotal),
    scoreMeteo: Math.round(scoreMeteo),
    scoreSol: Math.round(scoreSol),
    scorePente: Math.round(scorePente),
    scoreSaison: Math.round(scoreSaison),
    riskFactors,
    riskLevel,
  };
}

function calculateWeatherRisk(precipProb: number, rainAccum7d: number): number {
  // Probabilité de pluie sur 7 jours
  const riskPrecipProb = precipProb; // 0-100

  // Accumulation de pluie (>30mm = risque élevé)
  const riskAccum = Math.min(100, (rainAccum7d / 30) * 100);

  return riskPrecipProb * 0.7 + riskAccum * 0.3;
}

function calculateSoilRisk(drainage: string, clayContent: number): number {
  let baseScore = 0;

  switch (drainage) {
    case 'excellent':
      baseScore = 10;
      break;
    case 'bon':
      baseScore = 30;
      break;
    case 'moyen':
      baseScore = 60;
      break;
    case 'faible':
      baseScore = 85;
      break;
  }

  // Ajustement selon teneur en argile
  if (clayContent > 35) baseScore = Math.min(100, baseScore + 15);
  if (clayContent > 40) baseScore = Math.min(100, baseScore + 10);

  return baseScore;
}

function calculateSlopeRisk(slope: number): number {
  // Pente en % → score de risque
  // 0-5% : 10
  // 5-10% : 30
  // 10-15% : 60
  // 15-20% : 80
  // >20% : 100

  if (slope < 5) return 10;
  if (slope < 10) return 30;
  if (slope < 15) return 60;
  if (slope < 20) return 80;
  return 100;
}

function calculateSeasonRisk(season: Season): number {
  switch (season) {
    case 'ete':
      return 20; // Faible risque
    case 'printemps':
    case 'automne':
      return 50; // Risque moyen
    case 'hiver':
      return 75; // Risque élevé
  }
}

function getRiskLevel(score: number): 'faible' | 'moyen' | 'eleve' | 'critique' {
  if (score < 30) return 'faible';
  if (score < 60) return 'moyen';
  if (score < 80) return 'eleve';
  return 'critique';
}

// Helper pour obtenir la saison depuis une date
export function getSeason(date: Date): Season {
  const month = date.getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'ete';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}
