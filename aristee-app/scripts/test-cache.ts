/**
 * Script de test du système de cache
 * Usage: npx tsx scripts/test-cache.ts
 */

import { fetchWeather } from '../lib/api/weatherService';
import { fetchSoil } from '../lib/api/soilService';
import { fetchElevation } from '../lib/api/elevationService';
import { reverseGeocode } from '../lib/api/geocodingService';
import { apiCache } from '../lib/utils/cache';

const TEST_LOCATION = {
  name: 'Sologne',
  lat: 47.6189,
  lon: 1.8572,
};

async function testCachePerformance() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║              🧪 TEST DU SYSTÈME DE CACHE ARISTÉE                 ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  console.log(`📍 Location de test: ${TEST_LOCATION.name}`);
  console.log(`   Coordonnées: ${TEST_LOCATION.lat}, ${TEST_LOCATION.lon}\n`);

  // Vider le cache pour commencer
  apiCache.clear();
  console.log('🗑️  Cache vidé\n');

  console.log('━'.repeat(75));
  console.log('PHASE 1: Premier appel (sans cache)');
  console.log('━'.repeat(75));

  const start1 = Date.now();

  console.log('\n🌦️  Météo...');
  await fetchWeather(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('🌍 Sol...');
  await fetchSoil(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('⛰️  Élévation...');
  await fetchElevation(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('📍 Géocodage...');
  await reverseGeocode(TEST_LOCATION.lat, TEST_LOCATION.lon);

  const duration1 = Date.now() - start1;

  console.log(`\n✅ Phase 1 terminée en ${duration1}ms`);
  console.log('\n📊 Stats cache après phase 1:');
  console.log(apiCache.getStats());

  console.log('\n━'.repeat(75));
  console.log('PHASE 2: Deuxième appel (avec cache)');
  console.log('━'.repeat(75));

  const start2 = Date.now();

  console.log('\n🌦️  Météo...');
  await fetchWeather(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('🌍 Sol...');
  await fetchSoil(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('⛰️  Élévation...');
  await fetchElevation(TEST_LOCATION.lat, TEST_LOCATION.lon);

  console.log('📍 Géocodage...');
  await reverseGeocode(TEST_LOCATION.lat, TEST_LOCATION.lon);

  const duration2 = Date.now() - start2;

  console.log(`\n✅ Phase 2 terminée en ${duration2}ms`);
  console.log('\n📊 Stats cache après phase 2:');
  console.log(apiCache.getStats());

  console.log('\n━'.repeat(75));
  console.log('RÉSULTATS');
  console.log('━'.repeat(75));

  const speedup = ((duration1 / duration2) - 1) * 100;

  console.log(`\n⏱️  Temps sans cache: ${duration1}ms`);
  console.log(`⚡ Temps avec cache: ${duration2}ms`);
  console.log(`🚀 Gain de performance: ${speedup.toFixed(0)}% plus rapide`);
  console.log(`💾 Entrées en cache: ${apiCache.getStats().size}`);
  console.log(`✅ Taux de hit: ${apiCache.getStats().hitRate}`);

  if (duration2 < duration1 / 10) {
    console.log('\n🎉 EXCELLENT ! Le cache fonctionne parfaitement !');
    console.log('   Les requêtes cachées sont au moins 10x plus rapides.\n');
  } else if (duration2 < duration1 / 2) {
    console.log('\n✅ BIEN ! Le cache améliore les performances.');
    console.log('   Les requêtes cachées sont 2x+ plus rapides.\n');
  } else {
    console.log('\n⚠️  Le cache ne semble pas fonctionner correctement.\n');
  }

  console.log('━'.repeat(75));
  console.log('TEST SUPPLÉMENTAIRE: Variations de coordonnées');
  console.log('━'.repeat(75));

  console.log('\n📍 Test avec coordonnées légèrement différentes...');

  // Coordonnées très proches (devraient avoir la même clé de cache grâce à l'arrondi)
  const nearbyLat = 47.61891; // Différence < 0.0001
  const nearbyLon = 1.85721;

  console.log(`   Original: ${TEST_LOCATION.lat}, ${TEST_LOCATION.lon}`);
  console.log(`   Proche:   ${nearbyLat}, ${nearbyLon}`);

  const startNearby = Date.now();
  await fetchSoil(nearbyLat, nearbyLon);
  const durationNearby = Date.now() - startNearby;

  console.log(`\n⏱️  Temps: ${durationNearby}ms`);

  if (durationNearby < 100) {
    console.log('✅ Cache hit ! Les coordonnées proches utilisent la même entrée de cache.');
  } else {
    console.log('📝 Cache miss - nouvelle entrée créée pour ces coordonnées.');
  }

  console.log('\n📊 Stats finales:');
  console.log(apiCache.getStats());
  console.log('\n');
}

testCachePerformance().catch(console.error);
