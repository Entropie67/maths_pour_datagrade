# Origine de MathALÉA

- Source officielle : https://forge.apps.education.fr/coopmaths/mathalea.git
- Révision importée : `f03d4179f5ebade4828bb3b78e8cf2021309a37b`.
- Import du 9 novembre 2026 dans `mathalea/` : tous les fichiers suivis par Git, sans sélection de niveaux ni suppression de fonctionnalité.
- 8 394 fichiers ordinaires et un lien symbolique `CLAUDE.md` vers `AGENTS.md` ; 5 199 fichiers sous `src/exercices/` (ce nombre n'est pas un nombre d'exercices distincts).
- Licence déclarée en amont : AGPL-3.0. Le texte original, les auteurs, les mentions et les licences des ressources restent dans `mathalea/`.

`upstream-manifest.json` contient les empreintes SHA-256 des fichiers ordinaires d'origine. `node scripts/verify-upstream.mjs` contrôle la copie, en tenant compte des adaptations explicitement consignées dans `upstream-overrides.json`. Le lien symbolique est conservé dans l'index Git avec son mode 120000. L'identité de l'arbre Git a été vérifiée avant l'adaptation de sécurité ci-dessous.

## Adaptation de sécurité indispensable

GitHub a bloqué le premier envoi parce que `tests/e2e/helpers/issue.ts` contenait un jeton GitLab en clair. Dans ce fichier, le jeton est lu dans `MATHALEA_GITLAB_TOKEN`, et aucune requête de création de ticket n'est tentée sans cette configuration. Le commentaire d'exemple n'embarque plus de jeton. La fonction, ses appels et les autres fonctionnalités restent présents. L'empreinte adaptée et sa justification sont consignées dans `upstream-overrides.json`. Ne jamais contourner la protection GitHub pour republier la valeur amont.

## Adaptation du domaine DataGrade

`src/lib/siteOrigin.ts`, son test et `src/lib/components/refUtils.ts` reconnaissent `maths.datagrade.fr` comme origine locale des annales en production. La vitrine associative reste sur CoopMaths. Les empreintes de ces adaptations sont également déclarées dans `upstream-overrides.json`. Voir le [déploiement DataGrade](docs/DEPLOIEMENT-DATAGRADE.md).

Les dépendances sont déclarées et verrouillées dans les fichiers amont ; `node_modules` n'est pas versionné. Les médias absents du dépôt amont ont fait l'objet d'un [import complémentaire documenté](resources/README.md). Les services externes ne sont pas copiés. Les catalogues générés restent générés par les outils MathALÉA.

Les commandes amont `makeJson`, `dev` et `build` régénèrent notamment `src/json/quizzBackgrounds.json`. Une différence dans ce fichier après exécution doit être examinée avant publication ; ne pas la confondre avec un fichier manquant lors de l'import.

Les adaptations DataGrade sont documentées en dehors de `mathalea/`. Une future modification du moteur devra être identifiée et sa source correspondante mise à disposition avec les mentions et la licence applicables.
