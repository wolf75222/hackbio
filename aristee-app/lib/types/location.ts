export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  altitude?: number;
}

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}
