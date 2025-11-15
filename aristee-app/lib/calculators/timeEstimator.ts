import { ChantierInput } from '../types/chantier';
import { DEFAULT_CONFIG } from '../constants/machineRates';
import {
  SOIL_DRAINAGE_COEFFICIENTS,
  SLOPE_COEFFICIENTS,
  WEATHER_COEFFICIENTS,
  DISPERSION_COEFFICIENTS,
  DENSITE_COEFFICIENTS,
  VEGETATION_COEFFICIENTS,
} from '../constants/terrainCoefficients';

export interface TimeEstimation {
  tempsTotal: number; // heures
  nombreAllersRetours: number;
  tempsCycle: number; // minutes
  vitesseMoyenne: number; // km/h
  details: {
    tempsDebardage: number; // heures
    tempsSetup: number; // heures
  };
}

export function calculateTime(chantier: ChantierInput): TimeEstimation {
  const config = DEFAULT_CONFIG;

  if (!chantier.autoData) {
    throw new Error('Auto data required for time calculation');
  }

  const { weather, soil, terrain } = chantier.autoData;

  // 1. Calculer les coefficients selon les conditions
  const coeffSol = SOIL_DRAINAGE_COEFFICIENTS[soil.drainage];
  const coeffPente = SLOPE_COEFFICIENTS.getPenteCoefficient(terrain.slope);
  const coeffMeteo = WEATHER_COEFFICIENTS.getMeteoCoefficient(
    weather.precipitationProbability,
    soil.clayContent
  );
  const coeffDispersion = DISPERSION_COEFFICIENTS[chantier.dispersionArbres];
  const coeffDensite = DENSITE_COEFFICIENTS[chantier.densiteArbres];
  const coeffVegetation = VEGETATION_COEFFICIENTS[chantier.tempsCoupeVegetation];

  // 2. Calculer la vitesse ajustée
  const vitesseBase = config.vitesseMoyennePorteur; // km/h
  const vitesseAjustee =
    vitesseBase *
    coeffSol.vitesse *
    coeffPente.vitesse *
    coeffMeteo.vitesse;

  // 3. Calculer la charge utile ajustée
  const chargeUtileBase = config.chargeUtileMoyenne; // m³
  const chargeUtileAjustee = chargeUtileBase * coeffSol.chargeUtile;

  // 4. Calculer le nombre d'allers-retours
  const nombreAllersRetours = Math.ceil(chantier.volume / chargeUtileAjustee);

  // 5. Calculer le temps par cycle
  const distanceKm = chantier.distanceDebardage / 1000; // Convertir mètres en km
  const tempsTrajet = (distanceKm * 2) / vitesseAjustee; // heures (aller-retour)
  const tempsChargementDechargement = config.tempsChargementDechargement / 60; // heures

  const tempsCycleHeures = (tempsTrajet + tempsChargementDechargement) * coeffDispersion * coeffVegetation;

  // 6. Temps total de débardage (avec impact densité)
  const tempsDebardage = nombreAllersRetours * tempsCycleHeures * coeffDensite;

  // 7. Temps de setup (installation, préparation, déplacement initial)
  const tempsSetup = 2; // 2 heures (installation optimisée)

  // 8. Temps total
  const tempsTotal = tempsDebardage + tempsSetup;

  return {
    tempsTotal: Math.round(tempsTotal * 10) / 10,
    nombreAllersRetours,
    tempsCycle: Math.round(tempsCycleHeures * 60), // minutes
    vitesseMoyenne: Math.round(vitesseAjustee * 10) / 10,
    details: {
      tempsDebardage: Math.round(tempsDebardage * 10) / 10,
      tempsSetup,
    },
  };
}
