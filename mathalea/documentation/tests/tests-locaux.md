# Lancer les tests en local

Cette page sert de point d'entrée pour choisir une vérification, cibler un
exercice et comprendre les paramètres des commandes. Lancer les commandes
depuis la racine du dépôt, après `pnpm install`. Les commandes ci-dessous
utilisent la syntaxe d'un shell Unix (`VARIABLE=valeur pnpm ...`).

Dans un clone ou un worktree neuf, lancer `pnpm makeJson` avant les tests
unitaires et `pnpm check`. Ces commandes importent des catalogues générés
(`src/json/uuidsToUrlFR.json`, `exercicesFR.json`, `referentielStaticCH.json`,
etc.) mais ne les créent pas elles-mêmes. `pnpm dev` et `pnpm build` exécutent
déjà `makeJson` avant de démarrer.

Sous Node 26, si les tests JSDOM échouent sur `window.localStorage.clear()`
avec un stockage indisponible, désactiver le stockage natif expérimental de
Node pour laisser JSDOM fournir celui du navigateur :

```sh
NODE_OPTIONS=--no-experimental-webstorage pnpm prebuild-unit-tests
```

## Choisir le test

| Besoin                                                 | Commande                        | Ce qui est vérifié                                                                                                                                           | Serveur Vite                     |
| ------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Tester les fonctions et classes                        | `pnpm test:unit`                | Tests Vitest de `tests/unit/`                                                                                                                                | Non                              |
| Tester le code avec ses tests adjacents                | `pnpm test:src`                 | Tests Vitest dans `src/`                                                                                                                                     | Non                              |
| Lancer les deux suites précédentes                     | `pnpm prebuild-unit-tests`      | `test:unit`, puis `test:src` ; à réussir avant un commit                                                                                                     | Non                              |
| Vérifier les types                                     | `pnpm check`                    | Contrôle Svelte et TypeScript ; ce n'est pas une suite Vitest                                                                                                | Non                              |
| Vérifier les réponses interactives attendues           | `pnpm test:interactivity`       | Génère les exercices interactifs sur trois graines fixes ; vérifie les comparaisons, la correction avec DOM simulé, les claviers et certains QCM/exports AMC | Non                              |
| Observer cette suite pendant le développement          | `pnpm test:interactivity:watch` | Même suite, en mode surveillance Vitest                                                                                                                      | Non                              |
| Vérifier la génération des exercices                   | `pnpm test:e2e:all_exercises`   | Génération en environnement JSDOM ; `NIV` choisit le périmètre, sinon le script ne lance qu'un exercice de référence                                         | Non                              |
| Détecter les erreurs de navigateur                     | `pnpm test:e2e:console_errors`  | Charge les exercices dans Chromium et relève les erreurs de console, exceptions et plantages                                                                 | Oui                              |
| Vérifier les composants interactifs dans le navigateur | `pnpm test:e2e:interactivity`   | Scénarios Playwright de saisie, validation, sauvegarde et rejeu des réponses                                                                                 | Oui                              |
| Vérifier les vues                                      | `pnpm test:e2e:views`           | Scénarios Playwright des vues CAN, élève, Capytale et Moodle                                                                                                 | Oui                              |
| Vérifier la cohérence entre vues                       | `pnpm test:e2e:consistency`     | Compare le contenu d'exercices de référence entre leurs vues                                                                                                 | Oui                              |
| Vérifier les tirages publiés                           | `pnpm stability:check`          | Compare les empreintes des exercices avec le registre de stabilité ; lance aussi `makeJson`                                                                  | Non                              |
| Vérifier les exports PDF                               | `pnpm test:e2e:pdfexports`      | Génère le LaTeX puis compile les PDF avec `lualatex`                                                                                                         | Non ; installation LaTeX requise |
| Vérifier le LaTeX d'exercices modifiés                 | `pnpm test:e2e:latex_compile`   | Génère et compile le LaTeX des fichiers désignés par `CHANGED_FILES`                                                                                         | Non ; installation LaTeX requise |
| Repérer les retours ligne LaTeX problématiques         | `pnpm test:e2e:latex_breaks`    | Analyse le LaTeX généré, sans compilation PDF                                                                                                                | Non                              |
| Vérifier le rendu Typst                                | `pnpm typst:check`              | Ouvre le site avec Playwright et compile avec le moteur WASM du site                                                                                         | Oui                              |
| Vérifier Typst sans navigateur                         | `pnpm typst:check:fast`         | Test par lots avec compilation CLI Typst ; `typst:check:source` ne vérifie que la source                                                                     | Non ; binaire Typst requis       |

Pour un seul fichier de test Vitest, utiliser par exemple
`pnpm exec vitest run tests/unit/grandeur.test.ts`. Les variantes de couverture
sont `pnpm test:coverage`, `pnpm test:coverage:unit` et
`pnpm test:coverage:src`. `pnpm test:mr` enchaîne les tests unitaires/source et
les suites E2E prévues par `prebuild-e2e-tests` ; il est plus large qu'un test
ciblé. `pnpm test:e2e` est un alias de `pnpm test:e2e:all` (interactivité
Playwright et erreurs console), pas un alias de toutes les commandes E2E.

Les autres commandes spécialisées de `package.json` sont
`pnpm apigeom-labels:check` (labels apiGeom en sortie Typst),
`pnpm screenshot` (captures), `pnpm testExercice` (parcours des vues d'un
exercice, par exemple `id=4C20 pnpm testExercice`) et
`pnpm test:e2e:console_errors:debug` (diagnostic avec navigateur visible et
pause possible). `pnpm test:e2e:dev` lance les scénarios E2E de développement
en mode surveillance.

## Cibler un exercice et ses paramètres

Le filtre `NIV` est un **préfixe de chemin** dans le catalogue des exercices.
Il accepte un niveau (`6e`), une famille (`6e/6N`) ou un fichier précis
(`6e/6N1E.ts`) pour `test:interactivity`. Ne pas préfixer ce dernier par
`src/exercices/`. Pour les suites E2E fondées sur la découverte des UUID,
consulter aussi [les règles de filtrage des erreurs console](erreurs-console-e2e.md#1-découverte-des-exercices-finduuid-findstatic).

```sh
NIV=6e/6N1E.ts pnpm test:interactivity
NIV=6e/6N1E.ts TEST_PARAM=single pnpm test:interactivity
NIV=6e/6N1E.ts TEST_PARAM=full pnpm test:interactivity
NIV=6e/6N1E.ts TEST_PARAM=full TEST_PARAM_MAX=100 pnpm test:interactivity
```

Pour `test:interactivity`, `TEST_PARAM` choisit les scénarios construits à
partir des formulaires `sup`, `sup2`, …, `sup5` déclarés par l'exercice :

| Valeur               | Scénarios par exercice                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Absente ou `default` | Paramètres par défaut seulement. Une valeur inconnue retombe aussi sur ce mode.                                        |
| `single`             | Valeurs candidates de chaque paramètre, en ne changeant qu'un paramètre à la fois ; le scénario par défaut est inclus. |
| `full`               | Combinaisons des valeurs candidates des paramètres ; au plus 40 scénarios par exercice par défaut.                     |

`TEST_PARAM_MAX` fixe la limite des scénarios **en mode `full` seulement**.
Cette limite prend les premières combinaisons produites ; elle ne garantit
donc pas la couverture de toutes les combinaisons possibles. Chaque scénario
est joué avec les trois graines fixes de la suite. Les valeurs candidates
dépendent du type de formulaire : cases cochées/décochées, bornes et valeurs
numériques, options de liste ou valeurs extraites de l'aide d'un texte.

Ces deux variables sont également lues par `pnpm test:e2e:latex_breaks`, qui
réutilise le même constructeur de scénarios. Elles **ne pilotent pas**
`test:e2e:interactivity` (Playwright), `test:e2e:console_errors`,
`test:e2e:all_exercises` ni `test:e2e:pdfexports`.

`CHANGED_FILES` accepte des chemins complets de fichiers modifiés, séparés par
des retours à la ligne. Dans `test:interactivity`, `NIV` a priorité si les deux
sont fournis ; sans l'un ou l'autre, toute la sélection du catalogue est
parcourue. Exemple :

```sh
CHANGED_FILES="src/exercices/6e/6N1E.ts" TEST_PARAM=single pnpm test:interactivity
CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm stability:check
```

Le test d'intégration ne traite que les modules déclarés interactifs
(`interactifReady`). Une question non prise en charge par une stratégie de
vérification peut être sautée : lire les comptes et les motifs dans
`tests/integration/logs/interactivity_all_questions_counts.json` et
`tests/integration/logs/interactivity_all_skipped_questions_by_reason.json`.
Les résultats complets et les échecs seuls sont écrits dans le même dossier.

Le contrôle des claviers compare les symboles des réponses attendues aux
touches des blocs du champ et à ses touches personnalisées (`dataKeys`). Il
résout ces dernières avec `toucheDepuisCle()`, comme le clavier réel : dans
`dataKeys`, utiliser `';'` pour le point-virgule, car `'SEMICOLON'` insère
littéralement ce nom et ne désigne pas un raccourci personnalisé. Le contrôle
vérifie aussi les réponses avec `ensembleDeNombres`, `suiteDeNombres`,
`suiteRangeeDeNombres` et `kUplet`, notamment la présence du point-virgule
séparant les nombres. Les règles sont définies dans
`tests/integration/helpers/verifier-clavier.ts` ; elles couvrent les symboles
explicitement recensés, sans garantir la saisie de toute expression LaTeX.

## Suites de navigateur et exports

Avant un test Playwright, utiliser le serveur Vite déjà disponible à
`http://localhost:5173`. Sinon, lancer `pnpm dev` dans un autre terminal ;
il régénère les dictionnaires avant de démarrer Vite. Le port des suites E2E
peut être choisi avec `PLAYWRIGHT_SERVER_PORT` (5173 en local par défaut).

```sh
NIV=6e/6N1E.ts pnpm test:e2e:console_errors
NIV=6e/6N1E.ts pnpm test:e2e:all_exercises
NIV=6e/6N1E.ts pnpm test:e2e:latex_breaks
NIV=6e/6N1E.ts STYLES=Coopmaths pnpm test:e2e:pdfexports
```

`test:e2e:console_errors` parcourt l'interface et ses paramètres : il cherche
les erreurs au chargement et à l'interaction, mais ne vérifie pas que la bonne
réponse est acceptée. Voir [ses profils et ses limites de lots](erreurs-console-e2e.md).
`test:e2e:interactivity` vérifie au contraire des parcours ciblés de l'interface
réelle ; il ne parcourt pas automatiquement tous les exercices comme
`test:interactivity`. Le contrôle de stabilité a un autre objectif : détecter
un changement de tirage pour une graine et des paramètres déjà publiés. Voir
[la procédure de stabilité](stabilite-exercices.md).

Pour les exports, `STYLES` est une liste de styles séparés par des virgules ;
`PDF_COMPILE_TIMEOUT_MS` et `PDF_SLOW_COMPILE_MS` règlent respectivement le
délai limite et le seuil de journalisation des compilations PDF (90 000 et
10 000 ms par défaut). `test:e2e:latex_compile` sélectionne ses exercices par
`CHANGED_FILES`, tandis que `test:e2e:latex_breaks` accepte aussi `NIV` et
`TEST_PARAM`. Ces commandes ne remplacent pas le contrôle visuel d'un PDF.

Pour Typst, cibler par exemple `uuid=6N2C-1 pnpm typst:check` ou choisir
`ALL=1`, `FAILING=1`, `UNTESTED=1` avec éventuellement `LIMIT=50`.
`typst:check:source` contrôle la source ; `typst:check:compile` demande une
compilation avec le binaire Typst installé. Voir [le détail de l'export
Typst](../developpement/maintenance-moteur/exports/typst.md).
