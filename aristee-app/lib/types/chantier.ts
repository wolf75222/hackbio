import { WeatherData } from './weather';
import { SoilData } from './soil';
import { TerrainData } from './terrain';
import { Location } from './location';

export type ChantierType = 'tache' | 'heure';
export type DispersionArbres = 'groupes' | 'moyen' | 'eparpilles';
export type DensiteArbres = 'faible' | 'moyenne' | 'forte'; // Nombre d'arbres dans la parcelle
export type TempsCoupeVegetation = 'recent' | 'moyen' | 'ancien'; // Temps depuis coupe
export type Season = 'printemps' | 'ete' | 'automne' | 'hiver';

export interface AutoData {
  weather: WeatherData;
  soil: SoilData;
  terrain: TerrainData;
  season: Season;
  retrievedAt: Date;
}

export interface ChantierInput {
  name: string;
  client: string;
  type: ChantierType;
  prixFacture: number; // Prix vendu au client (€)

  // Localisation
  location: Location;

  // Volume et distance
  volume: number; // m³
  distanceTransport: number; // km depuis le dépôt jusqu'au chantier (aller simple)
  distanceDebardage: number; // mètres : distance moyenne entre zone d'abattage et piste/route forestière (50-500m typique)
  tailleParcelle?: number; // hectares : taille de la parcelle forestière (optionnel, plusieurs km²)

  // Terrain (manuel)
  dispersionArbres: DispersionArbres; // Comment les arbres sont répartis dans la parcelle
  densiteArbres: DensiteArbres; // Combien d'arbres dans la parcelle
  tempsCoupeVegetation: TempsCoupeVegetation; // Temps depuis l'abattage

  // Données automatiques (optionnel si déjà récupéré)
  autoData?: AutoData;
}

export interface ChantierResults {
  tempsEstime: number; // heures
  coutTotal: number; // €
  marge: number; // €
  margePercent: number; // %
  scoreRisque: number; // 0-100
  riskFactors: string[];
  recommendation: string;
  optimalPeriod?: string;

  // Détails des coûts
  coutDetails: {
    transport: number;
    carburant: number;
    machine: number;
    mainOeuvre: number;
  };

  // Analyse IA Mistral
  aiAnalysis?: {
    score: number; // Score sur 100
    interpretation: string; // Interprétation détaillée
    recommendations: string[]; // Recommandations IA
    successProbability: 'high' | 'medium' | 'low'; // Probabilité de succès
  };
}

export interface Chantier extends ChantierInput {
  id: string;
  results?: ChantierResults;
  createdAt: Date;
  updatedAt: Date;
}
