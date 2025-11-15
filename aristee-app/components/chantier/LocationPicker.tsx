'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { reverseGeocode } from '@/lib/api/geocodingService';
import { Location } from '@/lib/types/location';

// Import dynamique de Leaflet pour éviter les erreurs SSR
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-md" />,
});

interface LocationPickerProps {
  location: Location;
  onLocationChange: (location: Location) => void;
}

export function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const [lat, setLat] = useState(location.latitude.toString());
  const [lon, setLon] = useState(location.longitude.toString());
  const [address, setAddress] = useState(location.address || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleManualUpdate = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Coordonnées invalides');
      return;
    }

    setIsLoading(true);
    try {
      const fetchedAddress = await reverseGeocode(latitude, longitude);
      const newLocation: Location = {
        latitude,
        longitude,
        address: fetchedAddress,
      };
      setAddress(fetchedAddress);
      onLocationChange(newLocation);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (latitude: number, longitude: number) => {
    setLat(latitude.toFixed(6));
    setLon(longitude.toFixed(6));
    setIsLoading(true);

    try {
      const fetchedAddress = await reverseGeocode(latitude, longitude);
      const newLocation: Location = {
        latitude,
        longitude,
        address: fetchedAddress,
      };
      setAddress(fetchedAddress);
      onLocationChange(newLocation);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📍 Localisation du chantier</CardTitle>
        <CardDescription>
          Cliquez sur la carte ou entrez les coordonnées GPS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="48.8566"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="2.3522"
            />
          </div>
        </div>

        <Button onClick={handleManualUpdate} disabled={isLoading} className="w-full">
          {isLoading ? 'Chargement...' : 'Mettre à jour la localisation'}
        </Button>

        {address && (
          <div className="text-sm text-muted-foreground">
            📍 {address}
          </div>
        )}

        <div className="h-[400px] rounded-md overflow-hidden border">
          <MapComponent
            center={[location.latitude, location.longitude]}
            onLocationSelect={handleMapClick}
          />
        </div>
      </CardContent>
    </Card>
  );
}
