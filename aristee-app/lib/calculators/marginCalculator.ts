import { ChantierInput, ChantierResults } from '../types/chantier';
import { calculateTime } from './timeEstimator';
import { calculateCosts } from './costCalculator';
import { calculateRisk } from './riskScorer';

export function calculateChantierResults(chantier: ChantierInput): ChantierResults {
  // 1. Calculer le temps
  const timeEstimation = calculateTime(chantier);

  // 2. Calculer les coûts
  const costs = calculateCosts(chantier);

  // 3. Calculer le risque
  const risk = calculateRisk(chantier);

  // 4. Calculer la marge
  const marge = chantier.prixFacture - costs.total;
  const margePercent = (marge / chantier.prixFacture) * 100;

  // 5. Générer la recommandation
  const recommendation = generateRecommendation(
    chantier,
    margePercent,
    risk,
    timeEstimation
  );

  // 6. Période optimale
  const optimalPeriod = getOptimalPeriod(chantier);

  return {
    tempsEstime: timeEstimation.tempsTotal,
    coutTotal: costs.total,
    marge: Math.round(marge),
    margePercent: Math.round(margePercent * 10) / 10,
    scoreRisque: risk.scoreTotal,
    riskFactors: risk.riskFactors,
    recommendation,
    optimalPeriod,
    coutDetails: {
      transport: costs.transport,
      carburant: costs.carburant,
      machine: costs.machine,
      mainOeuvre: costs.mainOeuvre,
    },
  };
}

function generateRecommendation(
  chantier: ChantierInput,
  margePercent: number,
  risk: any,
  time: any
): string {
  const parts: string[] = [];

  // 1. Évaluation globale
  if (margePercent < 10) {
    parts.push('⛔ **Chantier non rentable**');
  } else if (margePercent < 20) {
    parts.push('⚠️ **Chantier à faible marge**');
  } else if (margePercent < 30) {
    parts.push('✅ **Chantier rentable**');
  } else {
    parts.push('✅ **Chantier très rentable**');
  }

  parts.push('');

  // 2. Détails de la marge
  parts.push(
    `Marge prévisionnelle : **${Math.round(chantier.prixFacture - (chantier.prixFacture / (1 + margePercent / 100)))}€** (${margePercent.toFixed(1)}%)`
  );
  parts.push('');

  // 3. Facteurs de risque
  if (risk.riskFactors.length > 0) {
    parts.push('**🚨 Facteurs de risque identifiés :**');
    risk.riskFactors.forEach((factor: string) => {
      parts.push(`• ${factor}`);
    });
    parts.push('');
  }

  // 4. Recommandations
  parts.push('**💡 Recommandations :**');

  // Recommandations basées sur la marge
  if (margePercent < 15) {
    const augmentationNecessaire = Math.ceil((15 - margePercent) / margePercent * 100);
    parts.push(
      `• Augmenter le prix de **${augmentationNecessaire}%** pour atteindre une marge de 15%`
    );
  }

  // Recommandations basées sur la météo
  if (chantier.autoData && chantier.autoData.weather.precipitationProbability > 60) {
    parts.push('• ⚠️ **Reporter l\'intervention** : forte probabilité de pluie');
    parts.push('• Attendre une fenêtre météo favorable (précipitations < 30%)');
  } else if (chantier.autoData && chantier.autoData.weather.precipitationProbability > 40) {
    parts.push('• Intervenir **avant** la période de pluie prévue');
  }

  // Recommandations basées sur le sol
  if (chantier.autoData && chantier.autoData.soil.drainage === 'faible') {
    parts.push('• Prévoir des protections anti-ornières (tapis, branchages)');
    parts.push('• Éviter toute intervention après pluie (attendre 48h minimum)');
  }

  // Recommandations basées sur la pente
  if (chantier.autoData && chantier.autoData.terrain.slope > 15) {
    parts.push('• Prévoir un treuil pour les zones les plus pentues');
    parts.push('• Budget carburant ajusté (+30% sur estimation)');
  }

  // Recommandation finale
  parts.push('');
  if (margePercent < 10 || risk.scoreTotal > 75) {
    parts.push('**Décision recommandée : REFUSER** ou renégocier le prix');
  } else if (margePercent < 15 || risk.scoreTotal > 60) {
    parts.push('**Décision recommandée : ACCEPTER avec conditions** (augmentation prix ou report)');
  } else {
    parts.push('**Décision recommandée : ACCEPTER** 👍');
  }

  return parts.join('\n');
}

function getOptimalPeriod(chantier: ChantierInput): string | undefined {
  if (!chantier.autoData) return undefined;

  const { soil, terrain } = chantier.autoData;

  // Sol sensible : privilégier l'été
  if (soil.sensitivity === 'elevee' || soil.drainage === 'faible') {
    return 'Juin - Septembre (sol sec)';
  }

  // Pente forte : éviter l'hiver
  if (terrain.slope > 12) {
    return 'Avril - Octobre (hors période hivernale)';
  }

  // Par défaut : printemps à automne
  return 'Mai - Septembre';
}
