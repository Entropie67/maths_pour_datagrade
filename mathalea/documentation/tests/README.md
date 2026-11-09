# Tests et CI

Index des documents liés aux tests locaux, à la CI GitLab et aux rapports d'exercices.

| Titre                    | Rôle                                                                                | Public                               | Source / statut                | Lien                                                   |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------ | ------------------------------------------------------ |
| Tests locaux             | Choisir une commande, cibler un exercice et régler les scénarios de paramètres      | Développeurs                         | Documentation durable          | [tests-locaux.md](tests-locaux.md)                     |
| CI GitLab                | Décrire les tâches GitLab CI et leur reproduction locale                            | Développeurs, mainteneurs            | Documentation durable renommée | [ci-gitlab.md](ci-gitlab.md)                           |
| Erreurs console E2E      | Expliquer le test Playwright qui détecte les erreurs console                        | Développeurs, mainteneurs CI         | Documentation durable renommée | [erreurs-console-e2e.md](erreurs-console-e2e.md)       |
| Rapports d'exercices     | Lancer et lire les rapports `interactif` et `AMCNum`                                | Développeurs d'exercices             | Documentation durable renommée | [rapports-exercices.md](rapports-exercices.md)         |
| Stabilité des tirages    | Garantir que les corrigés partagés restent valides après modification d'un exercice | Développeurs d'exercices, relecteurs | Documentation durable          | [stabilite-exercices.md](stabilite-exercices.md)       |
| Contrôle d'accessibilité | Signaler, sans bloquer, les défauts d'accessibilité des exercices modifiés          | Développeurs d'exercices, relecteurs | Documentation durable          | [controle-accessibilite.md](controle-accessibilite.md) |
| Rapport d'accessibilité  | Suivre les défauts détectés par axe-core sur 20 vues, sans taux de conformité RGAA  | Développeurs, mainteneurs            | Documentation durable          | [rapport-accessibilite.md](rapport-accessibilite.md)   |

Voir aussi le [contrôle des corrections minimales](corrections-minimales.md), exécuté sur le corpus de régression et les exercices modifiés.

Pour les contrôles manuels d'accessibilité, voir la
[navigation au clavier](navigation-clavier.md), notamment le réglage de Safari
et le parcours des boutons « Vérifier ».

## Écrire un test

Les tests utilisent [Vitest](https://vitest.dev/api/expect.html) ; les tests de
bout en bout pilotent un navigateur avec Playwright.

| Type                          | Emplacement                      | Modèle                                       | Lancement                     |
| ----------------------------- | -------------------------------- | -------------------------------------------- | ----------------------------- |
| Unitaire (fonction, classe)   | `tests/unit/`                    | `tests/unit/grandeur.test.ts`                | `pnpm test:unit`              |
| Unitaire à côté du code       | `src/**/*.test.ts`               | `src/lib/interactif/checks/atoms.test.ts`    | `pnpm test:src`               |
| Interactivité de bout en bout | `tests/e2e/tests/interactivity/` | `tests/e2e/tests/dev/mathLive.moule.test.ts` | `pnpm test:e2e:interactivity` |

## Rejeu des MathaleaCustomElement

Tout composant interactif dérivé de `MathaleaCustomElement` doit posséder un
test Playwright qui vérifie le cycle complet de sauvegarde et de rejeu. Le test
ne doit pas injecter directement le type natif retourné par le getter : il doit
réinjecter la chaîne réellement conservée dans `exercice.answers`, comme le fait
Capytale.

Le scénario de référence et les règles d'exemption sont décrits dans
[`custom-elements.md`](../developpement/maintenance-moteur/interactivite/custom-elements.md#test-playwright-de-rejeu--obligatoire).

Une modification d'un custom element doit être contrôlée avec :

```sh
AUTOTEST=true PLAYWRIGHT_SERVER_PORT=5173 pnpm test:e2e:interactivity
```

Pour lancer un seul fichier :

```sh
pnpm exec vitest run tests/unit/grandeur.test.ts
```

Pour un test d'interactivité : dupliquer `mathLive.moule.test.ts`, remplacer
`moule` par le format testé, renseigner l'URL de l'exercice et construire une
bonne ou une mauvaise réponse selon `question.isCorrect` en suivant les
commentaires du fichier, puis le déplacer dans
`tests/e2e/tests/interactivity/`. Les tests de bout en bout utilisent le serveur
Vite de `http://localhost:5173` (`pnpm dev`).

Pour vérifier une option de comparaison, ajouter un cas à
`tests/unit/fonctionsDeComparaison.test.ts`.
