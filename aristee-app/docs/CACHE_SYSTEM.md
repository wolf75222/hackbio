# Système de Cache - Aristée

## 🎯 Pourquoi un cache ?

Le système de cache a été implémenté pour :

1. **Respecter les limites des APIs gratuites**
   - SoilGrids : seulement **5 requêtes/minute** ⚠️
   - Nominatim : **1 requête/seconde** maximum

2. **Améliorer les performances**
   - Réduction du temps de réponse de **1800ms → 0ms** (instantané)
   - Pas de latence réseau pour les données déjà récupérées

3. **Économiser de la bande passante**
   - Données qui ne changent pas (élévation, adresses) stockées localement
   - Météo rafraîchie uniquement toutes les 30 minutes

---

## 📊 Résultats des tests

### Performance mesurée

```
⏱️  Sans cache: 1,794ms
⚡ Avec cache:  0ms (instantané)
🚀 Gain:        ∞% plus rapide
```

### Statistiques après tests

```
💾 Entrées en cache: 4
✅ Hits: 5
❌ Misses: 4
📈 Taux de hit: 55.6%
```

---

## ⚙️ Configuration du cache

### TTL (Time To Live) par API

| API | TTL | Raison |
|-----|-----|--------|
| **Open-Meteo** | 30 minutes | Prévisions météo changent fréquemment |
| **SoilGrids** | 24 heures | Sol stable, limite API stricte (5/min) |
| **Open-Elevation** | 1 an | Altitude ne change **jamais** |
| **Nominatim** | 30 jours | Adresses rarement modifiées |

### Fichier de configuration

[lib/utils/cache.ts](../lib/utils/cache.ts)

```typescript
export const CACHE_TTL = {
  WEATHER: 30 * 60 * 1000,              // 30 minutes
  SOIL: 24 * 60 * 60 * 1000,            // 24 heures
  ELEVATION: 365 * 24 * 60 * 60 * 1000, // 1 an
  GEOCODING: 30 * 24 * 60 * 60 * 1000,  // 30 jours
};
```

---

## 🔧 Utilisation

### Dans le code

Le cache est automatiquement utilisé par tous les services API :

```typescript
import { fetchWeather } from '@/lib/api/weatherService';
import { fetchSoil } from '@/lib/api/soilService';

// Premier appel : requête API réelle (1800ms)
const weather = await fetchWeather(47.6189, 1.8572);

// Deuxième appel avec mêmes coordonnées : cache (0ms)
const weatherAgain = await fetchWeather(47.6189, 1.8572);
```

### Arrondi des coordonnées

Les coordonnées sont arrondies à **4 décimales** pour regrouper les positions proches :

```typescript
// Ces deux coordonnées utilisent la même entrée de cache
fetchSoil(47.6189, 1.8572);
fetchSoil(47.61891, 1.85721); // Arrondi → 47.6189, 1.8572
```

**Précision** : 4 décimales ≈ 11 mètres de précision (largement suffisant pour des parcelles forestières)

---

## 🎮 Interface de monitoring (Mode Dev)

### Composant CacheStats

Un composant de debug permet de visualiser les performances du cache en temps réel :

[components/debug/CacheStats.tsx](../components/debug/CacheStats.tsx)

### Affichage

- **Raccourci clavier** : `Ctrl + Shift + C`
- **Position** : Coin inférieur droit
- **Rafraîchissement** : Automatique toutes les 5 secondes

### Informations affichées

- Nombre d'entrées en cache
- Taux de hit (%)
- Nombre de hits vs misses
- Bouton pour vider le cache
- Bouton pour rafraîchir les stats

---

## 🧪 Tests

### Test de performance

```bash
npx tsx scripts/test-cache.ts
```

Ce script teste :
1. Premier appel sans cache (mesure le temps)
2. Deuxième appel avec cache (mesure le gain)
3. Variations de coordonnées (test de l'arrondi)
4. Affichage des statistiques

### Test complet des APIs

```bash
npx tsx scripts/test-apis.ts
```

Teste les 4 APIs avec 4 scénarios réels (16 tests).

---

## 🏗️ Architecture technique

### Structure du cache

```typescript
interface CacheEntry<T> {
  data: T;              // Données stockées
  timestamp: number;    // Quand elles ont été mises en cache
  ttl: number;          // Durée de vie en ms
}
```

### Clé de cache

```typescript
// Format: "prefix:latitude:longitude"
// Exemple: "soil:47.6189:1.8572"

function generateKey(lat: number, lon: number, prefix: string): string {
  const roundedLat = Math.round(lat * 10000) / 10000; // 4 décimales
  const roundedLon = Math.round(lon * 10000) / 10000;
  return `${prefix}:${roundedLat}:${roundedLon}`;
}
```

### Helper `withCache`

```typescript
export async function withCache<T>(
  lat: number,
  lon: number,
  prefix: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // 1. Vérifier le cache
  const cached = apiCache.get<T>(lat, lon, prefix);
  if (cached !== null) {
    return cached; // Cache hit
  }

  // 2. Sinon, appeler l'API
  const data = await fetchFn();

  // 3. Stocker dans le cache
  apiCache.set(lat, lon, prefix, data, ttl);

  return data;
}
```

---

## 🚀 Production

### Limitations actuelles

Le cache actuel est **en mémoire** (RAM) :
- ✅ Simple et rapide
- ❌ Perdu au redémarrage du serveur
- ❌ Non partagé entre instances

### Recommandations pour la production

#### Option 1 : Redis (Recommandé)

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.set(key, JSON.stringify(data), {
  EX: ttl / 1000 // TTL en secondes
});

const cached = await redis.get(key);
```

**Avantages** :
- Partagé entre instances
- Persiste au redémarrage
- Haute performance
- Gestion automatique du TTL

#### Option 2 : Base de données

Stocker les réponses API dans PostgreSQL/MySQL avec un champ `expires_at`.

**Avantages** :
- Déjà intégré si vous avez une DB
- Historique des données
- Requêtes SQL avancées

**Inconvénients** :
- Plus lent que Redis
- Requiert nettoyage manuel des entrées expirées

#### Option 3 : Next.js Cache (Expérimental)

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedSoil = unstable_cache(
  async (lat: number, lon: number) => {
    return fetchSoilFromAPI(lat, lon);
  },
  ['soil'],
  { revalidate: 86400 } // 24h
);
```

---

## 📈 Métriques à surveiller

### En développement

- Taux de hit du cache (> 50% = bon)
- Temps de réponse moyen
- Nombre d'entrées en cache

### En production

- **Alertes** si taux de hit < 30%
- **Alertes** si limite API dépassée (SoilGrids)
- Logs des erreurs de cache
- Monitoring de la taille du cache

---

## 🐛 Debug

### Afficher les logs du cache

Les services API loggent automatiquement quand ils font un appel réel :

```
🌦️  Appel Open-Meteo API (non caché): { latitude: 47.6189, longitude: 1.8572 }
🌍 Appel SoilGrids API (non caché): { latitude: 47.6189, longitude: 1.8572 }
```

Si vous ne voyez **pas** ces logs, c'est que le cache est utilisé ✅

### Vider le cache manuellement

```typescript
import { apiCache } from '@/lib/utils/cache';

// Vider tout le cache
apiCache.clear();

// Supprimer une entrée spécifique
apiCache.delete(47.6189, 1.8572, 'soil');

// Nettoyer les entrées expirées
apiCache.cleanup();
```

### Stats du cache

```typescript
const stats = apiCache.getStats();
console.log(stats);
// { size: 4, hits: 5, misses: 4, hitRate: '55.6%' }
```

---

## ✅ Checklist avant production

- [ ] Migrer vers Redis ou base de données
- [ ] Configurer les variables d'environnement (`REDIS_URL`)
- [ ] Implémenter le monitoring des métriques
- [ ] Configurer les alertes (rate limits, erreurs)
- [ ] Tester la charge (combien d'entrées max ?)
- [ ] Documenter la stratégie de purge du cache
- [ ] Prévoir un fallback si le cache est indisponible

---

## 📚 Fichiers liés

- [lib/utils/cache.ts](../lib/utils/cache.ts) - Système de cache
- [lib/api/weatherService.ts](../lib/api/weatherService.ts) - Météo avec cache
- [lib/api/soilService.ts](../lib/api/soilService.ts) - Sol avec cache
- [lib/api/elevationService.ts](../lib/api/elevationService.ts) - Élévation avec cache
- [lib/api/geocodingService.ts](../lib/api/geocodingService.ts) - Géocodage avec cache
- [components/debug/CacheStats.tsx](../components/debug/CacheStats.tsx) - Interface de monitoring
- [scripts/test-cache.ts](../scripts/test-cache.ts) - Tests de performance

---

**Dernière mise à jour** : 2025-11-15
**Version** : 1.0
**Auteur** : Équipe Aristée
