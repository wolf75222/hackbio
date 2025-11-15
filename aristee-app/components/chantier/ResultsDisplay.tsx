'use client';

import { ChantierResults } from '@/lib/types/chantier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResultsDisplayProps {
  results: ChantierResults;
  prixFacture: number;
  typeFacturation?: 'tache' | 'heure';
}

export function ResultsDisplay({ results, prixFacture, typeFacturation = 'tache' }: ResultsDisplayProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMargeColor = (margePercent: number) => {
    if (margePercent < 10) return 'text-red-500';
    if (margePercent < 20) return 'text-orange-500';
    if (margePercent < 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Calcul rentabilité horaire
  const rentabiliteHoraire = results.marge / results.tempsEstime;

  return (
    <div className="space-y-6">
      {/* En-tête des résultats */}
      <Card>
        <CardHeader>
          <CardTitle>📊 RÉSULTATS DE L'ANALYSE</CardTitle>
          <CardDescription>
            Estimation basée sur les données terrain et les conditions environnementales
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-5 gap-4">
        <Card className={typeFacturation === 'heure' ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold">
              {results.tempsEstime < 24
                ? `${results.tempsEstime}h`
                : results.tempsEstime < 168
                ? `${(results.tempsEstime / 8).toFixed(1)} jours`
                : results.tempsEstime < 720
                ? `${(results.tempsEstime / 40).toFixed(1)} sem.`
                : `${(results.tempsEstime / 160).toFixed(1)} mois`}
            </div>
            <div className="text-sm text-muted-foreground">
              Temps estimé
              {typeFacturation === 'heure' && (
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  Base de facturation
                </div>
              )}
            </div>
            {typeFacturation === 'heure' && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                Revenu/h : {rentabiliteHoraire.toFixed(0)}€
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              ({results.tempsEstime.toFixed(0)}h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">💶</div>
            <div className="text-2xl font-bold">{prixFacture.toLocaleString('fr-FR')}€</div>
            <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">{results.coutTotal}€</div>
            <div className="text-sm text-muted-foreground">Coût total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className={`text-2xl font-bold ${getMargeColor(results.margePercent)}`}>
              +{results.margePercent}%
            </div>
            <div className="text-sm text-muted-foreground">
              Marge ({results.marge}€)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl font-bold">{results.scoreRisque}/100</div>
            <div className="text-sm text-muted-foreground">Score de risque</div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de risque */}
      <Card>
        <CardHeader>
          <CardTitle>Niveau de risque</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={results.scoreRisque}
            className="h-4"
            indicatorClassName={getRiskColor(results.scoreRisque)}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            {results.scoreRisque < 30 && '✅ Risque faible'}
            {results.scoreRisque >= 30 && results.scoreRisque < 60 && '⚠️ Risque moyen'}
            {results.scoreRisque >= 60 && results.scoreRisque < 80 && '🚨 Risque élevé'}
            {results.scoreRisque >= 80 && '⛔ Risque critique'}
          </div>
        </CardContent>
      </Card>

      {/* Détails des coûts */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Détails des coûts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transport :</span>
              <span className="font-medium">{results.coutDetails.transport}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Carburant :</span>
              <span className="font-medium">{results.coutDetails.carburant}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Machine :</span>
              <span className="font-medium">{results.coutDetails.machine}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Main d'œuvre :</span>
              <span className="font-medium">{results.coutDetails.mainOeuvre}€</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total :</span>
              <span>{results.coutTotal}€</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Prix facturé :</span>
              <span>{prixFacture}€</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Marge :</span>
              <span className={getMargeColor(results.margePercent)}>
                {results.marge}€ ({results.margePercent}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandation */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Recommandation intelligente</CardTitle>
          {results.optimalPeriod && (
            <CardDescription>
              📅 Période optimale pour ce site : {results.optimalPeriod}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div
              className="whitespace-pre-line text-sm"
              dangerouslySetInnerHTML={{ __html: results.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>

          {results.riskFactors.length > 0 && (
            <div className="mt-4">
              <Alert>
                <AlertTitle>Facteurs de risque identifiés</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {results.riskFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyse IA Mistral */}
      {results.aiAnalysis && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Analyse IA
              <Badge variant="outline" className="ml-2">
                Mistral AI
              </Badge>
            </CardTitle>
            <CardDescription>
              Évaluation intelligente basée sur l'ensemble des données du chantier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score IA */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {results.aiAnalysis.score}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold">Probabilité de succès :</span>
                  <Badge
                    variant={
                      results.aiAnalysis.successProbability === 'high'
                        ? 'default'
                        : results.aiAnalysis.successProbability === 'medium'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {results.aiAnalysis.successProbability === 'high' && '🟢 Élevée'}
                    {results.aiAnalysis.successProbability === 'medium' && '🟡 Moyenne'}
                    {results.aiAnalysis.successProbability === 'low' && '🔴 Faible'}
                  </Badge>
                </div>
                <Progress
                  value={results.aiAnalysis.score}
                  className="h-2"
                  indicatorClassName={
                    results.aiAnalysis.score >= 70
                      ? 'bg-green-500'
                      : results.aiAnalysis.score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }
                />
              </div>
            </div>

            {/* Interprétation IA */}
            <div className="bg-background/50 rounded-lg p-4 border">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                💬 Interprétation IA
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {results.aiAnalysis.interpretation}
              </p>
            </div>

            {/* Recommandations IA */}
            {results.aiAnalysis.recommendations.length > 0 && (
              <div className="bg-background/50 rounded-lg p-4 border">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  💡 Recommandations IA
                </h4>
                <ul className="space-y-2">
                  {results.aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-semibold">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Badge de décision */}
      <div className="flex justify-center">
        {results.margePercent < 10 || results.scoreRisque > 75 ? (
          <Badge variant="destructive" className="text-lg px-6 py-2">
            ⛔ REFUSER LE CHANTIER
          </Badge>
        ) : results.margePercent < 15 || results.scoreRisque > 60 ? (
          <Badge variant="outline" className="text-lg px-6 py-2">
            ⚠️ ACCEPTER AVEC CONDITIONS
          </Badge>
        ) : (
          <Badge className="text-lg px-6 py-2 bg-green-500">
            ✅ ACCEPTER LE CHANTIER
          </Badge>
        )}
      </div>
    </div>
  );
}
