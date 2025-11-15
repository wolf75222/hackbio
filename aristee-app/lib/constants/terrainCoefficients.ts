import { DrainageLevel } from '../types/soil';

// Coefficients appliqués sur la vitesse et la consommation selon le drainage du sol
export const SOIL_DRAINAGE_COEFFICIENTS: Record<DrainageLevel, { vitesse: number; consommation: number; chargeUtile: number }> = {
  excellent: {
    vitesse: 1.0,
    consommation: 1.0,
    chargeUtile: 1.0,
  },
  bon: {
    vitesse: 0.9,
    consommation: 1.1,
    chargeUtile: 0.95,
  },
  moyen: {
    vitesse: 0.75,
    consommation: 1.25,
    chargeUtile: 0.85,
  },
  faible: {
    vitesse: 0.6,
    consommation: 1.5,
    chargeUtile: 0.7,
  },
};

// Coefficients appliqués selon la pente
export const SLOPE_COEFFICIENTS = {
  getPenteCoefficient: (slope: number) => {
    if (slope < 5) return { vitesse: 1.0, consommation: 1.0 };
    if (slope < 10) return { vitesse: 0.85, consommation: 1.15 };
    if (slope < 15) return { vitesse: 0.7, consommation: 1.3 };
    return { vitesse: 0.6, consommation: 1.5 };
  },
};

// Coefficients météo (basé sur probabilité de pluie)
export const WEATHER_COEFFICIENTS = {
  getMeteoCoefficient: (precipProb: number, soilClayContent: number) => {
    // Probabilité de pluie < 30% : pas d'impact
    if (precipProb < 30) return { vitesse: 1.0, consommation: 1.0 };

    // Probabilité de pluie 30-50% : impact léger
    if (precipProb < 50) return { vitesse: 0.95, consommation: 1.05 };

    // Probabilité de pluie 50-70% : impact moyen
    if (precipProb < 70) {
      // Si sol argileux (>30% argile), impact plus fort
      if (soilClayContent > 30) {
        return { vitesse: 0.7, consommation: 1.3 };
      }
      return { vitesse: 0.85, consommation: 1.15 };
    }

    // Probabilité de pluie >70% : impact fort
    if (soilClayContent > 30) {
      return { vitesse: 0.6, consommation: 1.4 };
    }
    return { vitesse: 0.75, consommation: 1.25 };
  },
};

// Coefficients selon dispersion des arbres
export const DISPERSION_COEFFICIENTS = {
  groupes: 1.0,
  moyen: 1.2,
  eparpilles: 1.5,
};

// Coefficients selon densité d'arbres (nb d'arbres dans la parcelle)
// Plus il y a d'arbres, plus il y a de petits volumes par arbre = plus d'allers-retours
export const DENSITE_COEFFICIENTS = {
  faible: 0.9,    // Peu d'arbres = gros volumes par arbre = moins d'AR
  moyenne: 1.0,   // Densité normale
  forte: 1.25,    // Beaucoup d'arbres = petits volumes = beaucoup d'AR
};

// Coefficients selon temps depuis coupe (repousse végétation)
// Plus c'est ancien, plus c'est difficile de trouver/ramasser les grumes
export const VEGETATION_COEFFICIENTS = {
  recent: 1.0,    // Coupe récente (< 2 mois) : grumes bien visibles
  moyen: 1.15,    // Coupe il y a 2-6 mois : végétation commence à pousser
  ancien: 1.35,   // Coupe ancienne (> 6 mois) : grumes cachées par végétation
};
