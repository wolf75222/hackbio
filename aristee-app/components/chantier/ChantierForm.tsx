'use client';

import { useState, useEffect } from 'react';
import { ChantierInput, ChantierResults, DispersionArbres, ChantierType, DensiteArbres, TempsCoupeVegetation } from '@/lib/types/chantier';
import { Location } from '@/lib/types/location';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationPicker } from './LocationPicker';
import { AutoDataDisplay } from './AutoDataDisplay';
import { ResultsDisplay } from './ResultsDisplay';
import { fetchWeather } from '@/lib/api/weatherService';
import { fetchSoil } from '@/lib/api/soilService';
import { fetchElevation } from '@/lib/api/elevationService';
import { getSeason } from '@/lib/calculators/riskScorer';
import { calculateChantierResults } from '@/lib/calculators/marginCalculator';
import { analyzeChantierwithMistral } from '@/lib/api/mistralService';

export function ChantierForm() {
  // Forêt de Mormal - Scénario de démo pré-rempli
  const [location, setLocation] = useState<Location>({
    latitude: 50.2,
    longitude: 3.7333,
    address: 'Forêt de Mormal, Nord, Hauts-de-France',
  });

  const [formData, setFormData] = useState({
    name: 'Parcelle 142 - Forêt de Mormal',
    client: 'ONF - Office National des Forêts',
    type: 'tache' as ChantierType,
    prixFacture: '30000',
    volume: '8000',
    distanceTransport: '50',
    distanceDebardage: '250',
    dispersionArbres: 'moyen' as DispersionArbres,
    densiteArbres: 'moyenne' as DensiteArbres,
    tempsCoupeVegetation: 'recent' as TempsCoupeVegetation,
  });

  const [autoData, setAutoData] = useState<any>(undefined);
  const [isLoadingAutoData, setIsLoadingAutoData] = useState(false);
  const [results, setResults] = useState<ChantierResults | undefined>(undefined);

  // Auto-fetch data on component mount for demo
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  // Exemples de démo
  const loadDemoScenario = (scenario: 'mormal' | 'vosges' | 'bretagne') => {
    setResults(undefined);
    setAutoData(undefined);

    switch (scenario) {
      case 'mormal':
        setLocation({
          latitude: 50.2,
          longitude: 3.7333,
          address: 'Forêt de Mormal, Nord, Hauts-de-France',
        });
        setFormData({
          name: 'Parcelle 142 - Forêt de Mormal',
          client: 'ONF - Office National des Forêts',
          type: 'tache',
          prixFacture: '30000',
          volume: '8000',
          distanceTransport: '50',
          distanceDebardage: '250',
          dispersionArbres: 'moyen',
          densiteArbres: 'moyenne',
          tempsCoupeVegetation: 'recent',
        });
        break;
      case 'vosges':
        setLocation({
          latitude: 48.083125,
          longitude: 6.845169,
          address: 'Vosges, Grand Est',
        });
        setFormData({
          name: 'Chantier montagneux - Vosges',
          client: 'Exploitation Forestière Vosges',
          type: 'tache',
          prixFacture: '100000',
          volume: '15000',
          distanceTransport: '200',
          distanceDebardage: '400',
          dispersionArbres: 'eparpilles',
          densiteArbres: 'forte',
          tempsCoupeVegetation: 'moyen',
        });
        break;
      case 'bretagne':
        setLocation({
          latitude: 48.219526,
          longitude: -2.966309,
          address: 'Côtes-d\'Armor, Bretagne',
        });
        setFormData({
          name: 'Chantier humide - Bretagne',
          client: 'Coopérative Forestière Bretonne',
          type: 'heure',
          prixFacture: '15000',
          volume: '3000',
          distanceTransport: '100',
          distanceDebardage: '150',
          dispersionArbres: 'moyen',
          densiteArbres: 'moyenne',
          tempsCoupeVegetation: 'ancien',
        });
        break;
    }
    setHasAutoFetched(false); // Reset auto-fetch flag when scenario changes
  };

  // Auto-fetch data on mount for demo
  useEffect(() => {
    if (!hasAutoFetched && !autoData) {
      handleFetchAutoData();
      setHasAutoFetched(true);
    }
  }, [hasAutoFetched, autoData]);

  const handleFetchAutoData = async () => {
    setIsLoadingAutoData(true);
    try {
      const [weather, soil, terrain] = await Promise.all([
        fetchWeather(location.latitude, location.longitude),
        fetchSoil(location.latitude, location.longitude),
        fetchElevation(location.latitude, location.longitude, parseFloat(formData.distanceDebardage) || 150),
      ]);

      const season = getSeason(new Date());

      const newAutoData = {
        weather,
        soil,
        terrain,
        season,
        retrievedAt: new Date(),
      };

      setAutoData(newAutoData);
    } catch (error) {
      console.error('Error fetching auto data:', error);
      alert('Erreur lors de la récupération des données automatiques');
    } finally {
      setIsLoadingAutoData(false);
    }
  };

  const handleCalculate = async () => {
    if (!autoData) {
      alert('Veuillez d\'abord récupérer les données automatiques');
      return;
    }

    const chantier: ChantierInput = {
      name: formData.name,
      client: formData.client,
      type: formData.type,
      prixFacture: parseFloat(formData.prixFacture) || 0,
      location,
      volume: parseFloat(formData.volume) || 0,
      distanceTransport: parseFloat(formData.distanceTransport) || 0,
      distanceDebardage: parseFloat(formData.distanceDebardage) || 0,
      dispersionArbres: formData.dispersionArbres,
      densiteArbres: formData.densiteArbres,
      tempsCoupeVegetation: formData.tempsCoupeVegetation,
      autoData,
    };

    try {
      const calculatedResults = calculateChantierResults(chantier);

      // Appel à l'API Mistral pour analyse IA
      const aiAnalysis = await analyzeChantierwithMistral({
        name: chantier.name,
        client: chantier.client,
        type: chantier.type,
        prixFacture: chantier.prixFacture,
        volume: chantier.volume,
        distanceTransport: chantier.distanceTransport,
        distanceDebardage: chantier.distanceDebardage,
        dispersionArbres: chantier.dispersionArbres,
        margin: calculatedResults.margePercent,
        totalCost: calculatedResults.coutTotal,
        estimatedTime: calculatedResults.tempsEstime,
        riskScore: calculatedResults.scoreRisque,
        riskFactors: calculatedResults.riskFactors,
        weatherData: autoData.weather,
        soilData: autoData.soil,
        terrainData: autoData.terrain,
      });

      // Ajout de l'analyse IA aux résultats
      calculatedResults.aiAnalysis = aiAnalysis;

      setResults(calculatedResults);
    } catch (error) {
      console.error('Error calculating results:', error);
      alert('Erreur lors du calcul');
    }
  };

  return (
    <div className="space-y-6">
      {/* Boutons de scénarios de démo */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>🎬 Scénarios de démo</CardTitle>
          <CardDescription>
            Chargez un exemple pré-rempli pour tester rapidement l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => loadDemoScenario('mormal')}
              className="h-auto flex-col items-start p-4"
            >
              <div className="font-semibold mb-1">🌲 Forêt de Mormal</div>
              <div className="text-xs text-muted-foreground text-left">
                Nord • 8 000 m³ • Conditions normales
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => loadDemoScenario('vosges')}
              className="h-auto flex-col items-start p-4"
            >
              <div className="font-semibold mb-1">⛰️ Vosges</div>
              <div className="text-xs text-muted-foreground text-left">
                Montagne • 15 000 m³ • Difficile
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => loadDemoScenario('bretagne')}
              className="h-auto flex-col items-start p-4"
            >
              <div className="font-semibold mb-1">🌧️ Bretagne</div>
              <div className="text-xs text-muted-foreground text-left">
                Sol humide • 3 000 m³ • À risque
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Localisation */}
      <LocationPicker location={location} onLocationChange={setLocation} />

      {/* Bouton pour récupérer les données */}
      <div className="flex justify-center">
        <Button
          onClick={handleFetchAutoData}
          disabled={isLoadingAutoData}
          size="lg"
          className="w-full max-w-md"
        >
          {isLoadingAutoData ? 'Récupération...' : '🔄 Récupérer les données automatiquement'}
        </Button>
      </div>

      {/* Affichage des données automatiques */}
      <AutoDataDisplay autoData={autoData} isLoading={isLoadingAutoData} />

      {/* Formulaire du chantier */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Informations du chantier</CardTitle>
          <CardDescription>
            Renseignez les détails du chantier de débardage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aide contextuelle selon le type */}
          {formData.type === 'heure' ? (
            <Alert>
              <AlertDescription>
                <strong>💡 Facturation à l'heure :</strong> Le temps estimé est critique.
                Les distances de débardage et la répartition des arbres impactent fortement le nombre d'heures facturées.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                <strong>💡 Facturation à la tâche :</strong> Le volume de bois est la base du prix.
                L'estimation du temps permet de calculer votre rentabilité horaire.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du chantier</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Parcelle 142 - Forêt de Mormal"
              />
            </div>
            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="ONF - Office National des Forêts"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de facturation</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ChantierType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tache">💰 À la tâche (prix au m³)</SelectItem>
                  <SelectItem value="heure">⏰ À l'heure (tarif horaire)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prixCat">
                Prix facturé estimé
              </Label>
              <Select
                value={formData.prixFacture}
                onValueChange={(value) => setFormData({ ...formData, prixFacture: value })}
              >
                <SelectTrigger id="prixCat">
                  <SelectValue placeholder="Fourchette de prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">💶 Petit chantier (~15k €, 1-2 sem.)</SelectItem>
                  <SelectItem value="30000">💶💶 Chantier moyen (~30k €, 2-3 sem.)</SelectItem>
                  <SelectItem value="100000">💶💶💶 Grand chantier (~100k €, plusieurs mois)</SelectItem>
                  <SelectItem value="500000">💶💶💶💶 Très grand chantier (~500k €, 1 an+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Prix total facturé au client (parcelle complète)
              </p>
            </div>
          </div>

          {/* Volume avec catégories rapides */}
          <div>
            <Label htmlFor="volumeCategorie">
              Volume de bois estimé
              {formData.type === 'tache' && (
                <span className="text-xs text-muted-foreground ml-1">
                  • Important pour tarif
                </span>
              )}
            </Label>
            <Select
              value={formData.volume}
              onValueChange={(value) => setFormData({ ...formData, volume: value })}
            >
              <SelectTrigger id="volumeCategorie">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3000">🪵 Petit (2-4k m³)</SelectItem>
                <SelectItem value="8000">🪵🪵 Moyen (6-10k m³)</SelectItem>
                <SelectItem value="15000">🪵🪵🪵 Grand (12-18k m³)</SelectItem>
                <SelectItem value="25000">🪵🪵🪵🪵 Très grand (20k+ m³)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Estimation approximative du volume à débarder
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Distance transport */}
            <div>
              <Label htmlFor="distanceTransportCat">
                Distance jusqu'au chantier
              </Label>
              <Select
                value={formData.distanceTransport}
                onValueChange={(value) => setFormData({ ...formData, distanceTransport: value })}
              >
                <SelectTrigger id="distanceTransportCat">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">🚗 Proche (~50 km)</SelectItem>
                  <SelectItem value="100">🚗🚗 Moyen (~100 km)</SelectItem>
                  <SelectItem value="200">🚗🚗🚗 Loin (~200 km)</SelectItem>
                  <SelectItem value="500">🚗🚗🚗🚗 Très loin (~500 km)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Depuis votre dépôt/base
              </p>
            </div>

            {/* Distance débardage */}
            <div>
              <Label htmlFor="distanceDebardageCat">
                Distance de débardage
                {formData.type === 'heure' && (
                  <span className="text-xs text-red-500 ml-1">
                    • Critique pour temps
                  </span>
                )}
              </Label>
              <Select
                value={formData.distanceDebardage}
                onValueChange={(value) => setFormData({ ...formData, distanceDebardage: value })}
              >
                <SelectTrigger id="distanceDebardageCat">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">🌲 Court (&lt; 100m)</SelectItem>
                  <SelectItem value="150">🌲🌲 Moyen (100-200m)</SelectItem>
                  <SelectItem value="250">🌲🌲🌲 Long (200-300m)</SelectItem>
                  <SelectItem value="400">🌲🌲🌲🌲 Très long (300m+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Entre abattage et route
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="dispersion">
              Répartition des arbres dans la parcelle
              {formData.type === 'heure' && (
                <span className="text-xs text-red-500 ml-1">
                  • Impact direct sur le temps
                </span>
              )}
            </Label>
            <Select
              value={formData.dispersionArbres}
              onValueChange={(value: DispersionArbres) =>
                setFormData({ ...formData, dispersionArbres: value })
              }
            >
              <SelectTrigger id="dispersion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="groupes">
                  <div className="flex items-center gap-2">
                    <span>🟢 Groupés</span>
                    <span className="text-xs text-muted-foreground">
                      (temps normal)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="moyen">
                  <div className="flex items-center gap-2">
                    <span>🟡 Moyennement dispersés</span>
                    <span className="text-xs text-muted-foreground">
                      (temps +20%)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="eparpilles">
                  <div className="flex items-center gap-2">
                    <span>🔴 Éparpillés</span>
                    <span className="text-xs text-muted-foreground">
                      (temps +50%)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Arbres concentrés = moins d'allers-retours
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Densité d'arbres */}
            <div>
              <Label htmlFor="densite">
                Densité d'arbres
                {formData.type === 'heure' && (
                  <span className="text-xs text-red-500 ml-1">
                    • Impacte les allers-retours
                  </span>
                )}
              </Label>
              <Select
                value={formData.densiteArbres}
                onValueChange={(value: DensiteArbres) =>
                  setFormData({ ...formData, densiteArbres: value })
                }
              >
                <SelectTrigger id="densite">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">
                    <div className="flex items-center gap-2">
                      <span>🟢 Faible</span>
                      <span className="text-xs text-muted-foreground">
                        (gros arbres, -10% temps)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="moyenne">
                    <div className="flex items-center gap-2">
                      <span>🟡 Moyenne</span>
                      <span className="text-xs text-muted-foreground">
                        (temps normal)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="forte">
                    <div className="flex items-center gap-2">
                      <span>🔴 Forte</span>
                      <span className="text-xs text-muted-foreground">
                        (petits arbres, +25% temps)
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Nombre d'arbres dans la parcelle
              </p>
            </div>

            {/* Temps depuis coupe */}
            <div>
              <Label htmlFor="vegetation">
                Temps depuis l'abattage
                {formData.type === 'heure' && (
                  <span className="text-xs text-red-500 ml-1">
                    • Végétation = grumes cachées
                  </span>
                )}
              </Label>
              <Select
                value={formData.tempsCoupeVegetation}
                onValueChange={(value: TempsCoupeVegetation) =>
                  setFormData({ ...formData, tempsCoupeVegetation: value })
                }
              >
                <SelectTrigger id="vegetation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <span>🟢 Récent (&lt; 2 mois)</span>
                      <span className="text-xs text-muted-foreground">
                        (temps normal)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="moyen">
                    <div className="flex items-center gap-2">
                      <span>🟡 Moyen (2-6 mois)</span>
                      <span className="text-xs text-muted-foreground">
                        (+15% temps)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ancien">
                    <div className="flex items-center gap-2">
                      <span>🔴 Ancien (&gt; 6 mois)</span>
                      <span className="text-xs text-muted-foreground">
                        (+35% temps)
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Repousse végétation = grumes difficiles à trouver
              </p>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!autoData}
            size="lg"
            className="w-full"
          >
            🚀 Calculer la rentabilité
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {results && (
        <ResultsDisplay
          results={results}
          prixFacture={parseFloat(formData.prixFacture) || 0}
          typeFacturation={formData.type}
        />
      )}
    </div>
  );
}
