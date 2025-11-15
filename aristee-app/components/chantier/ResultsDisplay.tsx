'use client';

import { ChantierResults } from '@/lib/types/chantier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResultsDisplayProps {
  results: ChantierResults;
  prixFacture: number;
  typeFacturation?: 'tache' | 'heure';
}

export function ResultsDisplay({ results, prixFacture, typeFacturation = 'tache' }: ResultsDisplayProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMargeColor = (margePercent: number) => {
    if (margePercent < 10) return 'text-red-600';
    if (margePercent < 20) return 'text-orange-500';
    if (margePercent < 30) return 'text-yellow-600';
    return 'text-[#14532d]';
  };

  // Calcul rentabilité horaire
  const rentabiliteHoraire = results.marge / results.tempsEstime;

  return (
    <div className="space-y-6">
      {/* En-tête des résultats */}
      <div className="bg-[#14532d] text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">📊 RÉSULTATS DE L'ANALYSE</h2>
        <p className="text-white/80">
          Estimation basée sur les données terrain et les conditions environnementales
        </p>
      </div>

      {/* Données environnementales */}
      {results.autoData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">☀️ Météo</div>
              <div className="space-y-1 text-sm">
                <div>Temp: {results.autoData.weather.temperature}°C</div>
                <div>Précip: {results.autoData.weather.precipitationProbability}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">🌱 Sol</div>
              <div className="space-y-1 text-sm">
                <div>Drainage: {results.autoData.soil.drainage}</div>
                <div>Argile: {results.autoData.soil.clayContent}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">⛰️ Terrain</div>
              <div className="space-y-1 text-sm">
                <div>Pente: {results.autoData.terrain.slope}%</div>
                <div>Accessibilité: {results.autoData.terrain.accessibility}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicateurs principaux - Style moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Temps estimé</div>
            <div className="text-3xl font-bold text-gray-900">
              {results.tempsEstime < 24
                ? `${results.tempsEstime}h`
                : results.tempsEstime < 168
                ? `${(results.tempsEstime / 8).toFixed(1)}j`
                : `${(results.tempsEstime / 40).toFixed(1)}sem`}
            </div>
            {typeFacturation === 'heure' && (
              <div className="text-xs text-blue-600 font-semibold mt-2">
                Base facturation
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Chiffre d'affaires</div>
            <div className="text-3xl font-bold text-gray-900">{prixFacture.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>

        <Card className={results.margePercent < 15 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Coût total</div>
            <div className={`text-3xl font-bold ${results.margePercent < 15 ? 'text-red-700' : 'text-gray-900'}`}>
              {results.coutTotal.toLocaleString('fr-FR')}€
            </div>
          </CardContent>
        </Card>

        <Card className={results.margePercent >= 20 ? 'border-[#14532d]/30 bg-[#14532d]/5' : 'border-gray-200 bg-white'}>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Marge</div>
            <div className={`text-3xl font-bold ${getMargeColor(results.margePercent)}`}>
              {results.marge.toLocaleString('fr-FR')}€
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {results.margePercent}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Niveau de risque */}
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-700">Niveau de risque</div>
        <Progress
          value={results.scoreRisque}
          className="h-3"
          indicatorClassName={getRiskColor(results.scoreRisque)}
        />
        <div className="mt-2 text-sm font-medium">
          {results.scoreRisque < 30 && '✅ Risque faible'}
          {results.scoreRisque >= 30 && results.scoreRisque < 60 && '⚠️ Risque moyen'}
          {results.scoreRisque >= 60 && results.scoreRisque < 80 && '🚨 Risque élevé'}
          {results.scoreRisque >= 80 && '⛔ Risque critique'}
        </div>
      </div>

      {/* Détails financiers */}
      <Card>
        <CardContent className="p-6">
          <div className="text-lg font-bold mb-4">💰 Détails financiers</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transport</span>
              <span className="font-semibold">{results.coutDetails.transport}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Carburant</span>
              <span className="font-semibold">{results.coutDetails.carburant}€</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total coûts</span>
              <span className="font-bold">{results.coutTotal}€</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Prix facturé</span>
              <span className="font-bold">{prixFacture}€</span>
            </div>
            <div className="h-px bg-gray-300" />
            <div className="flex justify-between text-xl">
              <span className="font-bold">Marge</span>
              <span className={`font-bold ${getMargeColor(results.margePercent)}`}>
                {results.marge}€ ({results.margePercent}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
