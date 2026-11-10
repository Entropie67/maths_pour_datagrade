# Tests de rapport d'exercices

Ce guide explique comment lancer les rapports d'exercices en local : le rapport runtime **interactif**, le rapport **AMCNum**, et le test d'intégration interactif utilisé en CI.

Index parent : [documentation/tests/README.md](README.md). Rapports générés : [reports/README.md](../../reports/README.md).

## 📋 Aperçu

| Test | Rôle | Sortie |
| --- | --- | --- |
| `src/lib/amc/report-interactif.test.ts` | Vérifie en runtime que les exercices `interactifReady=true` remplissent `autoCorrection` | `reports/interactif-report.md` |
| `tests/integration/interactivity_all.test.ts` | Vérifie que les réponses attendues sont acceptées par les comparateurs et par le DOM simulé | Logs JSON dans `tests/integration/logs/` |
| `src/lib/amc/report-amcnum.test.ts` | Vérifie que les exercices `amcReady=true`, `amcType=AMCNum` disposent d'une correction AMC valide | `reports/amcnum-report.md` |

## 🎯 Lancement local

### 1. Mode analyse complète (tous les exercices)

**Interactif :**

```bash
INTERACTIF_REPORT=1 pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

Mode plus isolé, utile quand un exercice peut bloquer le scan rapide :

```bash
INTERACTIF_REPORT=1 INTERACTIF_ISOLATED=1 pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

**AMCNum :**

```bash
AMCNUM_REPORT=1 pnpm vitest src/lib/amc/report-amcnum.test.ts --run
```

✅ Scanne **tous les fichiers** du répertoire `src/exercices/`
⏱️ Peut prendre plusieurs minutes
📊 Génère un rapport Markdown complet avec tous les problèmes détectés

---

### 2. Mode ciblé (fichiers spécifiques)

**Interactif :**

```bash
INTERACTIF_REPORT=1 CHANGED_FILES='src/exercices/2e/2G34-3.ts' pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

**AMCNum :**

```bash
AMCNUM_REPORT=1 CHANGED_FILES='src/exercices/2e/2G34-3.ts' pnpm vitest src/lib/amc/report-amcnum.test.ts --run
```

✅ Scanne **uniquement les fichiers listés** dans `CHANGED_FILES`
⚡ Très rapide (quelques secondes)
📋 Utile pour tester des modifications récentes

---

### 3. Plusieurs fichiers

```bash
INTERACTIF_REPORT=1 CHANGED_FILES='src/exercices/2e/2G34-3.ts
src/exercices/2e/2G34-4.ts
src/exercices/2e/2G34-5.ts' pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

✅ Utilisez `\n` (nouvelle ligne) pour séparer les fichiers
✅ Chaque fichier est analysé indépendamment

---

## 🔍 Résultats

### Quand des problèmes sont détectés

Un fichier Markdown est généré dans `reports/` :

- [interactif-report.md](../../reports/interactif-report.md) : Liste des exercices interactifs sans `autoCorrection`
- [amcnum-report.md](../../reports/amcnum-report.md) : Liste des exercices AMCNum sans correction valide

Exemple de rapport :

```markdown
| Numéro | Fichier                    | Tags                                       |
| ------ | -------------------------- | ------------------------------------------ |
| 1      | src/exercices/1e/1N31-1.ts | [autoCorrection-interactive-absente]       |
| 2      | src/exercices/2e/2N33-2.ts | [erreur-runtime] (Cannot read property...) |
```

### Quand aucun problème n'est trouvé

```
✅ Found 0 exercises with issues
```

Aucun rapport n'est généré.

---

## 🏗️ Tags de diagnostic

### report-interactif.test.ts

- `autoCorrection-interactive-absente` : L'exercice déclare `interactifReady=true` mais `autoCorrection` reste vide
- `erreur-runtime` : Erreur lors de l'instanciation ou génération
- `timeout-exercice` : délai dépassé en mode isolé
- `erreur-runtime-boucle` : processus isolé interrompu ou terminé anormalement

### tests/integration/interactivity_all.test.ts

- Vérifie trois graines : `ePxF1`, `a2b3c`, `z9y8x`
- Teste les scénarios de paramètres construits depuis `TEST_PARAM`
- Écrit les questions ignorées et les compteurs dans `tests/integration/logs/`
- Vérifie aussi les doublons dans certains QCM générés depuis `reponse` / `distracteurs`

### report-amcnum.test.ts

- `autoCorrectionAMC-manquante-ou-incomplete` : Structure AMC invalide ou manquante
- `autoCorrection-html-absente` : Pas de `autoCorrection` pour le mode HTML
- `autoCorrection-html-absente(interactif true)` : Pas de `autoCorrection` en mode interactif
- `erreur-runtime` : Erreur lors de l'instanciation ou génération
- `class-export-manquante` : Pas d'export default

---

## 🚀 Dans la CI

Les tests liés aux fichiers modifiés s'exécutent automatiquement sur demande de fusion et sur `main` via GitLab CI :

- **Job `testExosModifiedConsolidated`** : lance les erreurs console, `all_exercises`, `tests/integration/interactivity_all.test.ts` avec `INTERACTIF_REPORT=1`, puis `report-amcnum.test.ts` avec `AMCNUM_REPORT=1`
- **Job `testExosModifiedLatex`** : relance `test:e2e:pdfexports` sur les fichiers modifiés avec l'image LaTeX

La variable `CHANGED_FILES` est calculée automatiquement à partir d'une fenêtre de `git diff` allant jusqu'à 5 commits.

---

## ⚙️ Astuces

### Exécuter et afficher les 50 premières lignes

```bash
INTERACTIF_REPORT=1 pnpm vitest src/lib/amc/report-interactif.test.ts --run 2>&1 | head -n 50
```

### Vérifier un exercice sans lancer le test complet

```bash
# Éditer la ligne du matcher dans le fichier test (vide par défaut)
# Exemple : const matcher = '2e/2G' // scannera seulement src/exercices/2e/2G*

# Puis :
INTERACTIF_REPORT=1 pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

### Reproduire le test d'intégration interactif de la CI

```bash
INTERACTIF_REPORT=1 CHANGED_FILES='src/exercices/2e/2G34-3.ts' pnpm vitest tests/integration/interactivity_all.test.ts --run
```

### Afficher le rapport généré

```bash
cat reports/interactif-report.md
cat reports/amcnum-report.md
```

---

## 📝 Notes

- Les deux tests ne s'exécutent **que** si leur variable d'environnement (`INTERACTIF_REPORT` ou `AMCNUM_REPORT`) est explicitement définie à `'1'`
- En l'absence de `CHANGED_FILES`, les tests de rapport scannent **tous les exercices**
- Les rapports sont **écrasés** à chaque lancement (ils ne s'ajoutent pas)
- Les fichiers dans `ressources/` et `apps/` sont toujours ignorés
