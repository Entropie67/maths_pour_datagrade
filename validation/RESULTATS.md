# Validation de l'import — 9 novembre 2026

## Provenance et intégrité

Source officielle : `https://forge.apps.education.fr/coopmaths/mathalea.git`, commit `f03d4179f5ebade4828bb3b78e8cf2021309a37b`.

Les 8 394 fichiers et le lien symbolique sont présents. Avant adaptation de sécurité, l'arbre Git importé sous `mathalea/` et l'arbre source avaient tous deux l'identifiant `74895b99aa755e3764dc98f110f3653b3f295c0e`. Le contrôle SHA-256 final ne trouve aucune différence non prévue, avec une adaptation déclarée dans `upstream-overrides.json`. Les 5 199 fichiers sous `src/exercices/` sont conservés, sans filtrage. La licence et les mentions originales sont intactes.

Sous Windows, les fins de ligne ont été restaurées depuis une archive produite avec `core.autocrlf=false`, afin de conserver exactement les octets Git. Aucun correctif du moteur n'est inclus dans cet import. Un helper de tests est adapté pour retirer un jeton GitLab en clair détecté par la protection GitHub lors du premier envoi. La valeur vient désormais de `MATHALEA_GITLAB_TOKEN` ; aucune fonction n'est supprimée.

## Environnement et résultats

Windows, Node.js 24.13.0, pnpm 12.6.0, dépendances du lockfile amont, Chromium Playwright 1248. Une première installation a utilisé pnpm 11.25.0 ; elle a ensuite été vérifiée avec 12.6.0 et le lockfile gelé, sans modification du lockfile.

| Vérification exécutée | Résultat |
| --- | --- |
| Installation avec lockfile gelé | Réussite |
| `makeJson` | Réussite ; avertissement amont sur 65 références sans rattachement |
| `prebuild-unit-tests`, partie `tests/unit` | 3 018 réussis, 10 ignorés ; 226 fichiers réussis, 1 ignoré |
| `prebuild-unit-tests`, partie `src` | 3 110 réussis, 25 ignorés ; 156 fichiers réussis, 1 ignoré |
| Application complète, `vite build` | Réussite, environ 5 min 16 s |
| Moteur embarquable, `vite build -c vite.moteur.config.ts` | Réussite, environ 1 min 33 s |
| Démarrage Vite sur `/alea/` | Réussite |
| Tests officiels `mathLive.calcul.test.ts` | 4 réussis |
| Tests officiels CAN minuteur/retour et plusieurs champs | 5 réussis |
| Deux vues élèves du scénario CAN 2024 | 2 réussis |
| Relecture Moodle CAN officielle | 1 réussi |
| `scripts/smoke-browser.mjs` | Réussite, puis réussite après contrôle final des sources |
| `node --test scripts/test-ticket-config.mjs` | Réussite : aucune requête sans jeton, GET et POST authentifiés avec configuration, aucune requête si désactivé ; réseau simulé |

Le contrôle navigateur supplémentaire vérifie le démarrage réel de la CAN et la génération répétable, avec la même graine, des énoncés et corrections de sept exercices : `6N2A-1`, `5N2G`, `4A11-0`, `3L11`, `2N10-1`, `1AL10-1`, `TSA1-10`. Il relève 4 439 entrées et 3 041 UUID distincts dans le catalogue FR exposé par l'API embarquable. Ce catalogue n'est pas l'inventaire de tous les médias statiques ni de tous les fichiers d'exercices du dépôt. Aucun événement `pageerror` n'a été observé dans ce contrôle.

## Échecs, interruptions et limites

- Le scénario officiel `testCanView` cherche un bouton dont le nom contient une ancienne icône : ` Démarrer`. Il échoue par délai dépassé. Le bouton accessible `Démarrer` fonctionne et le contrôle supplémentaire atteint le minuteur et la première question. Le test amont reste inchangé ; la suite officielle globale des vues ne passe donc pas entièrement.
- La relecture Capytale a produit des messages d'incohérence de score/checksum, puis a été interrompue sans résultat final. La sauvegarde Capytale a également été interrompue ; une restauration des fins de ligne a provoqué des rechargements du serveur pendant cet essai. Ces essais ne permettent pas de conclure à une régression du produit ni de valider Capytale.
- Les autres scénarios de vues élèves, la totalité des exercices et des graines, les exports PDF/LaTeX/Typst/AMC et les services externes n'ont pas tous été testés.
- Les builds émettent des avertissements amont : gros fichiers JavaScript, attributs d'import JSON de Scratch, imports MathLive mixtes ; le build moteur signale aussi des chemins de polices résolus à l'exécution. Leur succès ne remplace pas un test complet de déploiement.
- Le typecheck exhaustif n'a pas été exécuté. `check:changed` a été exécuté après l'adaptation du helper mais ne contrôle que `src/` et l'a donc ignoré. Le helper adapté est testé séparément. Aucun fichier TypeScript/Svelte du moteur ou dépendance n'a été modifié.
- Les médias d'annales absents du dépôt officiel ne sont pas inclus. L'autonomie hors ligne et la complétude des ressources sur un nouvel hébergement ne sont pas acquises.

## Workflows GitHub

Le workflow initial du commit `b615dababc1d38aab6c297b49fa8d03971fee5e0` a bien été exécuté : [exécution 42584293657](https://github.com/Entropie67/maths_pour_datagrade/actions/runs/42584293657), terminée en échec. Ses journaux confirment trois problèmes : accents graves interprétés comme commandes dans le heredoc (`command not found`, `Is a directory`), seulement 8 393 fichiers ajoutés au lieu de 8 395 éléments suivis, puis refus de publication par la protection GitHub à cause du jeton GitLab du helper de tests. La première recherche ne listait que les exécutions liées aux PR et avait manqué cette exécution déclenchée par push ; le diagnostic a été corrigé après lecture de l'historique complet et des journaux.

Le workflow d'import est corrigé pour éviter l'interprétation des accents graves Markdown par Bash, inclure les fichiers suivis mais ignorés par `.gitignore`, comparer les arbres Git avant adaptation de sécurité, puis externaliser le jeton avant publication.

Le workflow `validate-mathalea.yml` a entièrement réussi sur GitHub/Linux pour le commit de code `b066dd4181f8cf05429b7371d34d5c08b3bcfdb9` : [exécution 42587973161](https://github.com/Entropie67/maths_pour_datagrade/actions/runs/42587973161). Ses journaux ont été lus. Le contrôle d'intégrité, l'installation verrouillée, les deux suites de tests, le test du helper, les deux builds et le contrôle navigateur sont tous réussis. Le build application a duré environ 3 min 3 s et le build moteur 1 min 24 s. Le navigateur retrouve les 4 439 entrées et 3 041 UUID du catalogue FR, et ne signale aucun `pageerror`. Les captures et le résultat du contrôle navigateur sont joints en artefact GitHub.

La mise à jour finale de ce rapport ne modifie aucun code ; les résultats distants ci-dessus restent attachés au commit de code indiqué.

## Conclusion technique

Le code officiel complet est conservé, avec une seule adaptation de sécurité dans un helper de test, et les deux builds fonctionnent. Les 6 128 tests unitaires/source réussis, les 12 tests navigateur officiels réussis, le contrôle complémentaire et le test du helper adapté apportent une base vérifiée. Ils ne prouvent pas encore « aucune perte de fonctionnalité » pour un déploiement DataGrade entièrement autonome. La préparation de cet habillage et les travaux restants sont décrits dans `docs/INTEGRATION-DATAGRADE.md`.
# Complément : annales locales, 9 novembre 2026

Après ajout des médias, `pnpm prebuild-unit-tests` a de nouveau réussi : 6 128 tests passent et 35 sont ignorés. Le contrôle de provenance retrouve les 8 394 fichiers et le lien amont, avec la seule adaptation de sécurité déjà déclarée.

`node scripts/test-annales-locales.mjs` réussit sur huit familles : DNB, BAC, CRPE, DNB professionnel, E3C, EAM, STI2D et STL. Chaque scénario charge un énoncé puis sa correction depuis le serveur local, avec les requêtes HTTP externes bloquées. Résultats détaillés : [annales-browser.json](annales-browser.json). La liste et les limites des médias livrés sont dans [le rapport des ressources](../resources/README.md).

Ces contrôles ne valident pas tous les sujets, les exports des annales ou les services externes. Les résultats de compilation ci-dessous concernent la validation précédente du code ; ils ne constituent pas un résultat de compilation du nouvel ajout de médias.

