'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function Map({ center, onLocationSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialiser la carte si elle n'existe pas
    if (!mapRef.current) {
      const map = L.map(containerRef.current).setView(center, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Ajouter le marker initial
      const marker = L.marker(center, { draggable: true }).addTo(map);
      markerRef.current = marker;

      // Événement de déplacement du marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
      });

      // Événement de clic sur la carte
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
    }

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Mettre à jour le centre et le marker quand la position change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(center, 13);
      markerRef.current.setLatLng(center);
    }
  }, [center]);

  return <div ref={containerRef} className="h-full w-full" />;
}
