export type TerrainDifficulty = 'facile' | 'moyen' | 'difficile';

export interface TerrainData {
  altitude: number; // m
  slope: number; // %
  difficulty: TerrainDifficulty;
}

export interface ElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}
