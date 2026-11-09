# Recettes mathématiques

Ces guides aident à choisir le bon helper mathématique quand on code ou modifie
un exercice. Commencer par le guide qui correspond à la tâche immédiate, puis
consulter la
[référence mathématique du moteur](../../maintenance-moteur/mathematiques/README.md)
pour les contrats des classes, modules et points d'entrée.

## Choisir le bon guide

| Tâche à réaliser | Guide à lire en premier | Pourquoi |
| --- | --- | --- |
| Afficher un nombre, une fraction, un prix, une valeur arrondie ou une écriture LaTeX propre dans un énoncé ou une correction | [Afficher des nombres](afficher-des-nombres.md) | Évite les concaténations fragiles, les séparateurs non français et les rendus HTML/LaTeX incohérents. |
| Calculer avec des décimaux, comparer une réponse numérique ou éviter les erreurs de flottants JavaScript | [Gérer les décimaux](gerer-les-decimaux.md) | Aide à choisir entre `Decimal`, `FractionEtendue`, une chaîne attendue et les options de comparaison de `handleAnswers()`. |
| Manipuler une durée, un horaire, une mesure avec unité ou accepter plusieurs unités équivalentes en interactivité | [Gérer des durées et des grandeurs](durees-et-grandeurs.md) | Oriente vers `Hms`, `Grandeur` et l'option interactive `unite`. |
| Dessiner une figure, régler une fenêtre `mathalea2d()`, styliser des objets 2D, aligner le rendu TikZ ou construire un repère | [Géométrie 2D](geometrie-2d.md) | Rappelle les choix pratiques pour des figures lisibles en HTML et en export LaTeX. |
| Étudier une fonction, tracer une courbe par noeuds, construire un tableau de signes ou de variations | [Fonctions, splines et tableaux](fonctions-et-tableaux.md) | Oriente vers `Spline` et les helpers de `src/lib/mathFonctions/etudeFonction.ts`. |
| Calculer des indicateurs statistiques, tracer une boîte à moustaches ou un diagramme | [Statistiques](statistiques.md) | Présente la classe `Stat` et sa définition des quartiles. |
| Écrire une probabilité, rédiger la consigne d'un calcul de probabilité en saisie libre | [Probabilités](probabilites.md) | Fixe la notation `P(B)`, les consignes « Calculer $P(B)$. » ou « $P(B)=$ », et les claviers et comparaisons associés. |

## Ordre recommandé

Pour un premier exercice, lire les guides dans cet ordre :

1. [Afficher des nombres](afficher-des-nombres.md), car presque toutes les corrections affichent des valeurs calculées.
2. [Gérer les décimaux](gerer-les-decimaux.md), dès qu'une valeur décimale ou approchée intervient.
3. Le guide métier utile à l'exercice : [durées et grandeurs](durees-et-grandeurs.md), [géométrie 2D](geometrie-2d.md) ou [fonctions et tableaux](fonctions-et-tableaux.md).
4. La [référence mathématique](../../maintenance-moteur/mathematiques/README.md) si le guide pratique ne suffit pas ou si une classe doit être utilisée directement.
5. La [référence du système d'interactivité](../../maintenance-moteur/interactivite/systeme-interactivite.md) quand la réponse attendue dépend d'un comparateur, d'une unité, d'une fraction ou d'une tolérance.

## Habitudes de validation

- Vérifier le rendu HTML et le rendu LaTeX quand le helper produit du texte mathématique, une figure ou un tableau.
- Tester au moins un cas entier, un cas décimal et un cas limite quand l'exercice utilise `Decimal`, `FractionEtendue`, `Grandeur` ou `Hms`.
- Pour une réponse interactive, déclarer explicitement les options utiles dans `handleAnswers()` et essayer une bonne réponse, une réponse équivalente acceptée et une réponse proche qui doit être refusée.
- Pour une figure 2D, contrôler les bornes passées à `mathalea2d()`, la lisibilité des styles et l'alignement dans l'export TikZ.
- Avant d'ajouter un nouveau helper, rechercher un équivalent dans `src/lib/outils/`, `src/lib/2d/`, `src/lib/mathFonctions/` et `src/modules/`.
- Avant de proposer une modification, lancer les validations adaptées : `pnpm prebuild-unit-tests` pour les tests unitaires et `pnpm check:changed` pour le typage.
