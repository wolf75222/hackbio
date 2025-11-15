export interface ConfigCouts {
  // Machine
  coutMachineHeure: number; // €/h (amortissement + maintenance)
  consommationBase: number; // L/h
  prixCarburant: number; // €/L

  // Transport
  coutTransportKm: number; // €/km

  // Main d'œuvre
  salaireOperateur: number; // €/h
  chargesSociales: number; // % (décimal: 0.45 = 45%)
  fraisDeplacement: number; // €/jour

  // Performance
  vitesseMoyennePorteur: number; // km/h
  chargeUtileMoyenne: number; // m³
  tempsChargementDechargement: number; // minutes
}

// Configuration par défaut (valeurs réalistes pour un porteur forestier)
export const DEFAULT_CONFIG: ConfigCouts = {
  coutMachineHeure: 40, // €/h (320€/jour sur 8h) - amortissement machine optimisé
  consommationBase: 12, // L/h - consommation réaliste en fonctionnement
  prixCarburant: 1.65, // €/L

  coutTransportKm: 15, // €/km (1500€ pour 100km aller-retour)

  salaireOperateur: 25, // €/h brut
  chargesSociales: 0.50, // 50%
  fraisDeplacement: 50, // €/jour (optimisé)

  vitesseMoyennePorteur: 3.5, // km/h en forêt
  chargeUtileMoyenne: 12, // m³ par voyage (capacité réelle porteur forestier)
  tempsChargementDechargement: 10, // minutes par cycle
};
