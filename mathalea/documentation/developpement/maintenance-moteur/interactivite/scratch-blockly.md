# Architecture de Scratch et Blockly

MathALÉA expose deux éditeurs visuels sous forme de custom elements :

- `BlocklyEditor` dans `src/lib/customElements/BlocklyEditor.ts` ;
- `ScratchEditorElement` dans `src/lib/customElements/ScratchEditor.ts`.

L'exercice `6I1D` utilise un composant métier dédié,
`LabyrintheBlocklyElement` dans `src/lib/customElements/LabyrintheBlockly.ts`.
Il encapsule l'éditeur Blockly, le graphe SVG du bus, la simulation et les
listeners associés. L'exercice fournit seulement les données du labyrinthe et
garde sa correction interactive historique.

Les recettes côté exercice sont dans les guides
[Blockly](../../auteurs-exercices/complements/blockly-editor.md) et
[Scratch](../../auteurs-exercices/complements/scratch-editor.md).

## Couches

Les custom elements gèrent le cycle de vie, le rendu, la valeur, la restauration
et l'intégration avec la vérification MathALÉA.

Dans Scratch, `ScratchWorkspaceAdapter` encapsule l'accès au workspace et
`ScratchToolboxBuilder` transforme la description de toolbox vers le format
attendu par la bibliothèque. Le reste du projet ne doit pas manipuler
directement l'implémentation du workspace.

Blockly initialise ses blocs partagés par
`ensureBlocklyBlocksInitialized()` avant la création d'un éditeur.

## Valeur et vérification

La valeur sérialisée doit suffire à :

- restaurer le travail de l'élève ;
- comparer une solution attendue ;
- alimenter `exercice.answers` ;
- afficher une réponse compréhensible dans les corrections lorsque le format le
  permet.

La vérification par défaut compare des données normalisées. Les cas métiers
complexes utilisent un callback nommé enregistré sur la classe de l'éditeur.
Les noms de callbacks font partie du contrat de l'exercice et doivent rester
stables.

## Toolboxes

Les exercices fournissent une structure déclarative. Ils ne doivent pas
construire du XML interne ni dépendre directement de la bibliothèque du
workspace. Les blocs disponibles, les blocs initiaux et la solution doivent être
cohérents entre l'énoncé, la correction et la vérification.

## Rendu et cycle de vie

- le mode interactif crée un workspace éditable ;
- le mode correction ou lecture seule désactive les actions inutiles ;
- la destruction du custom element doit libérer les écouteurs et le workspace ;
- le rendu non HTML doit rester exploitable sans charger l'éditeur.

## Évolution

Avant de modifier la sérialisation ou la normalisation, vérifiez les exercices
`5I1C.ts` et `5I1D.ts`, les callbacks enregistrés et la compatibilité des valeurs
déjà stockées.
