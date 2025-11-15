'use client';

import { useState } from 'react';
import { ChantierInput, ChantierResults, DispersionArbres, ChantierType, DensiteArbres, TempsCoupeVegetation } from '@/lib/types/chantier';
import { Location } from '@/lib/types/location';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LocationPicker } from './LocationPicker';
import { AutoDataDisplay } from './AutoDataDisplay';
import { ResultsDisplay } from './ResultsDisplay';
import { fetchWeather } from '@/lib/api/weatherService';
import { fetchSoil } from '@/lib/api/soilService';
import { fetchElevation } from '@/lib/api/elevationService';
import { getSeason } from '@/lib/calculators/riskScorer';
import { calculateChantierResults } from '@/lib/calculators/marginCalculator';
import { analyzeChantierwithMistral } from '@/lib/api/mistralService';
import { ChevronRight, ChevronLeft, MapPin, Cloud, FileText, Trees, CheckCircle } from 'lucide-react';

type WizardStep = 'scenarios' | 'location' | 'autodata' | 'info' | 'terrain' | 'results';

export function ChantierWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('scenarios');

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
    setCurrentStep('location');
  };

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

      // Essayer l'analyse IA, mais continuer sans si elle échoue
      try {
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
        calculatedResults.aiAnalysis = aiAnalysis;
      } catch (aiError) {
        console.warn('IA analysis failed, continuing without it:', aiError);
        // Continuer sans l'analyse IA
      }

      setResults(calculatedResults);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error calculating results:', error);
      alert('Erreur lors du calcul');
    }
  };

  const getStepProgress = () => {
    const steps: WizardStep[] = ['scenarios', 'location', 'autodata', 'info', 'terrain', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {currentStep !== 'scenarios' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression</span>
                <span>{Math.round(getStepProgress())}%</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Scenarios */}
      {currentStep === 'scenarios' && (
        <Card>
          <CardHeader>
            <CardTitle>Scénarios de démo</CardTitle>
            <CardDescription>
              Choisissez un scénario pré-rempli pour commencer rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => loadDemoScenario('mormal')}
                className="h-auto flex-col items-start p-6 hover:bg-[#14532d]/5 hover:border-[#14532d]"
              >
                <div className="font-semibold text-lg mb-2">🌲 Forêt de Mormal</div>
                <div className="text-sm text-muted-foreground text-left">
                  Nord • 8 000 m³<br/>
                  Conditions normales
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => loadDemoScenario('vosges')}
                className="h-auto flex-col items-start p-6 hover:bg-[#14532d]/5 hover:border-[#14532d]"
              >
                <div className="font-semibold text-lg mb-2">⛰️ Vosges</div>
                <div className="text-sm text-muted-foreground text-left">
                  Montagne • 15 000 m³<br/>
                  Terrain difficile
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => loadDemoScenario('bretagne')}
                className="h-auto flex-col items-start p-6 hover:bg-[#14532d]/5 hover:border-[#14532d]"
              >
                <div className="font-semibold text-lg mb-2">🌧️ Bretagne</div>
                <div className="text-sm text-muted-foreground text-left">
                  Sol humide • 3 000 m³<br/>
                  Chantier à risque
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Location */}
      {currentStep === 'location' && (
        <>
          <LocationPicker location={location} onLocationChange={setLocation} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCurrentStep('scenarios')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => setCurrentStep('autodata')} className="bg-[#14532d] hover:bg-[#14532d]/90">
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Step: Auto Data */}
      {currentStep === 'autodata' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-[#14532d]" />
                Données environnementales
              </CardTitle>
              <CardDescription>
                Récupération automatique des données météo, sol et terrain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!autoData && (
                <Button
                  onClick={handleFetchAutoData}
                  disabled={isLoadingAutoData}
                  size="lg"
                  className="w-full bg-[#14532d] hover:bg-[#14532d]/90"
                >
                  {isLoadingAutoData ? 'Récupération en cours...' : 'Récupérer les données'}
                </Button>
              )}
              <AutoDataDisplay autoData={autoData} isLoading={isLoadingAutoData} />
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('location')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            {autoData && (
              <Button onClick={() => setCurrentStep('info')} className="bg-[#14532d] hover:bg-[#14532d]/90">
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Step: Info */}
      {currentStep === 'info' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#14532d]" />
                Informations du chantier
              </CardTitle>
              <CardDescription>
                Renseignez les détails commerciaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du chantier</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
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
                      <SelectItem value="tache">💰 À la tâche</SelectItem>
                      <SelectItem value="heure">⏰ À l'heure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prixCat">Prix facturé estimé</Label>
                  <Select
                    value={formData.prixFacture}
                    onValueChange={(value) => setFormData({ ...formData, prixFacture: value })}
                  >
                    <SelectTrigger id="prixCat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15000">💶 Petit (~15k €)</SelectItem>
                      <SelectItem value="30000">💶💶 Moyen (~30k €)</SelectItem>
                      <SelectItem value="100000">💶💶💶 Grand (~100k €)</SelectItem>
                      <SelectItem value="500000">💶💶💶💶 Très grand (~500k €)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="volume">Volume de bois estimé</Label>
                <Select
                  value={formData.volume}
                  onValueChange={(value) => setFormData({ ...formData, volume: value })}
                >
                  <SelectTrigger id="volume">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000">🪵 Petit (2-4k m³)</SelectItem>
                    <SelectItem value="8000">🪵🪵 Moyen (6-10k m³)</SelectItem>
                    <SelectItem value="15000">🪵🪵🪵 Grand (12-18k m³)</SelectItem>
                    <SelectItem value="25000">🪵🪵🪵🪵 Très grand (20k+ m³)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('autodata')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => setCurrentStep('terrain')} className="bg-[#14532d] hover:bg-[#14532d]/90">
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Step: Terrain */}
      {currentStep === 'terrain' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-[#14532d]" />
                Conditions du terrain
              </CardTitle>
              <CardDescription>
                Paramètres influençant le temps de travail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distanceTransport">Distance jusqu'au chantier</Label>
                  <Select
                    value={formData.distanceTransport}
                    onValueChange={(value) => setFormData({ ...formData, distanceTransport: value })}
                  >
                    <SelectTrigger id="distanceTransport">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">🚗 Proche (~50 km)</SelectItem>
                      <SelectItem value="100">🚗🚗 Moyen (~100 km)</SelectItem>
                      <SelectItem value="200">🚗🚗🚗 Loin (~200 km)</SelectItem>
                      <SelectItem value="500">🚗🚗🚗🚗 Très loin (~500 km)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="distanceDebardage">Distance de débardage</Label>
                  <Select
                    value={formData.distanceDebardage}
                    onValueChange={(value) => setFormData({ ...formData, distanceDebardage: value })}
                  >
                    <SelectTrigger id="distanceDebardage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80">🌲 Court (&lt; 100m)</SelectItem>
                      <SelectItem value="150">🌲🌲 Moyen (100-200m)</SelectItem>
                      <SelectItem value="250">🌲🌲🌲 Long (200-300m)</SelectItem>
                      <SelectItem value="400">🌲🌲🌲🌲 Très long (300m+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dispersion">Répartition des arbres</Label>
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
                    <SelectItem value="groupes">🟢 Groupés (temps normal)</SelectItem>
                    <SelectItem value="moyen">🟡 Dispersés (+20% temps)</SelectItem>
                    <SelectItem value="eparpilles">🔴 Éparpillés (+50% temps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="densite">Densité d'arbres</Label>
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
                      <SelectItem value="faible">🟢 Faible (-10% temps)</SelectItem>
                      <SelectItem value="moyenne">🟡 Moyenne (normal)</SelectItem>
                      <SelectItem value="forte">🔴 Forte (+25% temps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vegetation">Temps depuis abattage</Label>
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
                      <SelectItem value="recent">🟢 Récent (&lt; 2 mois)</SelectItem>
                      <SelectItem value="moyen">🟡 Moyen (+15% temps)</SelectItem>
                      <SelectItem value="ancien">🔴 Ancien (+35% temps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full bg-[#14532d] hover:bg-[#14532d]/90"
              >
                Calculer la rentabilité
              </Button>
            </CardContent>
          </Card>
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setCurrentStep('info')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </>
      )}

      {/* Step: Results */}
      {currentStep === 'results' && results && (
        <>
          <ResultsDisplay
            results={results}
            prixFacture={parseFloat(formData.prixFacture) || 0}
            typeFacturation={formData.type}
          />
          <div className="flex justify-center gap-4 mt-6">
            <Button size="lg" className="bg-[#14532d] hover:bg-[#14532d]/90">
              Proposer un devis
            </Button>
            <Button size="lg" variant="outline" className="border-[#14532d] text-[#14532d] hover:bg-[#14532d]/10">
              Contacter des associés
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep('scenarios')} size="lg">
              Nouveau chantier
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
