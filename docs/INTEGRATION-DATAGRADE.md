# Préparer l'habillage DataGrade

## Base conservée

Conserver l'application complète sous `/alea/` comme référence fonctionnelle : catalogue, paramètres, liens avec graine, corrections, vues élève, diaporama, CAN, exports et intégrations. Ne pas remplacer cette application par le seul moteur embarquable : celui-ci ne contient pas les menus et tous les exports.

Le moteur embarquable existant expose `initialiser`, `preparerExercice`, `afficher`, `verifier`, `ecrireReponses`, `monterClavier`, `listerExercices` et `definirLangue`. Sa documentation se trouve dans `mathalea/documentation/developpement/maintenance-moteur/architecture/moteur-embarquable.md` et les exports ont été vérifiés dans `mathalea/src/moteur/index.ts`. L'API actuelle porte le numéro 1.

## Prochain habillage

1. Ajouter une interface DataGrade distincte, avec accès permanent à l'application MathALÉA complète.
2. Charger le catalogue via l'API existante sans filtrage destructif des niveaux, UUID ou paramètres.
3. Conserver la graine, les paramètres, le numéro d'exercice et les réponses pour reprendre une activité identique.
4. Utiliser les correcteurs et les barèmes du moteur ; contrôler les résultats côté DataGrade avant toute utilisation dans une note officielle.
5. Comparer systématiquement les mêmes exercices et graines dans les deux interfaces : énoncés, corrections, saisie mathématique, QCM, géométrie, clavier et exports.
6. Conserver les crédits, les licences et un accès visible au code source de la version effectivement déployée.

## Ressources nécessaires à l'autonomie complète

Le dépôt officiel exclut notamment `public/static`, les médias d'annales DNB/BAC/E3C/CRPE et certains autres dossiers de ressources. En développement, `vite.config.ts` relaie `/alea/static` vers `coopmaths.fr`. Le déploiement officiel relie des répertoires de médias partagés (`tasks/deploy_site.sh`). Un build réussi ne prouve donc pas que ces ressources fonctionnent hors ligne ou sur un nouvel hébergement.

Les médias référencés ont maintenant été inventoriés et téléchargés lorsqu'ils sont disponibles ; ils sont livrés dans `mathalea/public/`. Le [rapport des annales](../resources/README.md) détaille la couverture, les liens indisponibles et les huit familles testées localement, avec énoncé et correction et accès réseau externe bloqué. Le profil `vite.annales-locales.config.mjs` désactive le proxy des médias. Il reste à traiter les liens manquants et à tester les exports et l'hébergement cible. L'ancien guide `src/exercicesStatiques/README.md` ne couvre pas seul les dictionnaires actuels.

Certaines fonctions reposent sur des services externes : Capytale/Moodle, applications en iframe, collaboration, calculatrices NumWorks, médias partenaires. Préserver leurs interfaces ne fournit ni leurs serveurs ni leurs comptes. Elles nécessitent des tests avec leurs environnements respectifs.

## Critère de livraison

L'import complet du code et les tests automatisés sont une première étape. Ne déclarer « aucune perte de fonctionnalité » qu'après validation du catalogue, des médias, des exports et des services externes sur la cible DataGrade. Aucun habillage ne doit masquer une fonction sans offrir un accès équivalent.
