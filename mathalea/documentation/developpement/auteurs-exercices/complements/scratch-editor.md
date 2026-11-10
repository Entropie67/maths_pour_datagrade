# ScratchEditor

Ce guide explique comment utiliser le custom element `scratch-editor` dans un exercice. Pour un exemple complet, partir de `src/exercices/5e/5I1C.ts`. Pour un cas avec variables, scénario et callback de vérification, voir `src/exercices/5e/5I1D.ts`.

## Recette simple

1. Construire les blocs attendus (`solutionBlocks`).
2. Injecter l'éditeur dans `texte` avec `addScratchEditor()`.
3. Écrire une correction lisible dans `texteCorr`, souvent avec un éditeur Scratch non interactif.
4. Déclarer la réponse avec `handleAnswers()` au format `scratch-editor`.

```ts
import {
  addScratchEditor,
  type ScratchEditorOptions,
} from '../../lib/customElements/ScratchEditor'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const scratchOptions: ScratchEditorOptions = {
  height: '250px',
  width: '640px',
  interactivityOn: true,
}

texte += addScratchEditor(this, i, scratchOptions)

texteCorr += addScratchEditor(this, i, {
  id: `scratch-editorCorrEx${this.numeroExercice}Q${i}`,
  initialBlocks: solutionBlocks,
  height: '250px',
  width: '640px',
  interactivityOn: false,
  enableRun: false,
  enableStop: false,
})

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({ solutionBlocks }),
    },
  },
  { formatInteractif: 'scratch-editor' },
)
```

Dans `5I1C.ts`, `solutionBlocks` est produit par `buildBlocklySaySolutionBlocks(expressionAst)`. Le même objet sert à afficher la correction et à vérifier la réponse Scratch.

## Avec un programme initial

Quand l'élève doit compléter un programme déjà commencé, passer l'état initial à l'éditeur :

```ts
texte += addScratchEditor(this, i, {
  initialValue: { workspaceXml: initialScratchXml },
  toolbox: scratchToolbox,
  height: '300px',
  width: '100%',
  interactivityOn: true,
})
```

Dans ce cas, stocker aussi les données utiles à la vérification :

```ts
handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({
        solutionBlocks,
        initialBlocks,
        initialScratchXml,
        solutionScratchXml,
        payload,
        variableChoices,
      }),
    },
  },
  { formatInteractif: 'scratch-editor' },
)
```

Ce modèle correspond à `5I1D.ts`. Si un callback est nécessaire, lui donner un nom stable avec `verifyCallbackName` et l'enregistrer avec `ScratchEditorElement.registerVerificationCallback()`.
