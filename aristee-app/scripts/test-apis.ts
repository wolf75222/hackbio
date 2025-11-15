/**
 * Script de test pour vérifier toutes les APIs
 * Usage: npx tsx scripts/test-apis.ts
 */

import { fetchWeather } from '../lib/api/weatherService';
import { fetchSoil } from '../lib/api/soilService';
import { fetchElevation } from '../lib/api/elevationService';
import { reverseGeocode } from '../lib/api/geocodingService';

// Coordonnées de test depuis le projet.md
const TEST_LOCATIONS = [
  {
    name: 'Scénario 1: Sologne (idéal)',
    lat: 47.6189,
    lon: 1.8572,
    description: 'Sol sableux bien drainé, météo stable, pente faible',
  },
  {
    name: 'Scénario 2: Vosges (difficile)',
    lat: 48.0686,
    lon: 6.8694,
    description: 'Pente forte, sol argileux, pluie fréquente',
  },
  {
    name: 'Scénario 3: Bretagne (risque)',
    lat: 48.2020,
    lon: -2.9326,
    description: 'Sol argileux sensible, pluie possible',
  },
  {
    name: 'Scénario 4: Landes (moyen)',
    lat: 44.0167,
    lon: -0.7167,
    description: 'Terrain plat, sol sableux',
  },
];

async function testAPI(name: string, fn: () => Promise<any>) {
  console.log(`\n🔍 Test: ${name}`);
  try {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`✅ Succès (${duration}ms)`);
    console.log(JSON.stringify(result, null, 2));
    return { success: true, duration, result };
  } catch (error) {
    console.log(`❌ Erreur:`, error);
    return { success: false, error };
  }
}

async function testLocation(location: typeof TEST_LOCATIONS[0]) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📍 ${location.name}`);
  console.log(`   Coordonnées: ${location.lat}, ${location.lon}`);
  console.log(`   ${location.description}`);
  console.log(`${'='.repeat(80)}`);

  const results = {
    location: location.name,
    tests: [] as any[],
  };

  // Test 1: Météo (Open-Meteo)
  const weatherResult = await testAPI(
    '1. Open-Meteo API (Météo)',
    () => fetchWeather(location.lat, location.lon)
  );
  results.tests.push({ api: 'Open-Meteo', ...weatherResult });

  // Attendre 1 seconde pour respecter les rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Sol (SoilGrids)
  const soilResult = await testAPI(
    '2. SoilGrids API (Sol)',
    () => fetchSoil(location.lat, location.lon)
  );
  results.tests.push({ api: 'SoilGrids', ...soilResult });

  // Attendre 1 seconde
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Élévation (Open-Elevation)
  const elevationResult = await testAPI(
    '3. Open-Elevation API (Dénivelé)',
    () => fetchElevation(location.lat, location.lon)
  );
  results.tests.push({ api: 'Open-Elevation', ...elevationResult });

  // Attendre 1 seconde
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Géocodage (Nominatim)
  const geocodeResult = await testAPI(
    '4. Nominatim API (Géocodage)',
    () => reverseGeocode(location.lat, location.lon)
  );
  results.tests.push({ api: 'Nominatim', ...geocodeResult });

  return results;
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    🧪 TEST DES APIs ARISTÉE                      ║
║                                                                   ║
║  APIs testées:                                                    ║
║  • Open-Meteo     → Météo 7 jours                               ║
║  • SoilGrids      → Texture du sol                              ║
║  • Open-Elevation → Altitude & pente                             ║
║  • Nominatim      → Géocodage                                    ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  const allResults = [];

  for (const location of TEST_LOCATIONS) {
    const result = await testLocation(location);
    allResults.push(result);

    // Attendre 2 secondes entre chaque location complète
    if (TEST_LOCATIONS.indexOf(location) < TEST_LOCATIONS.length - 1) {
      console.log('\n⏳ Attente de 2 secondes avant le prochain test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Résumé final
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 RÉSUMÉ DES TESTS`);
  console.log(`${'='.repeat(80)}\n`);

  let totalTests = 0;
  let successTests = 0;

  allResults.forEach(locationResult => {
    console.log(`📍 ${locationResult.location}`);
    locationResult.tests.forEach((test: any) => {
      totalTests++;
      const status = test.success ? '✅' : '❌';
      const duration = test.duration ? `(${test.duration}ms)` : '';
      console.log(`   ${status} ${test.api} ${duration}`);
      if (test.success) successTests++;
    });
    console.log('');
  });

  console.log(`${'='.repeat(80)}`);
  console.log(`🎯 Résultat global: ${successTests}/${totalTests} tests réussis`);
  console.log(`   Taux de succès: ${((successTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(80)}\n`);

  if (successTests === totalTests) {
    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Les 4 APIs sont fonctionnelles et prêtes à être utilisées.\n');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.\n');
  }
}

main().catch(console.error);
