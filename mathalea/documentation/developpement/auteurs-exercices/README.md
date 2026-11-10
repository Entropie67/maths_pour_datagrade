# Coder des exercices

Ce niveau rassemble ce qu'il faut connaître pour créer ou modifier un exercice
MathALÉA. Il s'adresse aussi aux personnes qui débutent avec le terminal, Git ou
TypeScript : chaque notion est introduite au moment où elle devient utile.

Les détails d'architecture et les contrats internes sont volontairement placés
dans la [documentation de maintenance du moteur](../maintenance-moteur/README.md).

## Parcours essentiel

Suivez ces pages dans l'ordre pour un premier exercice.

1. [Démarrer dans le dépôt](demarrage.md) : installer les outils, lancer
   MathALÉA et créer une branche. Puis
   [configurer son éditeur](configurer-son-editeur.md) (VSCode, débogage).
2. [Créer un exercice](creer-un-exercice.md) : partir d'un exemple proche,
   déclarer les métadonnées et générer les questions et corrections.
3. [Rédiger un exercice](rediger-un-exercice.md) : titre et consignes à
   l'infinitif, ponctuation, couleur du résultat final.
4. [Ajouter une interactivité simple](interactivite-simple.md) : afficher un
   champ MathLive et enregistrer la réponse attendue.
5. [Valider un exercice](valider-un-exercice.md) : contrôler les rendus et
   lancer les vérifications adaptées.
6. [Partager son travail](partager-son-travail.md) : commit, push, merge
   request, mise à jour de sa branche et conflits.

Ce parcours suffit pour un exercice génératif classique avec une réponse
mathématique simple.

## Compléments selon le besoin

| Besoin                                                | Guide                                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| Proposer des réglages à l'enseignant                  | [Formulaires de paramétrage](complements/formulaires-parametres.md)   |
| Utiliser un format interactif spécialisé              | [Formats interactifs spécialisés](complements/formats-interactifs.md) |
| Choisir comment la réponse de l'élève est comparée    | [Options de comparaison](complements/options-de-comparaison.md)       |
| Combiner des critères ou donner un score partiel      | [Checks composables](complements/checks-composables.md)               |
| Enchaîner plusieurs custom elements dans une question | [Mathalea Couteau Suisse](complements/couteau-suisse.md)              |
| Faire construire une courbe depuis un tableau         | [Traceur de courbe](complements/traceur-de-courbe.md)                 |
| Créer un QCM                                          | [Coder un QCM](complements/coder-un-qcm.md)                           |
| Préparer un export AMC                                | [Export AMC](complements/export-amc.md)                               |
| Créer une figure ou une scène 3D                      | [Faire un exercice 3D](complements/faire-un-exercice-3d.md)           |
| Utiliser Blockly                                      | [BlocklyEditor](complements/blockly-editor.md)                        |
| Utiliser Scratch                                      | [ScratchEditor](complements/scratch-editor.md)                        |
| Utiliser le tableur                                   | [Tableur](complements/tableur.md)                                     |
| Choisir une autre classe ou une génération avancée    | [Variantes d'exercices](complements/variantes-exercices.md)           |
| Coder une question simple ou de Course aux nombres    | [Exercice simple](complements/exercice-simple.md)                     |
| Faire construire une figure dynamique                 | [Géométrie dynamique apiGeom](complements/geometrie-dynamique-apigeom.md) |
| Mettre en forme texte, couleurs et listes             | [Mise en forme](complements/mise-en-forme.md)                         |
| Coder une question, ou des sous-questions a), b)      | [Questions et sous-questions](complements/sous-questions.md)          |
| Corriger un exercice à plusieurs index par question   | [Un index par question](complements/un-index-par-question.md)         |
| Afficher ou calculer des objets mathématiques         | [Recettes mathématiques](mathematiques/README.md)                     |

## Quand passer au niveau moteur

Consultez le niveau moteur si vous devez :

- modifier `Exercice`, le cycle de génération ou le menu des exercices ;
- ajouter un format de réponse ou changer le pipeline de vérification ;
- créer un nouveau custom element ;
- modifier les formats AMC, Typst, LMS ou flashcards ;
- faire évoluer une classe ou un helper mathématique partagé.

Les tests transversaux et la CI restent documentés dans
[Tests et CI](../../tests/README.md).
