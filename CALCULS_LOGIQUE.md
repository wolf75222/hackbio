# 📊 Logique de Calcul - Aristée Demo

## Vue d'ensemble

Ce document détaille **TOUTE** la logique de calcul de rentabilité des chantiers forestiers dans l'application Aristée.

---

## 🎯 Problème identifié

**Exemple actuel:**
- Chiffre d'affaires: 30 000€
- Volume: 8 000 m³
- Temps estimé: **6.6 mois (1056h)**
- Coût total: ~25 000€

**⚠️ PROBLÈME:** 6 mois pour 30k€ = rentabilité très faible (5k€/mois), ce qui ne correspond pas à la réalité du marché.

---

## 📐 Formules actuelles

### 1. Calcul du temps (`lib/calculators/timeEstimator.ts`)

#### Variables de base
```typescript
// Configuration (lib/constants/machineRates.ts)
vitesseMoyennePorteur: 3.5 km/h
chargeUtileMoyenne: 5 m³ par voyage
tempsChargementDechargement: 10 minutes par cycle
```

#### Étapes du calcul

**A. Nombre d'allers-retours**
```typescript
nombreAllersRetours = Math.ceil(volume / chargeUtileAjustee)

Exemple:
- volume = 8000 m³
- chargeUtileMoyenne = 5 m³
- coeffSol = 1.0 (terrain normal)
- chargeUtileAjustee = 5 * 1.0 = 5 m³

nombreAllersRetours = 8000 / 5 = 1600 voyages
```

**B. Temps par cycle**
```typescript
// 1. Temps de trajet
distanceKm = distanceDebardage / 1000
tempsTrajet = (distanceKm * 2) / vitesseAjustee  // aller-retour

Exemple:
- distanceDebardage = 250m = 0.25km
- vitesseBase = 3.5 km/h
- coefficients (sol, pente, météo) = ~1.0
- vitesseAjustee = 3.5 km/h
- tempsTrajet = (0.25 * 2) / 3.5 = 0.143 heures = 8.6 minutes

// 2. Temps chargement/déchargement
tempsChargementDechargement = 10 minutes = 0.167 heures

// 3. Temps cycle total
tempsCycle = (tempsTrajet + tempsChargementDechargement) * coeffDispersion * coeffVegetation

Exemple:
- tempsTrajet = 0.143h
- tempsChargementDechargement = 0.167h
- coeffDispersion (moyen) = 1.2
- coeffVegetation (recent) = 1.0
- tempsCycle = (0.143 + 0.167) * 1.2 * 1.0 = 0.372 heures = 22 minutes
```

**C. Temps total**
```typescript
tempsDebardage = nombreAllersRetours * tempsCycle * coeffDensite
tempsSetup = 4 heures
tempsTotal = tempsDebardage + tempsSetup

Exemple:
- nombreAllersRetours = 1600
- tempsCycle = 0.372h
- coeffDensite (moyenne) = 1.0
- tempsDebardage = 1600 * 0.372 * 1.0 = 595.2h
- tempsSetup = 4h
- tempsTotal = 595.2 + 4 = 599.2h ≈ 75 jours ≈ 2.5 mois
```

**⚠️ PROBLÈME IDENTIFIÉ:**
- Le calcul donne ~600h pour 8000m³
- Mais dans la vraie vie, ce serait plutôt **2-3 semaines (120-200h)**, pas 2.5 mois!

---

### 2. Calcul des coûts (`lib/calculators/costCalculator.ts`)

#### Configuration des coûts
```typescript
// lib/constants/machineRates.ts
coutMachineHeure: 65€/h
consommationBase: 25 L/h
prixCarburant: 1.65€/L
coutTransportKm: 15€/km
salaireOperateur: 25€/h brut
chargesSociales: 50%
fraisDeplacement: 80€/jour
```

#### Formules

**A. Coût transport**
```typescript
coutTransport = distanceTransport * coutTransportKm

Exemple:
- distanceTransport = 50km
- coutTransportKm = 15€/km
- coutTransport = 50 * 15 = 750€
```

**B. Coût carburant**
```typescript
coutCarburant = tempsEstime * consommationBase * prixCarburant

Exemple:
- tempsEstime = 599h
- consommationBase = 25 L/h
- prixCarburant = 1.65€/L
- coutCarburant = 599 * 25 * 1.65 = 24 709€
```

**C. Coût machine**
```typescript
coutMachine = tempsEstime * coutMachineHeure

Exemple:
- tempsEstime = 599h
- coutMachineHeure = 65€/h
- coutMachine = 599 * 65 = 38 935€
```

**D. Coût main d'œuvre**
```typescript
coutMainOeuvre = tempsEstime * salaireOperateur * (1 + chargesSociales) +
                 (tempsEstime / 8) * fraisDeplacement

Exemple:
- tempsEstime = 599h
- salaireOperateur = 25€/h
- chargesSociales = 50%
- fraisDeplacement = 80€/jour
- nbJours = 599 / 8 = 75 jours
- coutMainOeuvre = 599 * 25 * 1.5 + 75 * 80 = 22 462€ + 6000€ = 28 462€
```

**E. Coût total**
```typescript
coutTotal = coutTransport + coutCarburant + coutMachine + coutMainOeuvre

Exemple:
- coutTransport = 750€
- coutCarburant = 24 709€
- coutMachine = 38 935€
- coutMainOeuvre = 28 462€
- coutTotal = 92 856€

⚠️ ÉNORME PROBLÈME: Le coût (93k€) est SUPÉRIEUR au chiffre d'affaires (30k€)!
MARGE = 30 000 - 93 000 = -63 000€ (perte!)
```

---

## 🔍 Analyse des problèmes

### Problème 1: Temps trop long
**Raison:** Le nombre d'allers-retours est calculé avec une charge utile trop faible.

```
Actuel: 8000 m³ / 5 m³ = 1600 voyages
Réalité: Un porteur forestier charge plutôt 10-15 m³ par voyage

Avec 12 m³: 8000 / 12 = 667 voyages (au lieu de 1600)
```

### Problème 2: Coûts incohérents
**Analyse du coût carburant:**
```
Actuel: 599h * 25 L/h * 1.65€ = 24 709€

C'est énorme! Pour 599h de travail, ça fait:
- 25 L/h pendant 599h = 14 975 litres
- C'est comme si la machine consommait 25L CHAQUE heure pendant 2.5 mois!
```

**Le problème:** Le carburant devrait être calculé différemment:
- Consommation en fonctionnement: ~12-15 L/h
- Consommation en déplacement: calculée selon la distance
- Pas une consommation constante de 25L/h!

### Problème 3: Coûts machine/main d'œuvre
```
Machine: 599h * 65€ = 38 935€
Main d'œuvre: 599h * 37.5€ + 6000€ = 28 462€

Total: 67 397€ pour 599h de travail

Réalité: Un chantier de 2-3 semaines devrait coûter ~10-15k€, pas 67k€!
```

---

## 💡 Propositions de correction

### Solution 1: Augmenter la charge utile
```typescript
// Dans lib/constants/machineRates.ts
chargeUtileMoyenne: 12 // m³ par voyage (au lieu de 5)
```

**Impact:**
```
Avant: 8000 / 5 = 1600 voyages
Après: 8000 / 12 = 667 voyages

Temps: divisé par 2.4
Coûts: divisés par 2.4
```

### Solution 2: Réduire la consommation carburant
```typescript
// Dans lib/constants/machineRates.ts
consommationBase: 12 // L/h (au lieu de 25)
```

**Impact:**
```
Avant: 599h * 25 * 1.65 = 24 709€
Après: 599h * 12 * 1.65 = 11 860€ (divisé par 2)

Avec charge utile corrigée:
250h * 12 * 1.65 = 4 950€
```

### Solution 3: Ajuster les coûts machine/MO
```typescript
// Option A: Réduire le coût horaire machine
coutMachineHeure: 40 // €/h (au lieu de 65)

// Option B: Calculer sur base journalière
coutMachineJour: 500 // €/jour
coutMachineHeure: coutMachineJour / 8 = 62.5€/h

// Mais limiter aux jours réels travaillés (pas heures * coût)
```

### Solution 4: Ajouter un coefficient de productivité
```typescript
// Dans lib/calculators/timeEstimator.ts
const PRODUCTIVITE_REELLE = 0.6 // 60% du temps théorique

tempsTotal = (tempsDebardage + tempsSetup) * PRODUCTIVITE_REELLE
```

---

## 🎯 Exemple de calcul corrigé

### Avec les corrections proposées:

**Temps:**
```
chargeUtileMoyenne: 12 m³
nombreAllersRetours: 8000 / 12 = 667 voyages
tempsCycle: 22 minutes = 0.37h
tempsDebardage: 667 * 0.37 = 247h
tempsSetup: 4h
tempsTotal: 251h ≈ 31 jours ≈ 1 mois
```

**Coûts:**
```
Transport: 750€
Carburant: 251h * 12 * 1.65 = 4 970€
Machine: 251h * 40 = 10 040€
Main d'œuvre: 251h * 37.5 + (31j * 80) = 9 412€ + 2 480€ = 11 892€
TOTAL: 27 652€
```

**Marge:**
```
CA: 30 000€
Coûts: 27 652€
Marge: 2 348€ (7.8%)
```

**⚠️ TOUJOURS UN PROBLÈME:** 7.8% de marge c'est très faible!

---

## 🔧 Recommandations finales

### Pour avoir des marges cohérentes (15-25%):

**Option 1: Ajuster les prix**
```
Pour 30k€ CA avec 20% marge → coûts max = 24k€
Coûts actuels corrigés = 27.6k€
Il manque 3.6k€ d'optimisation
```

**Option 2: Réduire encore les coûts**
```typescript
// Piste 1: Réduire les frais de déplacement
fraisDeplacement: 50€/jour (au lieu de 80€)
Économie: 31j * 30€ = 930€

// Piste 2: Optimiser la machine
coutMachineHeure: 35€/h (au lieu de 40€)
Économie: 251h * 5€ = 1 255€

// Piste 3: Réduire le temps de setup
tempsSetup: 2h (au lieu de 4h)
Économie: 2h * (40€ + 37.5€ + 12*1.65) = 175€

Total économies: 2 360€
Nouveaux coûts: 25 292€
Marge: 4 708€ (15.7%) ✅
```

**Option 3: Augmenter la productivité**
```typescript
// Augmenter la vitesse de débardage
vitesseMoyennePorteur: 4.5 km/h (au lieu de 3.5)

Impact:
- Temps réduit de ~20%
- 251h → 201h
- Coûts réduits proportionnellement
```

---

## 📂 Fichiers concernés

1. **Configuration de base:**
   - `lib/constants/machineRates.ts` - Tarifs et configuration machine

2. **Coefficients terrain:**
   - `lib/constants/terrainCoefficients.ts` - Coefficients sol, pente, météo, etc.

3. **Calculateurs:**
   - `lib/calculators/timeEstimator.ts` - Calcul du temps
   - `lib/calculators/costCalculator.ts` - Calcul des coûts
   - `lib/calculators/marginCalculator.ts` - Calcul de marge et assemblage final
   - `lib/calculators/riskScorer.ts` - Score de risque

4. **Affichage:**
   - `components/chantier/ResultsDisplay.tsx` - Affichage des résultats
   - `components/chantier/ChantierForm.tsx` - Formulaire et scénarios

---

## ✅ Actions à faire

1. **Vérifier les valeurs réelles du terrain:**
   - Quelle est la VRAIE charge utile d'un porteur? (5, 10, 12, 15 m³?)
   - Quelle est la VRAIE consommation carburant? (12, 15, 20, 25 L/h?)
   - Quel est le VRAI coût machine/jour? (400, 500, 600€/jour?)

2. **Recalibrer les formules:**
   - Ajuster `chargeUtileMoyenne`
   - Ajuster `consommationBase`
   - Ajuster `coutMachineHeure`

3. **Valider avec des cas réels:**
   - Prendre 2-3 chantiers réels
   - Comparer temps/coûts réels vs calculés
   - Ajuster les coefficients

4. **Tester les scénarios:**
   - Petit (15k€) → doit donner ~1-2 semaines
   - Moyen (30k€) → doit donner ~2-3 semaines
   - Grand (100k€) → doit donner plusieurs mois
   - Très grand (500k€) → doit donner ~1 an

---

## 🚨 Points d'attention

1. **Le temps de débardage est proportionnel au volume ET à la distance**
2. **Les coûts doivent être cohérents avec le temps** (pas de carburant à 25k€ pour 30k€ CA!)
3. **La marge doit être entre 10-25%** pour être rentable
4. **Le ratio CA/temps doit être cohérent:**
   - Petit chantier: 15k€ / 1.5 sem = 10k€/sem ✅
   - Moyen: 30k€ / 2.5 sem = 12k€/sem ✅
   - Grand: 100k€ / 3 mois = 8.3k€/sem ⚠️ (devrait être plus?)
