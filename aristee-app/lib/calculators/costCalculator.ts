import { ChantierInput } from '../types/chantier';
import { DEFAULT_CONFIG } from '../constants/machineRates';
import { calculateTime } from './timeEstimator';
import {
  SOIL_DRAINAGE_COEFFICIENTS,
  SLOPE_COEFFICIENTS,
  WEATHER_COEFFICIENTS,
} from '../constants/terrainCoefficients';

export interface CostBreakdown {
  transport: number;
  carburant: number;
  machine: number;
  mainOeuvre: number;
  total: number;
}

export function calculateCosts(chantier: ChantierInput): CostBreakdown {
  const config = DEFAULT_CONFIG;

  if (!chantier.autoData) {
    throw new Error('Auto data required for cost calculation');
  }

  const { weather, soil, terrain } = chantier.autoData;

  // 1. Obtenir le temps estimé
  const timeEstimation = calculateTime(chantier);

  // 2. Coût de transport (aller-retour)
  const coutTransport = chantier.distanceTransport * config.coutTransportKm * 2;

  // 3. Coût du carburant
  const coeffSol = SOIL_DRAINAGE_COEFFICIENTS[soil.drainage];
  const coeffPente = SLOPE_COEFFICIENTS.getPenteCoefficient(terrain.slope);
  const coeffMeteo = WEATHER_COEFFICIENTS.getMeteoCoefficient(
    weather.precipitationProbability,
    soil.clayContent
  );

  const consommationAjustee =
    config.consommationBase *
    coeffSol.consommation *
    coeffPente.consommation *
    coeffMeteo.consommation;

  const coutCarburant =
    timeEstimation.tempsTotal * consommationAjustee * config.prixCarburant;

  // 4. Coût machine (temps × coût horaire)
  const coutMachine = timeEstimation.tempsTotal * config.coutMachineHeure;

  // 5. Coût main d'œuvre
  const salaireHoraireCharge =
    config.salaireOperateur * (1 + config.chargesSociales);
  const coutMainOeuvre =
    timeEstimation.tempsTotal * salaireHoraireCharge +
    config.fraisDeplacement;

  // 6. Total
  const total = coutTransport + coutCarburant + coutMachine + coutMainOeuvre;

  return {
    transport: Math.round(coutTransport),
    carburant: Math.round(coutCarburant),
    machine: Math.round(coutMachine),
    mainOeuvre: Math.round(coutMainOeuvre),
    total: Math.round(total),
  };
}
