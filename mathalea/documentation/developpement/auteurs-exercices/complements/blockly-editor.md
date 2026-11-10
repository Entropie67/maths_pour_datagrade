# BlocklyEditor

Ce guide explique comment utiliser le custom element `blockly-editor` dans un exercice. Pour un exemple complet, partir de `src/exercices/5e/5I1C.ts`. Pour un cas avec variables et callback de vérification, voir `src/exercices/5e/5I1D.ts`.

## Recette simple

1. Initialiser les blocs Blockly avant l'affichage.
2. Construire la boîte à outils (`toolbox`) et les blocs attendus (`solutionBlocks`).
3. Injecter l'éditeur dans `texte` avec `addBloklyEditor()`.
4. Écrire une correction lisible dans `texteCorr`, souvent avec un éditeur non interactif.
5. Déclarer la réponse avec `handleAnswers()` au format `blockly-editor`.

```ts
import { ensureBlocklyBlocksInitialized } from '../../lib/blockly/blocks'
import {
  addBloklyEditor,
  BlocklyEditor,
  type BlocklyEditorOptions,
} from '../../lib/customElements/BlocklyEditor'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

ensureBlocklyBlocksInitialized()

const options: BlocklyEditorOptions = {
  toolbox,
  solutionBlocks,
  height: '250px',
  width: '640px',
  interactivityOn: true,
}

texte += addBloklyEditor(this, i, options)

texteCorr += BlocklyEditor.create({
  id: `blockly-editorCorrEx${this.numeroExercice}Q${i}`,
  options: {
    toolbox,
    initialBlocks: solutionBlocks,
    height: '80px',
    width: '640px',
    interactivityOn: false,
  },
})

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({ solutionBlocks }),
    },
  },
  { formatInteractif: 'blockly-editor' },
)
```

Dans `5I1C.ts`, `solutionBlocks` est produit par `buildBlocklySaySolutionBlocks(expressionAst)`. Le même objet sert à afficher la correction et à vérifier la réponse.

## Objectif

`BlocklyEditor` fournit un mini éditeur Blockly réutilisable dans les exercices MathALÉA, avec :

- rendu HTML interactif ;
- stockage de la réponse élève dans `exercice.answers` ;
- vérification par défaut (comparaison JSON normalisée) ;
- possibilité d'utiliser un callback de vérification nommé (registre).

Implémentation : `src/lib/customElements/BlocklyEditor.ts`

## API publique

### Options

```ts
type BlocklyEditorOptions = {
  toolbox: Blockly.utils.toolbox.ToolboxDefinition
  initialBlocks?: Record<string, unknown>
  solutionBlocks?: Record<string, unknown>
  verifyCallbackName?: string
}
```

### Création côté exercice

```ts
import {
  addBloklyEditor,
  type BlocklyEditorOptions,
} from '../../lib/customElements/BlocklyEditor'

const options: BlocklyEditorOptions = {
  toolbox,
  solutionBlocks,
  verifyCallbackName: 'arith-v1', // optionnel
}

texte += addBloklyEditor(this, i, options)
```

### Vérification par défaut

`BlocklyEditor.verifQuestion(exercice, i)` :

1. lit la réponse attendue depuis `exercice.autoCorrection[i].valeur.reponse.value` ;
2. lit la réponse élève depuis le workspace courant ;
3. compare les deux JSON normalisés (clés triées + métadonnées Blockly volatiles retirées) ;
4. met à jour `resultatCheckEx...`, `feedbackEx...` et `exercice.answers`.

## Registre de callbacks de vérification

Pour des exercices plus complexes, la vérification peut être déléguée à un callback nommé.

### Enregistrement

```ts
import { BlocklyEditor } from '../../lib/customElements/BlocklyEditor'

BlocklyEditor.registerVerificationCallback('arith-v1', (ctx) => {
  // ctx: exercice, questionIndex, editor, studentJson, expectedRaw, expectedSolution
  return {
    isOk: true,
    feedback: '',
    score: { nbBonnesReponses: 1, nbReponses: 1 },
  }
})
```

### Désenregistrement

```ts
BlocklyEditor.unregisterVerificationCallback('arith-v1')
```

### Activation dans l'éditeur

Passer `verifyCallbackName` dans `BlocklyEditorOptions`.

Si un callback est défini :

- `verifQuestion` l'utilise en priorité ;
- sinon, `verifQuestion` revient au comportement par défaut (comparaison JSON).

## Données attendues via handleAnswers

Dans l'exercice, stocker la bonne réponse avec `handleAnswers` :

```ts
handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({ solutionBlocks }),
    },
  },
  { formatInteractif: 'blockly-editor' },
)
```

## Bonnes pratiques

- Toujours appeler `ensureBlocklyBlocksInitialized()` pour définir les blocs custom Blockly.
- Garder `toolbox` et `solutionBlocks` cohérents.
- Si un callback est utilisé, le nom doit être stable et enregistré avant la vérification.
- Pour CAN, surcharger `formatStudentAnswer` si un affichage plus lisible est souhaité.
