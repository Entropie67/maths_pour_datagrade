# Géométrie 2D

## `mathalea2d`

`mathalea2d()` est exportée depuis `src/modules/mathalea2d.ts`. C'est le point d'entrée pour produire le rendu d'objets MathALÉA 2D en SVG/HTML ou en TikZ selon le contexte.

La fonction reçoit des paramètres de fenêtre et une liste d'objets 2D. Les objets sont généralement issus de modules de `src/lib/2d/` ou de helpers plus spécialisés.

## Objets MathALÉA 2D

Les objets 2D partagent un modèle commun autour de `ObjetMathalea2D` dans `src/lib/2d/ObjetMathalea2D.ts`. Ils portent les informations nécessaires au rendu : coordonnées, style, couleur, épaisseur, opacité, labels et représentation TikZ/SVG.

Les guides pratiques sur les couleurs, tailles et alignements sont regroupés
dans les [recettes mathématiques](../../auteurs-exercices/mathematiques/README.md).

## `RepereBuilder`

`RepereBuilder` est l'export par défaut de `src/lib/2d/RepereBuilder.ts`. Il aide à construire un repère avec des options lisibles plutôt que de configurer manuellement chaque axe, graduation et borne.

Il expose notamment `buildStandard()`, `buildCustom()` et `buildTrigo()`, avec des setters chaînables comme `setUniteX()`, `setUniteY()`, `setThickX()`, `setThickY()`, `setGrille()`, `setGrilleSecondaire()`, `setLabelX()`, `setLabelY()`, `setLabelsX()` et `setLabelsY()`. Il est à privilégier quand un exercice doit générer plusieurs repères cohérents ou lorsque la configuration d'axes devient difficile à relire.

## Splines graphiques

Deux niveaux existent :

- `Spline`, `spline()`, `noeudsSplineAleatoire()`, `modifieNoeuds()` et `trieNoeuds()` dans `src/lib/mathFonctions/Spline.ts` décrivent une fonction interpolée à partir de noeuds et fournissent des méthodes d'évaluation, de signes, de variations et de tracés.
- `CourbeSpline` et `courbeSpline()` dans `src/lib/2d/courbeSpline.ts` produisent l'objet 2D correspondant pour le rendu.

Utiliser `Spline` pour raisonner sur la fonction, puis `courbeSpline()` ou la méthode `courbe()` de la classe pour l'affichage.
