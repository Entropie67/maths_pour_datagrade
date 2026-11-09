```
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                                                    %%%
%%%                                                    %%%
%%% LE PROJET EST MAINTENU SUR FORGE.APPS.EDUCATION.FR %%%
%%%                                                    %%%
%%%                                                    %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
```

# MathALÉA

MathALÉA est un générateur d'exercices de mathématiques qui suit le programme actuel de mathématiques en France.

Il propose plusieurs utilisations possibles :

- Affichage des exercices dans le navigateur
- Export LaTeX des énoncés des exercices
- Création de liens personnalisés à destination des élèves
- Exercices avec ou sans interactivité
- Affichage des questions en mode diaporama
- Annales d'examens accessibles par mots-clés
- Course aux nombres
- ...

Le moteur développé depuis 2018 connait un développement régulier grâce à une communauté de professeurs de mathématiques en exercice qui améliorent l'interface et proposent toujours de nouveaux exercices.

## Utilisation en local

La dernière version est disponible sur <https://coopmaths.fr/alea>.

Vous pouvez récupérer une copie du dépot et l'utiliser en local. Pour cela, vous aurez besoin d'une version récente de NodeJS afin d'exécuter les commandes suivantes.

Le dépôt utilise pnpm et son lockfile versionné pour installer les mêmes
dépendances sur chaque poste. La version de pnpm est fixée dans `package.json`.

```
pnpm install
pnpm dev
```

## Participer au développement

La communauté de développeur autour de MathALEA est ouverte et prête à accompagner toutes les bonnes volontés intéressées pour améliorer l'outil.

La documentation développeur est disponible dans le dépôt : [documentation/README.md](documentation/README.md).
La documentation destinée aux utilisateurs reste sur le [wiki](https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/home).
Vous pouvez nous contacter à <contact@coopmaths.fr>.

## Reproduire les tests CI en local

Pour reproduire les tests e2e en mode CI sur une machine locale (sans port 80), utilisez la variable d'environnement PLAYWRIGHT_SERVER_PORT.

Exemple en une ligne :

```bash
CI=1 PLAYWRIGHT_SERVER_PORT=5173 pnpm test:e2e:views
```

Voir la documentation détaillée : [documentation/tests/ci-gitlab.md](documentation/tests/ci-gitlab.md)
