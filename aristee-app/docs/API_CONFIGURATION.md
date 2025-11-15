# Configuration des APIs - Aristée

## ✅ Résumé des APIs utilisées

| API | Fonction | Limite | Clé API | Statut |
|-----|----------|--------|---------|--------|
| **Open-Meteo** | Météo 7 jours | 10,000/jour | ❌ Non | ✅ Fonctionnel |
| **SoilGrids 2.0** | Texture sol (250m) | 5/minute | ❌ Non | ✅ Fonctionnel |
| **Open-Elevation** | Altitude & pente | Pas de limite | ❌ Non | ✅ Fonctionnel |
| **Nominatim** | Géocodage | 1/seconde | ❌ Non | ✅ Fonctionnel |

**Tests effectués** : 16/16 réussis (100%)
**Date du dernier test** : 2025-11-15

---

## 📊 Détails des APIs

### 1. Open-Meteo API - Météo ⭐

**Endpoint** : `https://api.open-meteo.com/v1/forecast`

**Données récupérées** :
- Prévisions météo 7 jours
- Probabilité de précipitations (%)
- Accumulation de pluie (mm)
- Température (°C)
- Codes météo (ensoleillé, nuageux, pluie, etc.)

**Paramètres utilisés** :
```
?latitude={lat}&longitude={lon}
&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,weathercode
&timezone=Europe/Paris
```

**Performances** :
- Temps de réponse moyen : **135ms**
- Limite gratuite : **10,000 appels/jour**
- Clé API : ❌ Non requise

**Documentation** : https://open-meteo.com/en/docs

---

### 2. SoilGrids 2.0 API - Sol 🌍

**Endpoint** : `https://rest.isric.org/soilgrids/v2.0/properties/query`

**Données récupérées** :
- % Argile (clay)
- % Sable (sand)
- % Limon (silt)
- Drainage calculé (excellent, bon, moyen, faible)
- Sensibilité aux ornières (faible, moyenne, élevée)

**Paramètres utilisés** :
```
?lat={lat}&lon={lon}
&property=clay&property=sand&property=silt
&depth=0-5cm
```

**Performances** :
- Temps de réponse moyen : **1,232ms**
- Limite : **5 appels/minute** ⚠️ (restrictif)
- Clé API : ❌ Non requise
- Statut : Beta (pas de garantie de disponibilité)

**Recommandations** :
- ✅ Implémenter un cache (24h minimum)
- ✅ Prévoir un fallback avec saisie manuelle
- ⚠️ Respecter strictement la limite de 5/minute

**Documentation** : https://rest.isric.org/soilgrids/v2.0/docs

---

### 3. Open-Elevation API - Altitude ⛰️

**Endpoint** : `https://api.open-elevation.com/api/v1/lookup`

**Données récupérées** :
- Altitude (m)
- Pente estimée (%)
- Difficulté du terrain (facile, moyen, difficile)

**Format de requête** :
```json
POST https://api.open-elevation.com/api/v1/lookup
Body: {
  "locations": [
    {"latitude": 48.85, "longitude": 2.35}
  ]
}
```

**Performances** :
- Temps de réponse moyen : **106ms**
- Limite : Pas de limite stricte
- Clé API : ❌ Non requise

**Alternative recommandée** :
- **Open Topo Data** (plus fiable) : `https://api.opentopodata.org/v1/eudem25m`
- Résolution : 25m pour Europe, 30m global
- Dataset : EU-DEM (Europe) ou ASTER (global)

**Documentation** : https://open-elevation.com/

---

### 4. Nominatim API - Géocodage 📍

**Endpoint** : `https://nominatim.openstreetmap.org/reverse`

**Données récupérées** :
- Adresse lisible depuis coordonnées GPS
- Ville, département, région

**Paramètres utilisés** :
```
?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1
```

**Headers requis** :
```javascript
{
  'User-Agent': 'AristeeApp/1.0'
}
```

**Performances** :
- Temps de réponse moyen : **208ms**
- Limite : **1 requête/seconde** ⚠️ (strict)
- Clé API : ❌ Non requise
- User-Agent : ✅ **Obligatoire**

**Recommandations** :
- ⚠️ Respecter strictement la limite de 1/seconde
- ✅ Toujours fournir un User-Agent personnalisé
- ✅ Implémenter un cache pour les adresses

**Documentation** : https://nominatim.org/release-docs/latest/api/Overview/

---

## 🧪 Tests effectués

### Scénarios testés

#### ✅ Scénario 1 : Sologne (idéal)
- **Coordonnées** : 47.6189, 1.8572
- **Sol** : 52.4% sable → Drainage **bon**
- **Météo** : 9.6mm pluie sur 7j
- **Altitude** : 123m → Pente **5.3%** (facile)
- **Résultat** : 4/4 APIs fonctionnelles

#### ✅ Scénario 2 : Vosges (difficile)
- **Coordonnées** : 48.0686, 6.8694
- **Sol** : 40% sable, 40% limon → Drainage **bon**
- **Météo** : 33mm pluie sur 7j ⚠️ (risque élevé)
- **Altitude** : 674m → Pente **19.7%** (difficile)
- **Résultat** : 4/4 APIs fonctionnelles

#### ✅ Scénario 3 : Bretagne (risque)
- **Coordonnées** : 48.2020, -2.9326
- **Sol** : 51.2% limon → Drainage **bon**
- **Météo** : 2.9mm pluie sur 7j
- **Altitude** : 166m → Pente **8.6%** (moyen)
- **Résultat** : 4/4 APIs fonctionnelles

#### ✅ Scénario 4 : Landes (moyen)
- **Coordonnées** : 44.0167, -0.7167
- **Sol** : 52.4% sable → Drainage **bon**
- **Météo** : 23.8mm pluie sur 7j
- **Altitude** : 93m → Pente **3.8%** (facile)
- **Résultat** : 4/4 APIs fonctionnelles

---

## ⚙️ Implémentation dans le code

### Structure des services

```
lib/api/
├── weatherService.ts      # Open-Meteo
├── soilService.ts         # SoilGrids
├── elevationService.ts    # Open-Elevation
└── geocodingService.ts    # Nominatim
```

### Utilisation

```typescript
import { fetchWeather } from '@/lib/api/weatherService';
import { fetchSoil } from '@/lib/api/soilService';
import { fetchElevation } from '@/lib/api/elevationService';
import { reverseGeocode } from '@/lib/api/geocodingService';

// Récupérer toutes les données pour un chantier
const latitude = 47.6189;
const longitude = 1.8572;

const [weather, soil, elevation, address] = await Promise.all([
  fetchWeather(latitude, longitude),
  fetchSoil(latitude, longitude),
  fetchElevation(latitude, longitude, 150), // 150m = distance débardage
  reverseGeocode(latitude, longitude),
]);
```

### Gestion des erreurs

Tous les services ont un système de fallback :
- En cas d'erreur API, des valeurs par défaut sont retournées
- Les erreurs sont loggées dans la console
- L'application continue de fonctionner en mode dégradé

---

## 🚀 Recommandations pour la production

### Priorité 1 : Cache
- ✅ Implémenter un cache pour SoilGrids (24h minimum)
- ✅ Cache pour Nominatim (permanent)
- ✅ Cache pour Elevation (permanent - l'altitude ne change pas)
- ⚠️ Pas de cache pour Open-Meteo (données météo changent)

### Priorité 2 : Rate Limiting
- ⚠️ SoilGrids : Max 5 appels/minute
- ⚠️ Nominatim : Max 1 appel/seconde
- ✅ Implémenter un système de queue pour respecter les limites

### Priorité 3 : Monitoring
- 📊 Logger les temps de réponse
- 📊 Compter les erreurs par API
- 📊 Alertes si taux d'erreur > 10%

### Priorité 4 : Fallbacks
- ✅ Permettre saisie manuelle des données sol si API fail
- ✅ Valeurs par défaut pour élévation
- ⚠️ Météo : critique, prévoir API de secours

---

## 📝 Notes importantes

### SoilGrids (⚠️ Limitations)
- API en **beta** : pas de garantie de disponibilité
- Limite très restrictive : **5 appels/minute**
- **Solution** : Cache + fallback saisie manuelle

### Nominatim (⚠️ User-Agent obligatoire)
- **Obligatoire** : Fournir un User-Agent personnalisé
- Format recommandé : `"AristeeApp/1.0 (contact@email.com)"`
- Limite stricte : **1 requête/seconde**

### Open-Meteo (✅ Meilleur choix)
- **Très fiable** : 10,000 appels/jour gratuits
- Pas de clé API nécessaire
- Temps de réponse excellent (< 200ms)
- **Recommandé pour la production**

---

## 🧪 Lancer les tests

```bash
# Installer tsx si nécessaire
npm install --save-dev tsx

# Lancer les tests des APIs
npx tsx scripts/test-apis.ts
```

Le script teste les 4 APIs avec 4 scénarios réels (16 tests au total).

---

**Dernière mise à jour** : 2025-11-15
**Version** : 1.0
**Auteur** : Équipe Aristée
