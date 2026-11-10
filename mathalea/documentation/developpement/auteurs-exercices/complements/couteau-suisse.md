# Mathalea Couteau Suisse

`mathalea-couteau-suisse` sert à composer plusieurs custom elements interactifs
dans une même question, tout en gardant un seul `formatInteractif` pour le
pipeline de correction.

Il est utile quand une question doit enchaîner plusieurs tâches autonomes, par
exemple :

- un `multi-mathfield` pour plusieurs calculs ;
- un `tableau-signes-variations` ;
- un `mathalea-qcm`.

L'exercice de référence est `src/exercices/2e/2F21-9.ts` : il enchaîne des
calculs d'images, des calculs d'antécédents, un tableau de signes optionnel et
un QCM sur une droite représentative.

## Principe

Le wrapper reçoit deux informations :

- `contenu` : le HTML réellement affiché dans la question, construit avec les
  custom elements enfants ;
- `elements` : la liste des sous-éléments à vérifier, avec l'`autoCorrection`
  attendue par chacun.

Au moment de la correction, `MathaleaCouteauSuisseElement.verifQuestion()`
remplace temporairement l'`autoCorrection` de la question par celle du
sous-élément courant, appelle son `verifQuestion()`, puis additionne les scores.

## Exemple minimal

```ts
import {
  MathaleaCouteauSuisseElement,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import { MathaleaQcmElement } from '../../lib/customElements/MathaleaQcm'
import { MultiMathfieldElement } from '../../lib/customElements/MultiMathfield'

const propositions = [
  { texte: '$d_1$', statut: false },
  { texte: '$d_2$', statut: true },
  { texte: '$d_3$', statut: false },
  { texte: '$d_4$', statut: false },
]

const elements: MathaleaCouteauSuisseChild[] = [
  {
    formatInteractif: 'multi-mathfield',
    autoCorrection: {
      valeur: {
        champ1: { value: image1 },
        champ2: { value: image2 },
      },
    },
  },
  {
    formatInteractif: 'mathalea-qcm',
    autoCorrection: {
      propositions,
      options: { radio: true },
    },
  },
]

this.autoCorrection[i] = {
  formatInteractif: 'mathalea-couteau-suisse',
  elements,
}

this.listeQuestions[i] = MathaleaCouteauSuisseElement.create({
  numeroExercice: this.numeroExercice ?? 0,
  questionIndex: i,
  elements,
  contenu: [
    MultiMathfieldElement.create({
      numeroExercice: this.numeroExercice ?? 0,
      questionIndex: i,
      dataTemplate: '$g(2)=%{champ1}$ et $g(5)=%{champ2}$',
      dataOptions: {
        champ1: {},
        champ2: {},
      },
    }),
    MathaleaQcmElement.create({
      numeroExercice: this.numeroExercice ?? 0,
      questionIndex: i,
      propositions,
      radio: true,
    }),
  ].join('<br>'),
})
```

## Barème

Le score final est la somme des scores retournés par chaque sous-élément, et
`MathaleaCouteauSuisseElement.pointsMaxQuestion()` additionne de même les
`pointsMaxQuestion()` des enfants : le barème affiché dans les paramètres de
l'exercice correspond au score maximal.

Pour un `multi-mathfield`, chaque champ attendu vaut par défaut un point. Un
`multi-mathfield` avec `champ1`, `champ2`, `champ3`, `champ4` rapporte donc
quatre points si les quatre réponses sont justes.

Pour donner un seul point à un sous-élément qui vérifie plusieurs cellules,
comme un tableau de signes, fournir un barème local dans son `autoCorrection` :

```ts
{
  formatInteractif: 'tableau-signes-variations',
  autoCorrection: {
    valeur: {
      reponse: {
        value: JSON.stringify({
          L0C1: zero,
          L1C1: signeAvant,
          L1C3: signeApres,
        }),
      },
      bareme: (listePoints: number[]) => [
        listePoints.every((point) => point > 0) ? 1 : 0,
        1,
      ],
    },
  },
}
```

Dans `2F21-9`, le barème obtenu est :

- 1 point par calcul dans le `multi-mathfield` ;
- 1 point pour le tableau de signes complet, quand il est demandé ;
- 1 point pour le QCM.

## Points d'attention

- Les sous-éléments doivent conserver leurs identifiants habituels :
  `multi-mathfieldEx...`, `tableau-signes-variationsEx...`,
  `mathalea-qcmEx...`. Les vérificateurs existants les recherchent par ces IDs.
- Lorsque plusieurs enfants utilisent le même type de custom element, ou
  partagent les mêmes identifiants de retour (`resultatCheckEx…Q…`,
  `feedbackEx…Q…`, créés par la plupart des composants), leur donner des
  `questionIndex` distincts dans le DOM et reporter chaque index dans l'entrée
  correspondante de `elements` (voir `6N4A-5` : schéma à l'index de la
  question, champ MathLive à l'index décalé de 100). Le couteau suisse installe alors
  temporairement l'`autoCorrection` enfant à cet index pendant la vérification,
  sans créer plusieurs questions persistantes dans l'exercice.
- Dans un `multi-mathfield`, utiliser les champs normalisés `champ1`, `champ2`,
  etc. Après la vérification, le couteau suisse coupe l'interactivité de ses
  enfants : le `multi-mathfield` garde alors ses champs, en lecture seule, avec
  les réponses de l'élève.
- Dans le wrapper, préférer les méthodes `Element.create()` des sous-éléments.
  Les helpers `add...()` modifient souvent directement `autoCorrection[i]` et
  risquent de remplacer le `formatInteractif` global de la question.
- Pour un QCM radio, mettre `radio: true` dans le rendu
  `MathaleaQcmElement.create()` et `options: { radio: true }` dans
  l'`autoCorrection` déléguée.

## Inférence AMC

Un couteau suisse est inféré comme une seule question `AMCHybride`. Chaque
entrée de `elements` est convertie selon son propre `formatInteractif` : les
champs numériques et cellules de tableau deviennent des blocs `AMCNum`, les QCM
deviennent `qcmMono` ou `qcmMult`, et un enfant non transposable devient seul un
bloc `AMCOpen`.

L'exercice doit donc conserver une correspondance stricte : une génération de
question produit une entrée `listeQuestions[i]` et une seule entrée
`autoCorrection[i]`, celle du couteau suisse. Les corrections des enfants sont
stockées dans `autoCorrection[i].elements`, et non à plusieurs index de premier
niveau. Si un helper remplit provisoirement `autoCorrectionAMC` pour un QCM
enfant, retirer ces entrées avant l'inférence afin qu'elles ne soient pas prises
pour des questions AMC indépendantes.
