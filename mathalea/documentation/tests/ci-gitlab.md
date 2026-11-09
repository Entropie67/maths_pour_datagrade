# Rapport d'analyse de la CI GitLab

Ce document résume ce que teste la CI définie dans [.gitlab-ci.yml](../../.gitlab-ci.yml), à quel moment les tâches se lancent, et comment reproduire localement les vérifications principales.

## Vue d'ensemble

La CI actuelle couvre principalement :

- installation et cache `pnpm`
- tests Vitest unitaires (`tests/unit`)
- tests Vitest dans `src`
- typecheck Svelte/TypeScript avec `pnpm check`
- tests des exercices modifiés, regroupés dans un job consolidé
- tests e2e Playwright/Vitest sur les vues, la cohérence et l'interactivité
- tests e2e Playwright/Vitest de détection d'erreurs console par niveaux
- tests d'exports PDF, DNB, BAC et E3C
- rapport d'accessibilité avec axe-core, informatif
- construction de l'image CI PDF via Kaniko

Le SAST GitLab est inclus mais les jobs `semgrep-sast` et `sast` sont désactivés par les règles actuelles.

## Stages

Les stages déclarés sont :

1. `setup`
2. `planified`
3. `test`
4. `playwright-test`
5. `build-projet`
6. `compile-pdf`
7. `playwright`
8. `playwright-pdfDNB`
9. `playwright-pdfBAC`
10. `build_ci_pdf`

## Préparation commune

La plupart des jobs Node utilisent `.pnpm_setup` :

```bash
npm install -g pnpm@12.6.0
```

Le store est défini une seule fois par `storeDir: .pnpm-store` dans
[`pnpm-workspace.yaml`](../../pnpm-workspace.yaml). Les jobs conservent le
dossier `.pnpm-store/` dans leurs caches sans reconfigurer pnpm.

Les jobs Playwright démarrent ensuite l'application avec `pnpm start` et attendent `http://localhost:80/alea/`.

Pour reproduire localement un test e2e sans lier le port 80, lancer le serveur sur 5173 puis forcer le port côté tests :

```bash
pnpm install
pnpm start
CI=1 PLAYWRIGHT_SERVER_PORT=5173 pnpm test:e2e:views
```

Ordre de priorité du port dans les helpers Playwright :

1. `PLAYWRIGHT_SERVER_PORT` si définie
2. `80` si `CI` est définie
3. `5173` sinon

## Setup

### `setup`

Installe les dépendances avec le lockfile et alimente le cache pnpm :

```bash
pnpm install --frozen-lockfile --prefer-offline --silent
```

Déclenchement :

- demandes de fusion
- `main`
- `guironne-jobs`
- pipelines planifiés
- branche `pipeline`

## Tests unitaires et source

### `tests-unitaires`

Exécute :

```bash
pnpm run makeJson
NODE_OPTIONS=--max-old-space-size=4096 pnpm test:unit
```

Déclenchement :

- `main`
- `guironne-jobs`
- pipelines planifiés
- branche `pipeline` en manuel

### `tests-src`

Exécute :

```bash
pnpm run makeJson
NODE_OPTIONS=--max-old-space-size=4096 pnpm test:src
```

Déclenchement identique à `tests-unitaires`.

Reproduction locale condensée :

```bash
pnpm run makeJson
pnpm run prebuild-unit-tests
```

## Typecheck

### `testTypescriptOk`

Exécute :

```bash
pnpm run makeJson
pnpm check
```

Déclenchement :

- demandes de fusion
- `main`
- désactivé sur `guironne-jobs`

Le job est actuellement `allow_failure: true`.

## Exercices modifiés

### `testExosModifiedConsolidated`

Ce job remplace les anciens jobs séparés `testExosModifiedWithoutPlayWright`, `testExosModified`, `testExosModifiedInteractif` et `testExosModifiedAmcnum`.

Il récupère les fichiers modifiés par le dernier commit (`MAX_COMMITS=1`), les
place dans `CHANGED_FILES`, puis lance six sous-tests et un contrôle informatif. Sur une demande de fusion
dont le dernier commit fusionne `main` dans la branche (`git pull`), seuls les
fichiers qui diffèrent de chacun des deux parents sont retenus
(`git diff-tree --cc`) : les fichiers apportés par `main` tels quels ne sont pas
retestés. Le commit analysé est celui du pipeline (`$CI_COMMIT_SHA`), même si la
branche a avancé depuis. Les sous-tests :

```bash
CHANGED_FILES="$CHANGED_FILES" bash tasks/ci-with-dev-server.sh pnpm test:e2e:console_errors
CHANGED_FILES="$CHANGED_FILES" pnpm vitest --config tests/e2e/vitest.config.all_exercises.js --run
INTERACTIF_REPORT=1 CHANGED_FILES="$CHANGED_FILES" pnpm vitest tests/integration/interactivity_all.test.ts --run
AMCNUM_REPORT=1 CHANGED_FILES="$CHANGED_FILES" pnpm vitest src/lib/amc/report-amcnum.test.ts --run
CHANGED_FILES="$CHANGED_FILES" pnpm stability:check
CHANGED_FILES="$CHANGED_FILES" pnpm corrections:check
CHANGED_FILES="$CHANGED_FILES" pnpm a11y:check # informatif
```

Le job échoue si au moins un sous-test échoue. Le
[contrôle d'accessibilité](controle-accessibilite.md) n'entre pas dans ce décompte
et ne le fait jamais échouer.

Le serveur HTTP est nécessaire au premier sous-test, qui utilise Playwright.
`tasks/ci-with-dev-server.sh` le démarre dans un groupe de processus dédié,
attend sa disponibilité (180 secondes au maximum), puis arrête ce groupe
avant de rendre le code de sortie du test. Les interruptions déclenchent aussi
ce nettoyage. Le journal `artifacts/ci-vite.log` est conservé en cas d'échec.
Les sous-tests suivants s'exécutent sans navigateur ni serveur Vite.
Le contrôle de stabilité
porte sur tout le catalogue si `CHANGED_FILES` contient un utilitaire partagé
de `src/lib/` ou `src/modules/` ; voir [la stabilité des tirages](stabilite-exercices.md).

Pour `all_exercises`, les chemins de `CHANGED_FILES` situés dans `src/exercices/`
sont d'abord agrégés puis résolus en exercices uniques. Le plafond
`NB_EXOS_PAR_LOT` s'applique ensuite au lot global, pas à chaque fichier modifié,
afin d'éviter une explosion du nombre de tests quand une MR touche beaucoup de
fichiers d'exercices.

Déclenchement :

- demandes de fusion
- `main`
- `guironne-jobs` en manuel

### `testExosModifiedLatex`

Job séparé car il utilise l'image CI avec LaTeX. Il récupère les fichiers modifiés sur la même fenêtre de 5 commits puis lance :

```bash
CHANGED_FILES="$CHANGED_FILES" pnpm test:e2e:pdfexports
```

Déclenchement :

- demandes de fusion
- `main`
- `guironne-jobs` en manuel

## Console Playwright

### `playwright-console-consolidated`

Lance `pnpm test:e2e:console_errors` dans un job distinct (`parallel:matrix`,
variable `NIV`) pour chacun des filtres suivants :

- `6e/6`
- `5e/5`
- `4e/4`
- `3e/3`
- `2e/2`
- `1e/1`
- `TEx^TSpe^techno`
- `QCM`
- `can/6e^can/5e`
- `can/4e^can/3e`
- `can/2e^can/1e`
- `can/Ex^can/TSpe`

Déclenchement via le template `.testCI` :

- condition historique restrictive `CI_COMMIT_BRANCH == "main" && CI_PIPELINE_SOURCE == "merge_request_event"`
- `guironne-jobs`
- pipelines planifiés
- branche `pipeline` en manuel

Le template `.testCI` est `allow_failure: true`.

Un filtre prend 25 à 35 min. Les runners de la Forge interrompent tout job
au bout de 2 h, même si `timeout` est plus élevé : enchaîner plusieurs filtres
dans un même job le fait échouer avant la fin.

Reproduction locale :

```bash
pnpm start
NIV=6e/6 pnpm test:e2e:console_errors
```

## Playwright globaux planifiés

Ces jobs s'exécutent en pipeline planifié ou sur la branche `pipeline` en manuel.

| Job | Commande | `allow_failure` |
| --- | --- | --- |
| `playwright-caneleve` | `pnpm test:e2e:views` | `true` |
| `playwright-consistency` | `pnpm test:e2e:consistency` | `true` |
| `playwright-interactivity` | `pnpm test:e2e:interactivity` | `false` |

Reproduction locale :

```bash
pnpm start
pnpm test:e2e:views
pnpm test:e2e:consistency
pnpm test:e2e:interactivity
```

## Rapport d'accessibilité

### `a11y-report`

Lance `pnpm a11y:report` (axe-core sur 20 vues) et conserve le rapport dans les
artefacts du job. Ce job informe et n'échoue jamais sur un défaut relevé.

Déclenchement :

- variable `A11Y_REPORT=true`, normalement un pipeline planifié dédié : ce pipeline ne
  lance que ce job
- branche `pipeline` en manuel

Voir [le rapport d'accessibilité](rapport-accessibilite.md).

## All exercises JSDOM

### `jsdom-all-exercises`

Job planifié qui lance `pnpm test:e2e:all_exercises` avec `NB_EXOS_PAR_LOT=1000` sur les filtres CAN et collège :

- `can/2e^can/1e`
- `can/6e^can/5e`
- `can/4e^can/3e`
- `6e/6`
- `5e/5`
- `4e/4A^4e/4F^4e/4I^4e/4P^4e/4S`
- `4e/4C`
- `4e/4G^4e/4L`
- `3e/3`

Déclenchement :

- pipelines planifiés
- branche `pipeline` en manuel

## Exports PDF

Les jobs PDF utilisent l'image `$DOCKER_IMAGE` (`ci/tex-node:node22-texlive-2026-06`) et le template `.testCIPDF`.

### `playwright-pdf-consolidated`

Lance `pnpm test:e2e:pdfexports` dans un seul job CI, en série, sur :

- `can/2e`
- `can/1e`
- `can/6e`
- `can/5e`
- `can/4e`
- `can/3e`
- `6e`
- `5e`
- `4e/4A^4e/4F^4e/4I^4e/4P^4e/4S`
- `4e/4C`
- `4e/4G^4e/4L`
- `3e`

Chaque entrée est lancée l'une après l'autre avec :

```bash
NIV="$NIV_LABEL" STYLES="Coopmaths" pnpm test:e2e:pdfexports
```

Le test `pdfexports` compile les exports LaTeX avec `lualatex`. Les seuils
suivants permettent de diagnostiquer ou limiter les compilations trop longues :

- `PDF_COMPILE_TIMEOUT_MS` : timeout par compilation, défaut `90000`.
- `PDF_SLOW_COMPILE_MS` : seuil de log pour les compilations lentes, défaut
  `10000`.

Le job reste volontairement linéaire pour éviter plusieurs compilations
LaTeX simultanées en CI. La configuration Vitest dédiée utilise aussi un seul
worker.

### `playwright-pdf-dnb-consolidated`

Clone le dépôt DNB dans `public/static/dnb`, déplace `sujets_decoupes`, puis teste :

- `dnb_2013^dnb_2014^dnb_2015`
- `dnb_2016^dnb_2017^dnb_2018^dnb_2019`
- `dnb_2020^dnb_2021^dnb_2022^dnb_2023^dnb_2024`

### `playwright-pdf-bac-consolidated`

Clone le dépôt BAC dans `public/static/bac`, puis teste :

- `e3c_2024^e3c_2023^e3c_2022^e3c_2021`
- `bac_2024^bac_2023^bac_2022^bac_2021`

Déclenchement PDF via `.testCIPDF` :

- `guironne-jobs`
- `mathalea-jobs`
- pipelines planifiés, notamment `CI_TEST_MA == "PDF"`
- branche `pipeline` en manuel

Reproduction locale ciblée :

```bash
pnpm start
CI=1 NIV=6e/6 pnpm test:e2e:pdfexports
```

## Image CI PDF

### `build_ci_pdf`

Construit l'image Docker PDF avec Kaniko depuis `docker/ci-pdf/Dockerfile` et pousse :

```text
$CI_REGISTRY_IMAGE/ci/tex-node:node22-texlive-2026-06
```

Déclenchement :

- branche `pipeline` en manuel
- `guironne-jobs` en manuel

## Commandes utiles de synthèse

### Pré-commit recommandé localement

```bash
pnpm run makeJson
pnpm run prebuild-unit-tests
pnpm check
```

### E2E globaux

```bash
pnpm start
pnpm test:e2e:views
pnpm test:e2e:consistency
pnpm test:e2e:interactivity
```

### Exercice modifié

```bash
pnpm start
CHANGED_FILES="$(git diff --name-only HEAD~5..HEAD)" pnpm test:e2e:console_errors
CHANGED_FILES="$(git diff --name-only HEAD~5..HEAD)" pnpm vitest --config tests/e2e/vitest.config.all_exercises.js --run
INTERACTIF_REPORT=1 CHANGED_FILES="$(git diff --name-only HEAD~5..HEAD)" pnpm vitest tests/integration/interactivity_all.test.ts --run
AMCNUM_REPORT=1 CHANGED_FILES="$(git diff --name-only HEAD~5..HEAD)" pnpm vitest src/lib/amc/report-amcnum.test.ts --run
```

## Points d'attention

- `pnpm check` est bien lancé en CI via `testTypescriptOk`, mais ce job est `allow_failure: true`.
- `tests-unitaires` et `tests-src` sont séparés et aussi `allow_failure: true`.
- Les checks d'exercices modifiés sont consolidés et bloquants via `testExosModifiedConsolidated`.
- Les e2e par niveaux restent `allow_failure: true` via `.testCI`.
- Les PDF consolidés collège/CAN sont bloquants, tandis que les jobs DNB/BAC sont `allow_failure: true`.
- La fenêtre de comparaison des exercices modifiés va jusqu'à 5 commits.
