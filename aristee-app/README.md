# 🌲 Aristée - Estimation intelligente de chantiers forestiers

Application web MVP développée pour le hackathon, permettant d'estimer automatiquement la rentabilité des chantiers de débardage forestier.

## 🎯 Fonctionnalités

### Récupération automatique de données via APIs
- **Météo** (Open-Meteo) : prévisions à 7 jours, probabilité de pluie
- **Type de sol** (SoilGrids) : texture, drainage, sensibilité aux ornières
- **Relief** (Open-Elevation) : altitude, pente estimée
- **Géolocalisation** (Nominatim) : adresse depuis coordonnées GPS

### Calculs automatiques
- **Temps de débardage** : estimation basée sur volume, distance, terrain, météo
- **Coûts détaillés** : transport, carburant, machine, main d'œuvre
- **Score de risque** (0-100) : analyse multi-facteurs avec alertes
- **Marge prévisionnelle** : calcul automatique avec recommandation GO/NO-GO

### Interface utilisateur
- Carte interactive Leaflet pour sélection GPS
- Formulaire simplifié (remplissage en < 5 min)
- Affichage des données récupérées en temps réel
- Recommandations intelligentes contextuelles
- Design moderne avec shadcn/ui

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# Build pour production
npm run build
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📋 Utilisation

### 1. Sélectionner la localisation
- Cliquez sur la carte ou entrez les coordonnées GPS
- L'adresse est récupérée automatiquement

### 2. Récupérer les données automatiques
- Cliquez sur "🔄 Récupérer les données automatiquement"
- Les APIs sont interrogées en parallèle (météo, sol, relief)
- Les données s'affichent avec des alertes si nécessaire

### 3. Remplir le formulaire (catégories rapides)
- Nom du chantier, client
- Type de facturation (à la tâche / à l'heure)
- **Prix facturé** : Choisir parmi 4 fourchettes (petit/moyen/grand/très grand)
- **Volume de bois** : 4 catégories (20-30 m³ / 35-55 m³ / 60-90 m³ / 100+ m³)
- **Distance transport** : 4 niveaux (très proche / proche / moyen / loin)
- **Distance débardage** : 4 niveaux (court / moyen / long / très long)
- **Répartition des arbres** : Groupés / Moyens / Éparpillés

**💡 Gain de temps** : Plus besoin de chiffres précis, juste des catégories visuelles !

### 4. Calculer la rentabilité
- Cliquez sur "🚀 Calculer la rentabilité"
- Les résultats s'affichent instantanément :
  - Temps estimé, coût total, marge
  - Score de risque avec détails
  - Recommandation intelligente
  - Décision : ACCEPTER / REFUSER / ACCEPTER AVEC CONDITIONS

## 🗺️ Scénarios de démo

### 1. Chantier idéal (Sologne)
```
GPS: 47.6189, 1.8572
Volume: 50 m³
Prix: 3000€
Résultat attendu: Marge ~35%, Risque faible
```

### 2. Chantier difficile (Vosges)
```
GPS: 48.0686, 6.8694
Volume: 40 m³
Prix: 2200€
Résultat attendu: Marge ~8%, Risque élevé → REFUSER
```

### 3. Chantier à risque (Bretagne)
```
GPS: 48.2020, -2.9326
Volume: 45 m³
Prix: 2600€
Résultat attendu: Marge ~18%, Risque moyen → REPORTER
```

## 🏗️ Architecture

```
aristee-app/
├── app/
│   ├── page.tsx              # Page principale
│   └── globals.css           # Styles globaux
├── components/
│   ├── ui/                   # Composants shadcn/ui
│   └── chantier/
│       ├── ChantierForm.tsx          # Formulaire principal
│       ├── LocationPicker.tsx        # Sélecteur GPS + carte
│       ├── Map.tsx                   # Carte Leaflet
│       ├── AutoDataDisplay.tsx       # Affichage données APIs
│       └── ResultsDisplay.tsx        # Affichage résultats
├── lib/
│   ├── api/
│   │   ├── weatherService.ts         # Open-Meteo
│   │   ├── soilService.ts            # SoilGrids
│   │   ├── elevationService.ts       # Open-Elevation
│   │   └── geocodingService.ts       # Nominatim
│   ├── calculators/
│   │   ├── timeEstimator.ts          # Calcul temps
│   │   ├── costCalculator.ts         # Calcul coûts
│   │   ├── riskScorer.ts             # Calcul risque
│   │   └── marginCalculator.ts       # Calcul marge + reco
│   ├── constants/
│   │   ├── machineRates.ts           # Coûts machine/MO
│   │   └── terrainCoefficients.ts    # Coefficients terrain
│   └── types/
│       └── *.ts                      # Types TypeScript
```

## 🔧 Technologies

- **Frontend** : Next.js 15 + React 19 + TypeScript
- **UI** : shadcn/ui + Tailwind CSS
- **Carte** : Leaflet + React-Leaflet
- **APIs** : Open-Meteo, SoilGrids, Open-Elevation, Nominatim
- **Validation** : Zod + React Hook Form

## 📊 APIs utilisées (toutes gratuites)

| API | Usage | Limites |
|-----|-------|---------|
| Open-Meteo | Prévisions météo 7j | Illimité, sans clé |
| SoilGrids | Données pédologiques | Raisonnable |
| Open-Elevation | Altitude/dénivelé | 1 req/sec |
| Nominatim | Géocodage | 1 req/sec + User-Agent |

## 🚧 Améliorations futures

### Court terme
- Cache des réponses API (1h)
- Export PDF des estimations
- Sauvegarde locale (localStorage)
- Mode comparaison (plusieurs dates)

### Moyen terme
- Backend Next.js + base de données
- Historique des chantiers
- Statistiques et analytics
- Notifications météo

### Long terme
- Application mobile (React Native)
- IA prédictive (ML sur historique)
- Module abattage
- Réseau collaboratif

## 📝 Licence

MVP Hackathon - 2025
