# Représentations mathématiques

## Tableaux de signes et de variations

Les helpers de `src/lib/mathFonctions/etudeFonction.ts` construisent les données et les rendus de tableaux de signes et de variations :

- `signesFonction()` décrit les signes successifs sur un intervalle ;
- `variationsFonction()` décrit les variations ;
- `tableauDeVariation()` rend une structure de tableau en LaTeX ou en SVG selon le contexte ;
- `tableauSignesFonction()` construit un tableau de signes à partir d'une fonction ;
- `tableauSignesFacteurs()` construit un tableau de signes par facteurs ;
- `tableauVariationsFonction()` construit un tableau de variations à partir d'une fonction et de sa dérivée.

La classe `Spline` dans `src/lib/mathFonctions/Spline.ts` propose aussi des méthodes `signes()`, `variations()`, `tableauSignes()` et `courbe()` lorsque la fonction est décrite par des noeuds.

## Fonctions

Les outils de fonctions sont principalement dans `src/lib/mathFonctions/`. Ils couvrent l'étude de fonctions, les splines, les nombres complexes, les statistiques et des helpers de calcul formel ou numérique selon les besoins des exercices.

## Schémas en boîte

`SchemaEnBoite` est l'export par défaut de `src/lib/outils/SchemaEnBoite.ts`. Il sert aux représentations de problèmes additifs ou multiplicatifs avec barres, accolades, flèches et contenus textuels, avec une sortie adaptée au contexte HTML ou LaTeX.

## Helpers d'affichage

Les représentations prêtes à afficher doivent rester compatibles HTML et LaTeX. Avant d'ajouter un nouveau helper visuel, vérifier si un helper existe déjà dans `src/lib/2d/`, `src/lib/outils/`, `src/modules/` ou `src/lib/mathFonctions/`.
