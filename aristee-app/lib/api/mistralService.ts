/**
 * Mistral AI Service
 * Génère un score sur 100 et une interprétation IA pour l'analyse du chantier
 */

const MISTRAL_API_KEY = 'MM5CwoX56v0886kBHsEHNL286p6CANEz';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

interface ChantierAnalysisInput {
  name: string;
  client: string;
  type: string;
  prixFacture: number;
  volume: number;
  distanceTransport: number;
  distanceDebardage: number;
  dispersionArbres: string;
  margin: number;
  totalCost: number;
  estimatedTime: number;
  riskScore: number;
  riskFactors: string[];
  weatherData?: any;
  soilData?: any;
  terrainData?: any;
}

interface MistralAnalysisResult {
  score: number; // Score sur 100
  interpretation: string; // Interprétation textuelle détaillée
  recommendations: string[]; // Recommandations spécifiques
  successProbability: 'high' | 'medium' | 'low'; // Probabilité de succès
}

/**
 * Interprète les données de sol avec Mistral AI
 */
export async function interpretSoilData(
  clayContent: number,
  sandContent: number,
  siltContent: number,
  drainageClass: string
): Promise<string> {
  try {
    const prompt = `Tu es un expert forestier. Analyse ce sol et donne une explication ULTRA COURTE (1-2 phrases MAX, 150 caractères MAX) de son impact sur le débardage.

**SOL :**
- Argile ${clayContent.toFixed(0)}%, Sable ${sandContent.toFixed(0)}%, Limon ${siltContent.toFixed(0)}%
- Drainage : ${drainageClass}

**CONSIGNES STRICTES :**
- MAX 1-2 phrases courtes (150 caractères max)
- Style direct et concret
- Mentionne : risque principal + conseil machine OU période
- Pas de mise en forme (**, *, etc.), pas de titres, pas de listes

**EXEMPLES DE BONNES RÉPONSES :**
- "Sol argileux sensible à l'humidité. Utiliser chenilles larges et privilégier période sèche."
- "Sol sableux bien drainé, favorable au débardage toute l'année."
- "Drainage limité, risque d'ornières. Prévoir plaques de roulage si pluie."

Réponds UNIQUEMENT avec 1-2 phrases ultra courtes, RIEN d'autre.`;

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert forestier spécialisé en pédologie et débardage. Tu fournis des explications courtes, concrètes et professionnelles.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 80, // Limiter à 80 tokens pour forcer des réponses courtes
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'Analyse du sol en cours...';
  } catch (error) {
    console.error('Error calling Mistral AI for soil interpretation:', error);
    // Fallback simple
    return generateFallbackSoilInterpretation(clayContent, sandContent, drainageClass);
  }
}

/**
 * Génère une interprétation basique du sol en cas d'échec de l'API
 */
function generateFallbackSoilInterpretation(
  clayContent: number,
  sandContent: number,
  drainageClass: string
): string {
  const isBadDrainage = drainageClass.includes('poor') || drainageClass.includes('imperfect');
  const isHighClay = clayContent > 30;
  const isHighSand = sandContent > 60;

  if (isBadDrainage && isHighClay) {
    return `Sol argileux à mauvais drainage. Utiliser chenilles larges et privilégier période sèche.`;
  } else if (isBadDrainage) {
    return `Drainage limité, risque d'ornières. Prévoir plaques de roulage si pluie.`;
  } else if (isHighClay) {
    return `Sol argileux sensible à l'humidité. Éviter périodes pluvieuses.`;
  } else if (isHighSand) {
    return `Sol sableux bien drainé, favorable au débardage toute l'année.`;
  } else {
    return `Sol équilibré, conditions ${isBadDrainage ? 'moyennes' : 'favorables'} pour le débardage.`;
  }
}

export async function analyzeChantierwithMistral(
  input: ChantierAnalysisInput
): Promise<MistralAnalysisResult> {
  try {
    const prompt = buildAnalysisPrompt(input);

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un expert forestier et consultant en rentabilité des opérations de débardage. Tu analyses les chantiers forestiers et fournis des scores et recommandations précises.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 400, // Limiter à 400 tokens pour forcer concision
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    return parseAIResponse(aiResponse, input);
  } catch (error) {
    console.error('Error calling Mistral AI:', error);
    // Fallback to basic analysis
    return generateFallbackAnalysis(input);
  }
}

function buildAnalysisPrompt(input: ChantierAnalysisInput): string {
  // Analyse pluie et probabilité
  const rainProbability = input.weatherData?.dailyForecasts?.[0]?.precipitationProbability || 0;
  const avgPrecipitation = input.weatherData?.avgPrecipitation || 0;
  const maxPrecipitation = input.weatherData?.maxPrecipitation || 0;

  // Analyse du sol
  const soilDrainage = input.soilData?.drainageClass || 'unknown';
  const isBadDrainage = soilDrainage.includes('poor') || soilDrainage.includes('imperfect') || soilDrainage.includes('poorly');

  // Détection conditions critiques
  const heavyRainExpected = rainProbability >= 80 || avgPrecipitation > 5;
  const criticalRainAndSoil = heavyRainExpected && isBadDrainage;

  // Prévisions futures (cherche un jour sans pluie dans les 7 jours)
  let daysUntilGoodWeather = 0;
  if (input.weatherData?.dailyForecasts) {
    for (let i = 0; i < input.weatherData.dailyForecasts.length; i++) {
      if (input.weatherData.dailyForecasts[i].precipitationProbability < 30) {
        daysUntilGoodWeather = i;
        break;
      }
    }
  }

  return `Analyse ce chantier de débardage forestier et fournis un score sur 100 ainsi qu'une interprétation détaillée.

**DONNÉES DU CHANTIER :**
- Nom : ${input.name}
- Client : ${input.client}
- Type de facturation : ${input.type === 'tache' ? 'À la tâche' : 'À l\'heure'}
- Prix facturé : ${input.prixFacture.toLocaleString('fr-FR')} €
- Volume : ${input.volume} m³
- Coût total estimé : ${input.totalCost.toLocaleString('fr-FR')} €
- Marge calculée : ${input.margin.toFixed(1)}%
- Temps estimé : ${input.estimatedTime.toFixed(1)} heures
- Distance de transport : ${input.distanceTransport} km
- Distance de débardage : ${input.distanceDebardage} m
- Dispersion des arbres : ${input.dispersionArbres}

**SCORE DE RISQUE : ${input.riskScore}/100**

**FACTEURS DE RISQUE IDENTIFIÉS :**
${input.riskFactors.map((f) => `- ${f}`).join('\n')}

**CONTEXTE ENVIRONNEMENTAL :**
${input.weatherData ? `- Météo : Précipitations moyennes ${avgPrecipitation.toFixed(1)} mm/jour (max: ${maxPrecipitation.toFixed(1)} mm)` : ''}
${input.weatherData ? `- Probabilité de pluie : ${rainProbability}%` : ''}
${input.soilData ? `- Sol : ${soilDrainage}` : ''}
${input.soilData ? `- Drainage du sol : ${isBadDrainage ? '⚠️ MAUVAIS (risque d\'ornières)' : '✅ Correct'}` : ''}
${input.terrainData ? `- Pente : ${input.terrainData.slope.toFixed(1)}%` : ''}

**⚠️ RÈGLES CRITIQUES MÉTÉO/SOL :**

1. **PLUIE FORTE (>80% probabilité OU >5mm/jour) :**
   ${heavyRainExpected ? `
   🌧️ PLUIE FORTE DÉTECTÉE ! Probabilité ${rainProbability}%, précipitations ${avgPrecipitation.toFixed(1)} mm/jour

   → Si SOL BON DRAINAGE : Pénalité modérée (-15 points), chantier possible avec précautions
   → Si SOL MAUVAIS DRAINAGE : 🚨 PÉNALITÉ SÉVÈRE (-40 points), RECOMMANDER REPORT !

   Actuellement : Sol ${soilDrainage} = ${isBadDrainage ? 'MAUVAIS DRAINAGE 🚨' : 'Drainage correct ✅'}
   ${criticalRainAndSoil ? '⛔ COMBINAISON CRITIQUE : PLUIE + SOL IMPERMÉABLE = RISQUE MAJEUR D\'ORNIÈRES ET ENLISEMENT' : ''}
   ` : 'Pas de pluie forte prévue'}

2. **REPORT DU CHANTIER :**
   ${criticalRainAndSoil ? `
   🚨 CONDITIONS CRITIQUES DÉTECTÉES !

   ${daysUntilGoodWeather > 0 ? `→ Recommande de REPORTER le chantier de ${daysUntilGoodWeather} jour(s)
   → Météo favorable prévue dans ${daysUntilGoodWeather} jour(s) (probabilité pluie < 30%)` : '→ Aucune amélioration météo prévue sur 7 jours - Reporter sine die'}

   → Risque : Machines enlisées, ornières profondes, coûts supplémentaires de réparation terrain
   → Le report évite des coûts cachés potentiellement supérieurs à la marge du chantier
   ` : 'Conditions météo/sol acceptables pour démarrer'}

**CONSIGNE :**
1. Attribue un **score global sur 100** qui reflète la viabilité et la rentabilité du chantier
   - 80-100 : Excellent chantier, très rentable
   - 60-79 : Bon chantier, rentabilité correcte
   - 40-59 : Chantier moyen, attention aux risques
   - 20-39 : Chantier difficile, rentabilité faible
   - 0-19 : Chantier à éviter ou reporter

   **IMPORTANT : Applique les pénalités météo/sol automatiquement dans le score !**

2. Fournis une **interprétation COURTE** (3-4 PHRASES COURTES MAX, 400 caractères MAX) :
   - 1 phrase sur le point fort principal (marge, conditions, volume)
   - 1 phrase sur le risque critique majeur (météo/sol prioritaire)
   - 1 phrase sur l'impact économique global
   ${criticalRainAndSoil ? '- **INSISTE sur le danger pluie + mauvais sol**' : ''}

   **STYLE REQUIS :**
   - Phrases courtes et directes (pas de prose, pas de jargon excessif)
   - Éviter les astérisques (**, *) et le formatage markdown complexe
   - Pas de titres (Points forts, Risques, etc.) - aller droit au but
   - MAX 400 caractères total

3. Donne 3-4 **recommandations COURTES ET CONCRÈTES** (MAX 100 caractères par recommandation)
   ${criticalRainAndSoil ? `- **PREMIÈRE RECOMMANDATION OBLIGATOIRE : Reporter le chantier de ${daysUntilGoodWeather > 0 ? daysUntilGoodWeather + ' jour(s)' : 'plusieurs jours'}**` : ''}
   ${heavyRainExpected && !isBadDrainage ? '- Prévoir plaques de roulage, trax sur zones de passage, équipements anti-ornières' : ''}

   **GUIDE DES RECOMMANDATIONS (FORMAT COURT) :**
   - **PLUIE/MÉTÉO** → "Plaques anti-ornières et chenilles larges obligatoires"
   - **DISTANCE >150km** → "Chantiers 3-5 jours min pour amortir transport"
   - **PENTE >15%** → "Treuil + câbles de retenue sur porteur"
   - **ARBRES ÉPARPILLÉS** → "Regrouper grumes avant débardage"
   - **SOL ARGILEUX** → "Période sèche uniquement, chenilles larges"
   - **MARGE <15%** → "Renégocier +10-15% ou refuser"
   - **MARGE >25%** → "Sécuriser rapidement le contrat"

   **STYLE REQUIS :**
   - 1 ligne par recommandation (MAX 100 caractères)
   - Pas de numérotation détaillée (1., 2., etc.)
   - Pas d'astérisques ou formatage complexe
   - Direct et actionnable

4. Évalue la **probabilité de succès** : high, medium, ou low
   ${criticalRainAndSoil ? '**FORCE à "low" en cas de pluie forte + mauvais sol**' : ''}

**FORMAT DE RÉPONSE (JSON strict) :**
{
  "score": <nombre entre 0 et 100>,
  "interpretation": "<texte d'interprétation détaillée>",
  "recommendations": ["<recommandation 1>", "<recommandation 2>", "<recommandation 3>"],
  "successProbability": "<high|medium|low>"
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;
}

function parseAIResponse(
  aiResponse: string,
  input: ChantierAnalysisInput
): MistralAnalysisResult {
  try {
    // Log the raw response for debugging
    console.log('Raw AI Response:', aiResponse);

    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in AI response, using fallback');
      throw new Error('No JSON found in response');
    }

    // Clean the JSON string from control characters
    const cleanedJson = jsonMatch[0]
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' '); // Replace tabs with spaces

    const parsed = JSON.parse(cleanedJson);

    return {
      score: Math.max(0, Math.min(100, parsed.score || 50)),
      interpretation: parsed.interpretation || 'Analyse en cours...',
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      successProbability: ['high', 'medium', 'low'].includes(
        parsed.successProbability
      )
        ? parsed.successProbability
        : 'medium',
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return generateFallbackAnalysis(input);
  }
}

function generateFallbackAnalysis(
  input: ChantierAnalysisInput
): MistralAnalysisResult {
  // Simple rule-based fallback
  let score = 50;

  // Analyse pluie et sol pour fallback
  const rainProbability = input.weatherData?.dailyForecasts?.[0]?.precipitationProbability || 0;
  const avgPrecipitation = input.weatherData?.avgPrecipitation || 0;
  const soilDrainage = input.soilData?.drainageClass || 'unknown';
  const isBadDrainage = soilDrainage.includes('poor') || soilDrainage.includes('imperfect') || soilDrainage.includes('poorly');

  const heavyRainExpected = rainProbability >= 80 || avgPrecipitation > 5;
  const criticalRainAndSoil = heavyRainExpected && isBadDrainage;

  // Pénalités météo/sol
  if (criticalRainAndSoil) {
    score -= 40; // Pénalité sévère
  } else if (heavyRainExpected) {
    score -= 15; // Pénalité modérée
  }

  // Adjust based on margin
  if (input.margin > 25) score += 20;
  else if (input.margin > 15) score += 10;
  else if (input.margin < 5) score -= 20;

  // Adjust based on risk
  score -= Math.floor(input.riskScore / 5);

  // Adjust based on type
  if (input.type === 'tache' && input.margin > 15) score += 5;

  score = Math.max(0, Math.min(100, score));

  let successProbability: 'high' | 'medium' | 'low' =
    score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';

  // Force low probability si conditions critiques
  if (criticalRainAndSoil) {
    successProbability = 'low';
  }

  // Cherche un jour sans pluie
  let daysUntilGoodWeather = 0;
  if (input.weatherData?.dailyForecasts) {
    for (let i = 0; i < input.weatherData.dailyForecasts.length; i++) {
      if (input.weatherData.dailyForecasts[i].precipitationProbability < 30) {
        daysUntilGoodWeather = i;
        break;
      }
    }
  }

  const recommendations: string[] = [];

  // Recommandation prioritaire si conditions critiques
  if (criticalRainAndSoil) {
    recommendations.push(
      daysUntilGoodWeather > 0
        ? `⛔ REPORTER LE CHANTIER de ${daysUntilGoodWeather} jour(s) - Pluie forte + sol imperméable = risque majeur d'enlisement`
        : '⛔ REPORTER LE CHANTIER sine die - Aucune amélioration météo prévue sur 7 jours + sol imperméable'
    );
    recommendations.push('Utiliser des plaques anti-ornières et tapis de débardage si intervention urgente');
  } else if (heavyRainExpected) {
    recommendations.push('⚠️ Prévoir plaques de roulage, trax sur les zones de passage, éviter les sols argileux');
  } else if (isBadDrainage) {
    recommendations.push('Sol sensible : utiliser machines à chenilles larges, travailler en période sèche');
  }

  // Transport et distance
  if (input.distanceTransport > 150) {
    recommendations.push(`Distance ${input.distanceTransport}km : prévoir chantiers plus longs (3-5 jours min) pour amortir les frais de transport`);
  }

  // Pente forte
  if (input.terrainData && input.terrainData.slope > 15) {
    recommendations.push('Pente forte : équiper le porteur d\'un treuil, prévoir câbles de retenue et points d\'ancrage');
  }

  // Dispersion arbres
  if (input.dispersionArbres === 'eparpilles') {
    recommendations.push('Arbres éparpillés : optimiser les trajets, regrouper les grumes avant débardage si possible');
  }

  // Marge faible
  if (input.margin < 15) {
    recommendations.push('Marge faible : négocier +10-15% avec le client ou refuser le chantier');
  } else if (input.margin > 25) {
    recommendations.push('Excellente marge : sécuriser rapidement ce chantier auprès du client');
  }

  let interpretation = `Marge ${input.margin > 20 ? 'excellente' : input.margin > 10 ? 'correcte' : 'faible'} de ${input.margin.toFixed(1)}%. `;

  if (criticalRainAndSoil) {
    interpretation += `Pluie forte (${rainProbability}%) + sol imperméable = risque critique d'enlisement. Report recommandé. `;
  } else if (heavyRainExpected) {
    interpretation += `Pluie prévue mais drainage correct. Chantier possible avec précautions. `;
  } else {
    interpretation += `Risque ${input.riskScore > 60 ? 'élevé' : 'modéré'} (${input.riskScore}/100). `;
  }

  interpretation += `Surveiller : ${input.riskFactors.slice(0, 2).join(', ')}.`;

  return {
    score,
    interpretation,
    recommendations,
    successProbability,
  };
}
