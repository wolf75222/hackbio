export type DrainageLevel = 'excellent' | 'bon' | 'moyen' | 'faible';
export type SoilSensitivity = 'faible' | 'moyenne' | 'elevee';

export interface SoilData {
  clayContent: number; // %
  sandContent: number; // %
  siltContent: number; // %
  drainage: DrainageLevel;
  sensitivity: SoilSensitivity;
  drainageClass?: string; // Classification brute de drainage (ex: "poorly drained")
  aiInterpretation?: string; // Interprétation IA du sol pour le débardage
}

export interface SoilGridsResponse {
  properties: {
    layers: Array<{
      name: string;
      depths: Array<{
        values: {
          mean: number;
        };
      }>;
    }>;
  };
}
