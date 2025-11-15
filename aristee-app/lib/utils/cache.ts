/**
 * Simple in-memory cache avec TTL (Time To Live)
 * Pour production, utiliser Redis ou similaire
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  /**
   * Génère une clé de cache depuis les coordonnées
   */
  private generateKey(lat: number, lon: number, prefix: string): string {
    // Arrondir à 4 décimales pour éviter des clés légèrement différentes
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;
    return `${prefix}:${roundedLat}:${roundedLon}`;
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(lat: number, lon: number, prefix: string): T | null {
    const key = this.generateKey(lat, lon, prefix);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Vérifier si l'entrée a expiré
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(lat: number, lon: number, prefix: string, data: T, ttl: number): void {
    const key = this.generateKey(lat, lon, prefix);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Supprime une entrée du cache
   */
  delete(lat: number, lon: number, prefix: string): void {
    const key = this.generateKey(lat, lon, prefix);
    this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(1) + '%',
    };
  }
}

// Instance singleton du cache
export const apiCache = new SimpleCache();

// Nettoyage automatique toutes les heures
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 60 * 60 * 1000); // 1 heure
}

// TTL par défaut pour chaque type d'API
export const CACHE_TTL = {
  WEATHER: 30 * 60 * 1000,        // 30 minutes (météo change)
  SOIL: 24 * 60 * 60 * 1000,      // 24 heures (sol ne change pas souvent)
  ELEVATION: 365 * 24 * 60 * 60 * 1000, // 1 an (altitude ne change jamais)
  GEOCODING: 30 * 24 * 60 * 60 * 1000,  // 30 jours (adresses stables)
};

/**
 * Helper pour utiliser le cache avec une fonction async
 */
export async function withCache<T>(
  lat: number,
  lon: number,
  prefix: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Vérifier le cache d'abord
  const cached = apiCache.get<T>(lat, lon, prefix);
  if (cached !== null) {
    return cached;
  }

  // Si pas en cache, appeler l'API
  const data = await fetchFn();

  // Stocker dans le cache
  apiCache.set(lat, lon, prefix, data, ttl);

  return data;
}
