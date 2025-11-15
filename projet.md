# Aristée - Logiciel de Gestion de Chantiers Forestiers

## 🎯 Objectif du MVP (Hackathon)

Application web pour les entreprises d'exploitation forestière permettant de calculer rapidement la rentabilité des chantiers de débardage en moins de 5 minutes.

## 📋 Vue d'ensemble

### Concept principal
L'exploitant **saisit les coordonnées GPS du chantier** et quelques informations simples (volume, distance). Le logiciel **récupère automatiquement via des APIs** :
- 🌦️ Les prévisions météorologiques
- 🗺️ Le type de sol et sa sensibilité
- 📐 Le dénivelé et le relief
- ⚠️ Les risques environnementaux selon la période

Et calcule automatiquement :
- ⏱️ Le temps de chantier estimé
- 💰 Le coût total
- 📊 La marge (€ et %)
- ⚠️ Un score de risque environnemental
- 💡 Une recommandation d'acceptation/refus

---

## 🔧 Fonctionnalités MVP

### 0. Géolocalisation et données automatiques

#### Saisie simplifiée
L'utilisateur entre simplement :
- 📍 **Coordonnées GPS du chantier** (ou sélection sur carte)
- 📏 Volume de bois à débarder
- 🚗 Distance de transport depuis le dépôt

#### Récupération automatique via APIs
Le système récupère automatiquement :
- **Météo** (Open-Meteo API) :
  - Prévisions à 7 jours
  - Probabilité de pluie
  - Température et vent
  - Accumulation de précipitations
- **Type de sol** (SoilGrids API) :
  - Texture du sol (argile, sable, limon)
  - Capacité de drainage
  - Sensibilité aux ornières
- **Relief** (Elevation API) :
  - Altitude
  - Pente moyenne
  - Dénivelé
- **Environnement** :
  - Saison actuelle
  - Couverture forestière (OSM)

#### Alertes intelligentes
Le système affiche des alertes contextuelles :
> ⚠️ "Sol argileux détecté : risque d'ornières élevé en cas de pluie"
> 🌧️ "Forte probabilité de pluie dans 3 jours : recommandé de reporter"
> ⛰️ "Pente de 18% détectée : temps de débardage +35%, consommation +25%"

### 1. Gestion des chantiers de débardage

#### Types de facturation
- **À la tâche** : Prix fixé au m³ ou à la tonne
- **À l'heure** : Tarif horaire

#### Calcul des coûts directs
Le logiciel estime automatiquement :
- 🚚 Coût du transport de la machine jusqu'au chantier
- ⛽ Consommation de carburant pendant le débardage
- 🏗️ Temps machine (amortissement + maintenance)
- 👷 Coût de la main-d'œuvre (salaire opérateur + charges + déplacement)

### 2. Estimation du temps de débardage

#### Facteurs pris en compte (automatiques + manuels)
**Volume et logistique :**
- Nombre d'allers-retours nécessaires pour ramener les grumes
- Distance entre zone d'abattage et route forestière
- Dispersion des arbres (groupés = rapide / éparpillés = lent) [manuel]

**Terrain et relief (automatique via APIs) :**
- Pente et dénivelé (Elevation API)
- Type de sol (SoilGrids API)
- État du terrain estimé selon météo récente

**Impact sur les performances :**
- Vitesse de déplacement du porteur (ajustée selon pente)
- Charge utile possible (ajustée selon sol)
- Consommation de carburant (ajustée selon relief + sol)
- Risques d'incidents ou de retard

### 3. Score de risque environnemental (automatique)

#### Critères d'évaluation (via APIs)
- 🌦️ Saison et période de l'année
- ☔ Météo prévue sur 7 jours (probabilité pluie)
- 🌱 Sensibilité du sol (drainage, texture)
- 📐 Pente (risque élevé, temps long, forte consommation)
- 💧 Historique de précipitations (30 derniers jours)

#### Calcul du score
```
Score risque =
  (Risque météo × 0.35) +
  (Risque sol × 0.25) +
  (Risque pente × 0.20) +
  (Risque saison × 0.20)

Bonus risque si combinaisons critiques :
  - Hiver + pluie prévue + sol argileux = +25 points
  - Pente forte + sol humide = +15 points
```

#### Recommandations temporelles
Le système suggère :
- 📅 **Période optimale** : "Recommandé entre mai et septembre"
- ⏰ **Fenêtre météo** : "Fenêtre favorable détectée : 18-22 novembre"
- ⚠️ **Alertes** : "Éviter intervention si pluie dans les 48h précédentes"

### 4. Calcul de marge et recommandation

#### Inputs
- Durée du chantier estimée
- Consommation carburant
- Coûts machine
- Coûts opérateur
- Transport
- Score risque/difficulté

#### Outputs
- 💶 Coût total
- 📈 Marge (€ et %)
- ✅ Rentabilité réelle
- 💬 Recommandation intelligente basée sur données réelles

**Exemple de recommandation enrichie :**
> ⚠️ "Ce chantier présente une marge faible (12%) en raison de :
> - Sol argileux avec faible drainage (SoilGrids)
> - Pluie prévue à 70% dans 4 jours (Open-Meteo)
> - Pente de 15% augmentant le temps de 28%
>
> **Recommandations** :
> - Augmenter le prix de 18% OU
> - Reporter au 25 novembre (fenêtre sèche prévue) OU
> - Refuser le chantier"

---

## 🏗️ Architecture technique

### Stack technologique
- **Frontend** : React + TypeScript
- **UI Components** : shadcn/ui
- **Styling** : Tailwind CSS
- **State Management** : Zustand ou Context API
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts
- **Maps** : Leaflet ou Mapbox GL JS
- **Backend** (optionnel MVP) : Next.js API Routes
- **Database** (optionnel MVP) : Supabase ou SQLite

### APIs externes intégrées

#### 1. Météo - Open-Meteo API
- **URL** : https://api.open-meteo.com/v1/forecast
- **Gratuit** : Oui, sans clé API
- **Données** :
  - Prévisions à 7 jours
  - Température, précipitations, vent
  - Probabilité de pluie horaire
  - Accumulation de pluie
- **Exemple requête** :
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=48.85&longitude=2.35
  &daily=precipitation_sum,precipitation_probability_max
  &timezone=Europe/Paris
```

#### 2. Type de sol - SoilGrids API
- **URL** : https://rest.isric.org/soilgrids/v2.0
- **Gratuit** : Oui
- **Données** :
  - Texture du sol (% argile, sable, limon)
  - Capacité de rétention d'eau
  - Densité du sol
- **Exemple requête** :
```
GET https://rest.isric.org/soilgrids/v2.0/properties/query
  ?lat=48.85&lon=2.35
  &property=clay&property=sand&property=bdod
  &depth=0-5cm
```

#### 3. Dénivelé - Open-Elevation API
- **URL** : https://api.open-elevation.com/api/v1/lookup
- **Gratuit** : Oui
- **Données** :
  - Altitude en mètres
  - Calcul de pente entre points
- **Exemple requête** :
```
POST https://api.open-elevation.com/api/v1/lookup
Body: {"locations": [{"latitude": 48.85, "longitude": 2.35}]}
```

#### 4. Géocodage - Nominatim (OpenStreetMap)
- **URL** : https://nominatim.openstreetmap.org
- **Gratuit** : Oui (avec usage raisonnable)
- **Données** :
  - Reverse geocoding (adresse depuis coordonnées)
  - Informations sur la zone (forêt, type de terrain)
- **Exemple requête** :
```
GET https://nominatim.openstreetmap.org/reverse
  ?lat=48.85&lon=2.35&format=json
```

### Structure des composants

```
src/
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── chantier/
│   │   ├── ChantierForm.tsx           # Formulaire principal
│   │   ├── LocationPicker.tsx         # Sélecteur carte + GPS
│   │   ├── AutoDataDisplay.tsx        # Affichage données APIs
│   │   ├── WeatherForecast.tsx        # Prévisions météo
│   │   ├── SoilInfo.tsx               # Infos sol
│   │   ├── TerrainInfo.tsx            # Infos terrain/relief
│   │   ├── CostCalculator.tsx         # Calculateur de coûts
│   │   ├── TimeEstimator.tsx          # Estimateur de temps
│   │   ├── RiskScore.tsx              # Score de risque
│   │   ├── MarginDisplay.tsx          # Affichage marge
│   │   └── RecommendationCard.tsx     # Carte recommandation
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── api/
│   │   ├── weatherService.ts          # Service Open-Meteo
│   │   ├── soilService.ts             # Service SoilGrids
│   │   ├── elevationService.ts        # Service Open-Elevation
│   │   └── geocodingService.ts        # Service Nominatim
│   ├── calculators/
│   │   ├── costCalculator.ts          # Logique calcul coûts
│   │   ├── timeEstimator.ts           # Logique estimation temps
│   │   ├── riskScorer.ts              # Logique score risque
│   │   └── marginCalculator.ts        # Logique calcul marge
│   ├── constants/
│   │   ├── terrainTypes.ts            # Types de terrain
│   │   ├── fuelRates.ts               # Taux consommation
│   │   ├── machineRates.ts            # Coûts machine
│   │   └── soilCoefficients.ts        # Coefficients selon type sol
│   └── types/
│       ├── chantier.ts                # Types TypeScript
│       ├── weather.ts                 # Types météo
│       ├── soil.ts                    # Types sol
│       └── location.ts                # Types géolocalisation
└── pages/
    ├── index.tsx                      # Dashboard
    └── nouveau-chantier.tsx           # Création chantier
```

---

## 📊 Modèle de données

### Chantier (enrichi avec données APIs)
```typescript
interface Chantier {
  id: string;
  name: string;
  type: 'tache' | 'heure';

  // Informations client
  client: string;
  prixFacture: number; // Prix vendu au client

  // Localisation (NOUVEAU)
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    altitude?: number;
  };

  // Volume et distance
  volume: number; // m³ ou tonnes
  distanceTransport: number; // km jusqu'au chantier
  distanceDebardage: number; // mètres entre abattage et route

  // Terrain (manuel)
  dispersionArbres: 'groupes' | 'moyen' | 'eparpilles';

  // Données automatiques (APIs)
  autoData: {
    // Météo (Open-Meteo)
    weather: {
      forecast: WeatherForecast[];
      precipitationProbability: number; // %
      rainAccumulation7d: number; // mm
      currentTemp: number; // °C
    };
    // Sol (SoilGrids)
    soil: {
      clayContent: number; // %
      sandContent: number; // %
      drainage: 'excellent' | 'bon' | 'moyen' | 'faible';
      sensitivity: 'faible' | 'moyenne' | 'elevee';
    };
    // Relief (Elevation API)
    terrain: {
      altitude: number; // m
      slope: number; // %
      difficulty: 'facile' | 'moyen' | 'difficile';
    };
    // Environnement
    season: 'printemps' | 'ete' | 'automne' | 'hiver';
    retrievedAt: Date;
  };

  // Résultats calculés
  tempsEstime: number; // heures
  coutTotal: number; // €
  marge: number; // €
  margePercent: number; // %
  scoreRisque: number; // 0-100
  riskFactors: string[]; // ["Pluie prévue", "Sol argileux", ...]
  recommendation: string;
  optimalPeriod?: string; // "mai-septembre"

  createdAt: Date;
  updatedAt: Date;
}

interface WeatherForecast {
  date: string;
  precipitationProbability: number; // %
  precipitation: number; // mm
  temp: number; // °C
}
```

### Paramètres de calcul (configuration)
```typescript
interface ConfigCouts {
  // Machine
  coutMachineHeure: number; // €/h (amortissement + maintenance)
  consommationBase: number; // L/h
  prixCarburant: number; // €/L

  // Transport
  coutTransportKm: number; // €/km

  // Main d'œuvre
  salaireOperateur: number; // €/h
  chargesSociales: number; // %
  fraisDeplacement: number; // €/jour

  // Performance
  vitesseMoyennePorteur: number; // km/h
  chargeUtileMoyenne: number; // m³
  tempsChargementDechargement: number; // minutes

  // Coefficients terrain (appliqués selon données APIs)
  coefficientsSol: {
    drainage_excellent: 1.0;
    drainage_bon: 1.1;
    drainage_moyen: 1.25;
    drainage_faible: 1.5;
  };
  coefficientsPente: {
    pente_0_5: 1.0;
    pente_5_10: 1.15;
    pente_10_15: 1.3;
    pente_15_plus: 1.5;
  };
}
```

---

## 🧮 Algorithmes de calcul (enrichis avec données APIs)

### 1. Récupération et analyse des données géographiques

```typescript
async function fetchLocationData(lat: number, lon: number) {
  // Parallélisation des appels API
  const [weather, soil, elevation] = await Promise.all([
    fetchWeather(lat, lon),
    fetchSoil(lat, lon),
    fetchElevation(lat, lon)
  ]);

  // Calcul de la pente
  const slope = calculateSlope(elevation, distanceDebardage);

  // Détermination du drainage selon texture sol
  const drainage = calculateDrainage(soil.clay, soil.sand);

  // Analyse du risque météo
  const weatherRisk = analyzeWeatherRisk(weather.forecast);

  return {
    weather: {
      forecast: weather.daily,
      precipitationProbability: weather.maxPrecipProb,
      rainAccumulation7d: weather.totalRain,
    },
    soil: {
      clayContent: soil.clay,
      sandContent: soil.sand,
      drainage,
      sensitivity: soil.clay > 35 ? 'elevee' : 'moyenne',
    },
    terrain: {
      altitude: elevation,
      slope,
      difficulty: slope > 15 ? 'difficile' : slope > 8 ? 'moyen' : 'facile',
    },
  };
}
```

### 2. Estimation du temps (avec coefficients automatiques)

```
Temps total = (Nombre d'allers-retours × Temps par cycle) + Temps de setup

Temps par cycle =
  (Distance débardage × 2 / Vitesse ajustée) +
  Temps chargement/déchargement

Vitesse ajustée = Vitesse base ×
  Coefficient sol (selon drainage API) ×
  Coefficient pente (selon elevation API) ×
  Coefficient météo (selon prévisions)

Coefficient météo =
  if (pluie prévue dans 3 jours) → 0.85
  if (pluie forte prévue) → 0.70
  if (sol sensible + pluie) → 0.60

Nombre d'allers-retours =
  Volume total / (Charge utile × Coefficient sol)
```

### 3. Calcul du score de risque (basé sur données réelles)

```
Score risque =
  (Score météo × 0.35) +
  (Score sol × 0.25) +
  (Score pente × 0.20) +
  (Score saison × 0.20)

Score météo (0-100) =
  Probabilité pluie 7j × 0.6 +
  Accumulation pluie 30j derniers × 0.4

Score sol (0-100) =
  if (drainage faible) → 80
  if (drainage moyen + argile > 30%) → 60
  if (drainage bon) → 30

Score pente (0-100) =
  (Pente / 20) × 100  (plafonné à 100)

Bonus combinatoire :
  - Hiver + pluie prévue > 50% + argile > 30% → +25
  - Pente > 12% + drainage faible → +20
  - Pluie dans 48h + sol sensible → +15
```

### 4. Génération de recommandation intelligente

```typescript
function generateRecommendation(chantier: Chantier): string {
  const risks = [];
  const suggestions = [];

  // Analyse météo
  if (chantier.autoData.weather.precipitationProbability > 60) {
    risks.push("Forte probabilité de pluie (${prob}%)");
    suggestions.push("Reporter de 5-7 jours");
  }

  // Analyse sol
  if (chantier.autoData.soil.drainage === 'faible') {
    risks.push("Sol à faible drainage (ornières probables)");
    if (chantier.autoData.weather.rainAccumulation7d > 20) {
      suggestions.push("Attendre période sèche (2-3 semaines)");
    }
  }

  // Analyse marge
  if (chantier.margePercent < 15) {
    suggestions.push("Augmenter le prix de ${requiredIncrease}%");
  }

  // Fenêtre optimale
  const optimalWindow = findOptimalWeatherWindow(weather.forecast);
  if (optimalWindow) {
    suggestions.push(`Fenêtre favorable détectée : ${optimalWindow}`);
  }

  return formatRecommendation(risks, suggestions, chantier.margePercent);
}
```

---

## 🎨 Interface utilisateur (wireframe enrichi)

### Page : Nouveau Chantier

```
┌──────────────────────────────────────────────────────────────┐
│  Aristée - Nouveau Chantier de Débardage                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📍 Localisation du chantier                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Carte interactive]                                │    │
│  │  • Cliquez sur la carte ou entrez les coordonnées   │    │
│  │                                                      │    │
│  │  Latitude: [48.8566] Longitude: [2.3522]            │    │
│  │  📍 Paris, Île-de-France                            │    │
│  │                                                      │    │
│  │  [Récupérer les données automatiquement] 🔄         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  🤖 Données récupérées automatiquement                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🌦️ Météo (Open-Meteo)        📅 Saison: Automne   │    │
│  │  • Pluie prévue: 35% (3 jours)                      │    │
│  │  • Accumulation 7j: 12mm                            │    │
│  │                                                      │    │
│  │  🗺️ Sol (SoilGrids)                                 │    │
│  │  • Type: Limoneux (25% argile)                      │    │
│  │  • Drainage: Moyen                                  │    │
│  │  ⚠️ Sensibilité aux ornières: Moyenne               │    │
│  │                                                      │    │
│  │  📐 Relief (Elevation API)                          │    │
│  │  • Altitude: 180m                                   │    │
│  │  • Pente estimée: 8%                                │    │
│  │  • Difficulté: Moyenne                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  📋 Informations du chantier                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Nom: [________________]                             │    │
│  │ Client: [________________]                          │    │
│  │ Type: (•) À la tâche  ( ) À l'heure                 │    │
│  │ Prix facturé: [2500] €                              │    │
│  │                                                      │    │
│  │ Volume: [45] m³                                     │    │
│  │ Distance transport: [25] km                         │    │
│  │ Distance débardage: [180] m                         │    │
│  │ Dispersion arbres: [Moyen ▼]                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│              [Calculer la rentabilité] 🚀                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  📊 RÉSULTATS DE L'ANALYSE                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   ⏱️    │ │   💰    │ │   📈    │ │   ⚠️    │           │
│  │  18.2h  │ │ 1,890€  │ │  +24%  │ │  52/100 │           │
│  │  Temps  │ │  Coût   │ │  Marge │ │  Risque │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                               │
│  🌦️ Prévisions météo 7 jours                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Lun  Mar  Mer  Jeu  Ven  Sam  Dim                  │    │
│  │   ☀️   🌤️   🌧️   🌧️   ☁️   ☀️   ☀️                    │    │
│  │  10%  20%  65%  70%  30%  10%  5%                   │    │
│  │  ⚠️ Pluie probable jeudi-vendredi                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  💡 Recommandation intelligente                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⚠️ Chantier réalisable mais avec précautions        │    │
│  │                                                      │    │
│  │ Marge prévisionnelle : 610€ (24%)                   │    │
│  │                                                      │    │
│  │ 🚨 Facteurs de risque identifiés :                  │    │
│  │ • Pluie prévue à 70% dans 4 jours (Open-Meteo)     │    │
│  │ • Sol limoneux avec drainage moyen (SoilGrids)      │    │
│  │ • Pente de 8% : +15% temps, +12% consommation      │    │
│  │                                                      │    │
│  │ ✅ Recommandations :                                │    │
│  │ 1. Intervenir AVANT mercredi (fenêtre sèche)        │    │
│  │ 2. Éviter intervention si pluie dans 48h avant     │    │
│  │ 3. Prévoir protection ornières si nécessaire        │    │
│  │                                                      │    │
│  │ 📅 Période optimale pour ce site :                  │    │
│  │    Mai à Septembre (sol plus sec, risque faible)    │    │
│  │                                                      │    │
│  │ 💰 Détails des coûts :                              │    │
│  │ • Transport: 150€ • Carburant: 480€ (×1.12 pente)  │    │
│  │ • Machine: 730€  • Main d'œuvre: 530€              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│      [Enregistrer le chantier]  [Annuler]  [🔄 Actualiser]  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Plan de développement (Hackathon)

### Phase 1 : Setup (30 min)
- [ ] Initialiser projet Next.js + TypeScript
- [ ] Installer shadcn/ui et Tailwind
- [ ] Installer Leaflet pour la carte
- [ ] Configurer structure de dossiers

### Phase 2 : Services API (1h30)
- [ ] Créer service Open-Meteo (météo)
- [ ] Créer service SoilGrids (sol)
- [ ] Créer service Open-Elevation (dénivelé)
- [ ] Créer service Nominatim (géocodage)
- [ ] Créer types TypeScript pour réponses APIs
- [ ] Tester les appels API

### Phase 3 : Modèle de données et logique (2h)
- [ ] Créer types TypeScript enrichis
- [ ] Implémenter algorithme estimation temps (avec coefficients APIs)
- [ ] Implémenter calcul des coûts
- [ ] Implémenter score de risque (basé sur données réelles)
- [ ] Implémenter calcul de marge
- [ ] Implémenter générateur de recommandations
- [ ] Créer constantes et coefficients (sol, pente, météo)

### Phase 4 : Composants UI (2h30)
- [ ] Composant carte interactive (Leaflet)
- [ ] Composant sélecteur de localisation
- [ ] Affichage données récupérées (météo, sol, relief)
- [ ] Graphique prévisions météo 7 jours
- [ ] Formulaire de saisie chantier (simplifié)
- [ ] Cartes de résultats (temps, coût, marge, risque)
- [ ] Composant recommandation enrichi
- [ ] Layout et navigation

### Phase 5 : Intégration (1h30)
- [ ] Connecter carte à récupération automatique
- [ ] Connecter formulaire aux calculateurs
- [ ] Validation des données (Zod)
- [ ] Gestion des états de chargement (APIs)
- [ ] Gestion des erreurs API
- [ ] Animations et transitions
- [ ] Responsive design

### Phase 6 : Tests et polish (1h)
- [ ] Tester avec différentes localisations
- [ ] Vérifier cohérence des calculs
- [ ] Tester cas limites (pente forte, météo extrême)
- [ ] Optimiser performance (cache API)
- [ ] Préparer données de démo

### Phase 7 : Démo et présentation (30 min)
- [ ] Préparer 3-4 scénarios réels avec coords GPS
- [ ] Préparer pitch
- [ ] Screenshots/vidéo démo

**Temps total : ~9h30**

---

## 📈 Évolutions futures (post-hackathon)

### Court terme
- Cache intelligent des données APIs (éviter appels répétés)
- Export PDF des estimations avec cartes
- Sauvegarde des chantiers (base de données)
- Historique et comparaison
- Notifications si météo change

### Moyen terme
- Intégration météo temps réel avec alertes push
- Machine Learning sur historique pour affiner prédictions
- Application mobile avec GPS automatique
- Alertes proactives ("Votre chantier prévu dans 3j : risque pluie !")
- Comparaison multi-scénarios (différentes dates)

### Long terme
- API France propriétaire de données pédologiques forestières
- Intégration ONF (données parcelles cadastrales)
- Module abattage avec mêmes principes
- Réseau collaboratif (partage d'expériences terrain)
- IA prédictive : "Ce type de chantier prend en moyenne 23h dans ces conditions"

---

## 🎯 Données de démo (avec vraies coordonnées)

### Scénario 1 : Chantier idéal en Sologne
- **GPS** : 47.6189, 1.8572 (Sologne, Loir-et-Cher)
- **Période** : Juillet
- **Attendu** : Sol sableux bien drainé, météo stable, pente faible
- **Résultat** : Marge 38%, risque 25/100, ✅ GO

### Scénario 2 : Chantier difficile dans les Vosges
- **GPS** : 48.0686, 6.8694 (Vosges)
- **Période** : Novembre
- **Attendu** : Pente forte, sol argileux, pluie fréquente
- **Résultat** : Marge 9%, risque 78/100, ⚠️ REFUSER ou AUGMENTER PRIX

### Scénario 3 : Chantier à risque en Bretagne
- **GPS** : 48.2020, -2.9326 (Côtes-d'Armor)
- **Période** : Mars (début printemps)
- **Attendu** : Sol argileux sensible, pluie possible
- **Résultat** : Marge 18%, risque 62/100, ⏸️ REPORTER MAI-JUIN

### Scénario 4 : Chantier moyen dans les Landes
- **GPS** : 44.0167, -0.7167 (Landes)
- **Période** : Septembre
- **Attendu** : Terrain plat, sol sableux, été indien
- **Résultat** : Marge 28%, risque 32/100, ✅ GO

---

## 💡 Points d'attention pour le hackathon

### Priorités absolues
1. **Géolocalisation fonctionnelle** : carte + récupération GPS
2. **APIs opérationnelles** : au moins météo + élévation
3. **Calculs cohérents** : coefficients réalistes basés sur données
4. **UX fluide** : feedback visuel pendant chargement APIs
5. **Démo convaincante** : scénarios réels qui "waouh"

### Gestion des APIs
- **Fallback** : si API fail, proposer saisie manuelle
- **Cache** : stocker réponses 1h (éviter spam)
- **Rate limiting** : respecter limites gratuites
- **Timeout** : max 10s par API, sinon mode dégradé

### Nice-to-have (si temps disponible)
- Graphiques interactifs (précipitations historiques)
- Export PDF avec carte
- Mode comparaison (2 dates différentes)
- Dark mode

---

## 📞 Ressources & Documentation

### APIs utilisées
- **Open-Meteo** : https://open-meteo.com/en/docs
- **SoilGrids** : https://www.isric.org/explore/soilgrids/faq-soilgrids
- **Open-Elevation** : https://open-elevation.com/
- **Nominatim** : https://nominatim.org/release-docs/develop/api/Overview/

### Librairies Frontend
- Leaflet : https://leafletjs.com/
- shadcn/ui : https://ui.shadcn.com
- React Hook Form : https://react-hook-form.com

### Références métier
- Productivité débardage : 15-25 m³/h (terrain normal)
- Impact pente 15% : +30% temps, +25% consommation
- Sol argileux humide : charge utile -40%, vitesse -30%
- Débardage hiver vs été : temps × 1.4 en moyenne

---

**Version** : 2.0 - MVP avec APIs
**Dernière mise à jour** : 2025-11-15
**Auteur** : Équipe Aristée Hackathon
