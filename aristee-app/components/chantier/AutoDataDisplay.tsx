'use client';

import { AutoData } from '@/lib/types/chantier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getWeatherIcon } from '@/lib/api/weatherService';
import { getSoilDescription } from '@/lib/api/soilService';

interface AutoDataDisplayProps {
  autoData: AutoData | undefined;
  isLoading: boolean;
}

export function AutoDataDisplay({ autoData, isLoading }: AutoDataDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🤖 Récupération des données...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!autoData) {
    return (
      <Alert>
        <AlertDescription>
          Sélectionnez une localisation pour récupérer les données automatiquement
        </AlertDescription>
      </Alert>
    );
  }

  const { weather, soil, terrain, season } = autoData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Données récupérées automatiquement</CardTitle>
        <CardDescription>
          Informations collectées via les APIs pour cette localisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Météo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">🌦️ Météo (Open-Meteo)</h4>
            <Badge variant="outline">{season}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Probabilité de pluie :</span>
              <span className={`ml-2 font-medium ${weather.precipitationProbability > 60 ? 'text-red-500' : weather.precipitationProbability > 40 ? 'text-orange-500' : 'text-green-500'}`}>
                {weather.precipitationProbability}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Accumulation 7j :</span>
              <span className="ml-2 font-medium">{weather.rainAccumulation7d.toFixed(1)} mm</span>
            </div>
            <div>
              <span className="text-muted-foreground">Température :</span>
              <span className="ml-2 font-medium">{weather.currentTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Prévisions 7 jours */}
          {weather.forecast.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">
                Prévisions 7 jours
              </div>
              <div className="flex gap-2">
                {weather.forecast.slice(0, 7).map((day, i) => {
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const month = date.toLocaleDateString('fr-FR', { month: 'short' });

                  return (
                    <div
                      key={i}
                      className={`flex-1 text-center p-3 border rounded-lg ${
                        day.precipitationProbability > 60
                          ? 'bg-red-50 border-red-200'
                          : day.precipitationProbability > 40
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-background'
                      }`}
                    >
                      <div className="text-xs font-medium capitalize mb-1">
                        {dayName}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {dayNum} {month}
                      </div>
                      <div className="text-2xl mb-1">
                        {getWeatherIcon(day.weatherCode)}
                      </div>
                      <div className={`text-sm font-semibold ${
                        day.precipitationProbability > 60
                          ? 'text-red-600'
                          : day.precipitationProbability > 40
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}>
                        {day.precipitationProbability}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.temp.toFixed(0)}°C
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {weather.precipitationProbability > 60 && (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ Forte probabilité de pluie dans les prochains jours
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Sol */}
        <div className="space-y-2">
          <h4 className="font-semibold">🗺️ Sol (SoilGrids)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type :</span>
              <span className="ml-2 font-medium">{getSoilDescription(soil)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Argile :</span>
              <span className="ml-2 font-medium">{soil.clayContent.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Drainage :</span>
              <Badge
                variant={
                  soil.drainage === 'excellent'
                    ? 'default'
                    : soil.drainage === 'bon'
                    ? 'secondary'
                    : soil.drainage === 'moyen'
                    ? 'outline'
                    : 'destructive'
                }
                className="ml-2"
              >
                {soil.drainage}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Sensibilité :</span>
              <Badge
                variant={
                  soil.sensitivity === 'faible'
                    ? 'default'
                    : soil.sensitivity === 'moyenne'
                    ? 'outline'
                    : 'destructive'
                }
                className="ml-2"
              >
                {soil.sensitivity}
              </Badge>
            </div>
          </div>

          {/* Interprétation IA du sol */}
          {soil.aiInterpretation && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="flex gap-2">
                  <span className="text-blue-600">🤖</span>
                  <div className="text-sm text-blue-900">{soil.aiInterpretation}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {soil.sensitivity === 'elevee' && !soil.aiInterpretation && (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ Sol très sensible aux ornières
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Relief */}
        <div className="space-y-2">
          <h4 className="font-semibold">📐 Relief (Elevation API)</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Altitude :</span>
              <span className="ml-2 font-medium">{terrain.altitude.toFixed(0)} m</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pente estimée :</span>
              <span className={`ml-2 font-medium ${terrain.slope > 15 ? 'text-red-500' : terrain.slope > 10 ? 'text-orange-500' : 'text-green-500'}`}>
                {terrain.slope.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulté :</span>
              <Badge
                variant={
                  terrain.difficulty === 'facile'
                    ? 'default'
                    : terrain.difficulty === 'moyen'
                    ? 'outline'
                    : 'destructive'
                }
                className="ml-2"
              >
                {terrain.difficulty}
              </Badge>
            </div>
          </div>

          {terrain.slope > 15 && (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ Pente forte : temps +{Math.round((terrain.slope / 10) * 30)}%, consommation +{Math.round((terrain.slope / 10) * 25)}%
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
