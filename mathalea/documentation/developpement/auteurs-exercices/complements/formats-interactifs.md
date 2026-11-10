# Formats interactifs spécialisés

Ce cookbook complète
[Ajouter une interactivité simple](../interactivite-simple.md). Il rassemble les
formats spécialisés à utiliser lorsqu'un champ MathLive simple ne suffit pas.

## Le modèle à retenir

Dans une question interactive, il y a presque toujours trois choses à écrire :

1. injecter l'élément interactif dans `texte` ;
2. écrire une correction lisible dans `texteCorr` ;
3. déclarer la réponse attendue avec `handleAnswers()`.

Exemple minimal :

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

// Dans nouvelleVersion(), pour la question i :
texte += 'Question visible par l’élève.'
texteCorr += 'Correction visible après validation.'

handleAnswers(
  this,
  i,
  {
    reponse: { value: reponseAttendue },
  },
  { formatInteractif: 'format-a-utiliser' },
)
```

> **Règle impérative :** une question doit toujours rapporter le même nombre de
> points, quel que soit le tirage. Si le nombre de champs varie, fixez le total
> avec un `bareme` (voir
> [un nombre de points fixe par question](../interactivite-simple.md#règle-impérative--un-nombre-de-points-fixe-par-question)).

Depuis `src/exercices/6e/`, les imports commencent souvent par `../../lib/...`. Depuis `src/exercices/can/6e/`, ils commencent plutôt par `../../../lib/...`.

## Largeur des champs MathLive

Un champ MathLive s'élargit avec ce que l'élève saisit : sa largeur de départ
est un **plancher**, pas une taille fixe. Viser la taille d'une réponse
courante, le champ s'étend si la réponse est plus longue.

| Format                       | Largeur de départ                  | S'étend avec la saisie ?                                   |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `ajouteChampTexteMathLive()` | 50 px                              | oui, sans limite                                           |
| `remplisLesBlancs()`         | petite largeur (le trou vide)      | oui, le trou grandit dans la formule                       |
| `addMultiMathfield()`        | `minWidth` de chaque champ (30 px) | oui, jusqu'à la largeur de la ligne, ou jusqu'à `maxWidth` |
| `tableau-mathlive`           | petite largeur par cellule         | oui, la cellule et la colonne s'élargissent                |
| liste déroulante, QCM        | fixe                               | non : ce ne sont pas des champs MathLive                   |

À retenir :

- le `minWidth` d'un `multi-mathfield` règle seulement la largeur de départ et
  ne plafonne rien : pour une réponse longue (enchaînement de calculs,
  expression développée), un `minWidth` de 150 px suffit, la saisie reste
  entièrement visible en s'allongeant ;
- pour **empêcher** l'élargissement (champ volontairement court, comme un
  exposant ou un chiffre isolé), donner un `maxWidth` dans les options du champ
  d'un `multi-mathfield` ; les autres formats n'ont pas d'option équivalente ;
- au-delà de la largeur de la ligne, la saisie défile à l'intérieur du champ
  (`multi-mathfield`) ou fait déborder la page (champ simple).

# liste des éléments interactifs

## Champ MathLive simple

À utiliser pour saisir un nombre, une fraction, un calcul, une expression ou une grandeur.

```ts
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

const resultat = a + b

texte += `$${a}+${b}=$ `
texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)

texteCorr += `$${a}+${b}=${resultat}$`

handleAnswers(
  this,
  i,
  {
    reponse: { value: resultat },
  },
  { formatInteractif: 'mathalea-mathfield' },
)
```

Le helper injecte un custom element `mathalea-mathfield`.

### Ajouter des touches propres à une question

Les `KeyboardType` sont des claviers figés. Quand une question a besoin de
touches qui lui sont propres (une variable, une notation, un modèle
d'expression), utiliser `KeyboardType.clavierPersonnalisable` — chiffres et
opérations de base — et lui passer ces touches :

```ts
texte += ajouteChampTexteMathLive(
  this,
  i,
  KeyboardType.clavierPersonnalisable,
  { dataKeys: ['u_n', 'q', 'POW', '+\\infty'] },
)
```

Elles apparaissent dans un bloc « Pour cette question », en tête du clavier.
Pour séparer les touches en plusieurs blocs, comme sur les claviers existants,
passer une liste de listes : chaque sous-liste forme un bloc.

```ts
{
  dataKeys: [
    ['[', ']', ';'],
    ['\\emptyset', '\\mathbb{R}'],
    ['\\cup', '\\cap'],
  ]
}
```

Quand un bloc personnalisé contient les dix chiffres, le mode réduit les
présente dans l'ordre `1 2 3 4 5 6 7 8 9 0`, comme les claviers standards.
Le mode pavé conserve l'ordre déclaré dans `dataKeys`, ainsi que les autres
touches et les sélections de chiffres incomplètes.

Chaque touche est décrite par une chaîne :

- un nom de raccourci prédéfini (`POW`, `SQRT`, `FRAC`, `VECT`,
  `SIGMA`, `PMATRIX11`…) donne la touche correspondante ;
- toute autre chaîne est du LaTeX inséré tel quel, affiché sur la touche entre
  `$…$` (`a`, `\pi`, `u_n`, `\overrightarrow{AB}`…) ;
- les emplacements MathLive (`#0`, `#1`, `#@`) sont affichés comme des carrés
  et conservés à l'insertion, si bien que le curseur se place dans le trou :
  `f(#0)` affiche `f(□)`.

Les raccourcis disponibles et cette mécanique vivent dans
`src/components/keyboard/lib/touchesPersonnalisees.ts`. Le clavier lit ces
touches dans l'attribut `data-keys` du champ au moment où il prend le focus :
elles changent donc d'une question à l'autre.

Pour un texte à trous, passer ces mêmes touches dans le sixième argument de
`remplisLesBlancs()`. Pour afficher uniquement les touches demandées, choisir
`KeyboardType.clavierEntierementPersonnalisable` (aucun bloc prédéfini) :

```ts
texte += remplisLesBlancs(
  this,
  i,
  'u_n=%{champ1}',
  KeyboardType.clavierEntierementPersonnalisable,
  '\\ldots',
  {
    dataKeys: [
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ','],
      ['+', '-', '\\times', 'n'],
    ],
  },
)
```

## Calcul en plusieurs étapes

À utiliser quand l'élève doit pouvoir détailler un calcul ligne par ligne
(`A = …`, `A = …`, `A = …`), comme dans
[4C11](../../../../src/exercices/4e/4C11.ts).

```ts
import { addPossibleMultiLinesAnswer } from '../../lib/customElements/PossibleMultiLinesAnswerElement'

handleAnswers(this, i, { reponse: { value: a + b * c } })
texte += addPossibleMultiLinesAnswer(this, i, {
  prefix: 'A =',
  style: KeyboardType.clavierDeBase,
  bareme: 'toutOuRien', // ou 'etapes'
})
```

Le helper injecte un custom element `possible-multi-lines-answer` et pose le
`formatInteractif` de la question. Il doit être appelé **après**
`handleAnswers()`. L'élève voit une ligne `A = [champ]` suivie d'un bouton
discret ⊕ (un plus dans un cercle) : un clic recopie la saisie sur une nouvelle
ligne au-dessus et vide la ligne finale.

Sur la première question de l'exercice (`questionIndex` 0), un message en
`bleuMathalea` s'affiche à côté du ⊕ : « Tu peux directement donner le résultat
ou cliquer sur le + pour faire le calcul en plusieurs étapes. ». Il disparaît
dès que l'élève ajoute une 2e ligne. L'option `aide` force (`true`) ou
supprime (`false`) ce message pour une question donnée.

Avant la vérification, les lignes vides sont supprimées et la dernière ligne
remplie devient la réponse finale. Un ajout de ligne laissé sans saisie ne
pénalise donc pas l'élève. Si toutes les lignes sont vides, la question reste
sans réponse.

Chaque ligne intermédiaire non vide doit être égale à la réponse attendue, sous
n'importe quelle forme (comparaison par défaut avec `value` convertie en
LaTeX). Elle est marquée d'une coche verte ou d'une croix rouge discrètes ; une
ligne fausse est barrée en diagonale en restant lisible. La dernière ligne est vérifiée
exactement comme un champ MathLive simple (options de comparaison, `compare`,
`callback`, feedback) et reçoit le smiley habituel quand tout est réussi. Si une
étape est fausse, un résultat final juste reçoit seulement une coche verte. Le
motif d'une ligne fausse s'affiche à côté de cette ligne : « Cette ligne n'est
pas égale à l'expression de départ. ». L'option `valeurDeDepart` (LaTeX sans
dollars, par exemple `texNombre(n)`) cite l'expression : « Cette ligne n'est pas
égale à $360$. ».

L'option `produitSeulement: true` impose que chaque ligne intermédiaire soit un
produit d'entiers (multiplications et puissances, check `onlyProduct`) : pour
`90`, `9\times10` est accepté mais `80+10` est refusé, même si les deux sont
égaux à 90. Une telle ligne reçoit le message « Ce n'est pas un produit. » ; un
produit de valeur différente reçoit « Ce produit n'est pas égal à $90$. ».
Combiner avec un `compare` sur la
réponse finale, par exemple `all([isEqual(), isPrimeFactorization()])`.

Deux barèmes sont proposés, chacun avec un nombre de points fixe par question :

| `bareme`              | Points | Notation                                                                                           | Saisie                                                                                                                         |
| --------------------- | ------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `toutOuRien` (défaut) | 1      | Le point (ou le `bareme` de la réponse) seulement si le résultat et toutes les étapes sont justes. | Les étapes sont corrigées à la vérification. Chaque ligne intermédiaire peut être supprimée avec `×`.                          |
| `etapes`              | 2      | 2 points si tout est juste, 1 point si le résultat est juste malgré une étape fausse.              | Chaque ligne est corrigée dès son ajout puis verrouillée, sans suppression : l'élève corrige son erreur sur la ligne suivante. |

En mode `etapes`, le helper remplace le `bareme` de la réponse pour annoncer
2 points avant toute saisie. Hors HTML ou sans interactivité, le helper ne
retourne rien.

Pour laisser l'enseignant choisir le mode, le module exporte un paramètre et un
commentaire communs, utilisés par tous les exercices concernés (4C11, 5N1G,
4C23, 5N5B…) :

```ts
this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes // 1 : À la fin, 2 : À chaque étape
this.sup3 = 2
this.comment = commentaireMultiLignes

texte += addPossibleMultiLinesAnswer(this, i, {
  prefix: 'A =',
  style: KeyboardType.clavierDeBase,
  bareme: baremeMultiLignes(this.sup3),
})
```

## Algorithme de décomposition en facteurs premiers

À utiliser pour faire poser l'algorithme du cahier (un diviseur premier à
droite, le quotient en dessous, jusqu'à 1) puis écrire la décomposition, comme
dans [5N1L-5](../../../../src/exercices/5e/5N1L-5.ts).

```ts
import {
  ajouteDecompositionFacteursPremiers,
  solutionDecompositionFacteursPremiers,
} from '../../lib/customElements/DecompositionFacteursPremiersElement'

handleAnswers(this, i, {
  reponse: {
    value: texFactorisation(nombre),
    compare: all([isEqual(), isPrimeFactorization()]),
  },
})
texte = ajouteDecompositionFacteursPremiers(this, i, {
  nombre,
  bareme: baremeMultiLignes(this.sup2), // 'toutOuRien' ou 'etapes'
  style: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets, // clavier de la décomposition
})
texteCorr = solutionDecompositionFacteursPremiers(nombre)
```

Le helper pose le `formatInteractif` (`decomposition-facteurs-premiers`) et doit
être appelé **après** `handleAnswers()`, qui porte la décomposition attendue
(vérifiée comme un champ MathLive standard). Le tableau affiche `nombre` en
haut à gauche : ne pas le répéter dans l'énoncé. L'élève saisit un diviseur
(Entrée ou bouton de validation), puis le quotient sur la ligne suivante ; le
champ de la décomposition reste verrouillé jusqu'au quotient 1. Tout diviseur
premier du nombre de la ligne est accepté, pas seulement le plus petit.

Le paramètre « Vérification » est celui du calcul en plusieurs étapes
(`besoinFormulaireVerificationMultiLignes`, `baremeMultiLignes()`) :

| `bareme`     | Points | Comportement                                                                                                                                                                                                                                            |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toutOuRien` | 1      | Rien n'est corrigé pendant la saisie (un bouton efface la dernière saisie). À la vérification, chaque ligne est corrigée par rapport au nombre saisi à la ligne précédente. Le point exige toutes les étapes, l'arrivée à 1 et la décomposition justes. |
| `etapes`     | 2      | Chaque diviseur et chaque quotient est corrigé dès sa validation. Une saisie fausse est barrée en rouge, reste visible, et l'élève la corrige juste à côté. 2 points si tout est juste, 1 si la décomposition est juste malgré une étape fausse.        |

Sans interactivité, le helper retourne le tableau vide à remplir ; en LaTeX
(`array`) et en Typst (`table`), il produit le même tableau, et
`solutionDecompositionFacteursPremiers()` le tableau rempli. La valeur du
composant (`{ etapes, final }`) garde les tentatives fausses avec leur verdict,
ce qui permet de restituer les saisies barrées dans Capytale.

## Bouton de réponse prédéfinie

À utiliser quand une réponse revient telle quelle et serait pénible à saisir au
clavier MathLive, typiquement « Pas factorisable » quand l'énoncé demande de
factoriser « si possible ».

```ts
import { boutonReponsePredefinie } from '../../lib/interactif/boutonReponsePredefinie'

handleAnswers(this, i, {
  reponse: { value: '\\text{Pas factorisable}' },
})

if (this.interactif) {
  texte += boutonReponsePredefinie({
    numeroExercice: this.numeroExercice,
    indiceQuestion: i,
    label: 'Pas factorisable',
  })
}
```

Le bouton remplit le champ MathLive de la question avec `valeur` (par défaut
`\text{label}`). Il n'a de sens qu'en interactif, d'où le test sur
`this.interactif`.

Si une seule question de l'exercice appelle cette réponse, ajouter le bouton à
**toutes** les questions : sinon il désigne la bonne réponse. Voir
[2N41-2](../../../../src/exercices/2e/2N41-2.ts), [1AL22-2](../../../../src/exercices/1e/1AL22-2.ts)
et [1AL22-1](../../../../src/exercices/1e/1AL22-1.ts).

## Champ texte simple

À utiliser pour une réponse textuelle sans MathLive.

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'

texte += `Nommer la figure : `
texte += ajouteChampTexte(this, i, '', { placeholder: 'Réponse' })

texteCorr += 'La figure est un rectangle.'

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: 'rectangle',
      options: { texteSansCasse: true },
    },
  },
  { formatInteractif: 'mathalea-textfield' },
)
```

Le helper injecte un custom element `mathalea-textfield`.

Pour accepter des fautes d'orthographe courantes tout en les signalant, fournir
une fonction `compare` qui renvoie `{ isOk: true, feedback: "Attention à
l'orthographe : écrire « cylindre »." }` quand la saisie figure dans une liste
de fautes tolérées. La question est réussie (les points sont entiers), mais
l'élève voit la remarque. Voir
[6G8A-2](../../../../src/exercices/6e/6G8A-2.ts) (`compareAvecFautesToleres()`),
qui propose aussi la même question en liste déroulante ou en QCM.

## Texte à trous

À utiliser quand plusieurs champs doivent apparaître dans une même phrase ou formule.

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'

texte += remplisLesBlancs(
  this,
  i,
  '%{champ1}+%{champ2}=%{champ3}',
  '',
  '\\ldots',
)

texteCorr += `$${a}+${b}=${a + b}$`

handleAnswers(
  this,
  i,
  {
    champ1: { value: a },
    champ2: { value: b },
    champ3: { value: a + b },
  },
  { formatInteractif: 'fill-in-the-blank' },
)
```

Le modèle s'écrit sans `$` : le helper l'entoure lui-même de `$` quand l'interactivité est désactivée (les champs y deviennent `\ldots`). Le helper injecte un custom element `fill-in-the-blank`. Les noms `champ1`, `champ2`, etc. doivent être les mêmes dans le modèle et dans `handleAnswers()`.

## Tableau MathLive

À utiliser pour saisir des réponses dans un tableau.

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  AddTabDbleEntryMathlive,
  creeTableauMathliveElement,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'

const tableau = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
  ['', 'Prix'],
  ['Quantité'],
  [''],
)

texte += creeTableauMathliveElement({
  numeroExercice: this.numeroExercice,
  question: i,
  tableau,
  typeTableau: 'doubleEntree',
})

texteCorr += `Le prix est $${prix}$ €.`

handleAnswers(
  this,
  i,
  {
    L1C1: { value: prix },
  },
  { formatInteractif: 'tableau-mathlive' },
)
```

Le helper injecte un custom element `tableau-mathlive`.

## Tableau hybride

À utiliser quand certaines cellules d'un tableau doivent être complétées par des
nombres et d'autres par des réponses textuelles choisies dans une liste
déroulante.

```ts
import { creeTableauHybrideElement } from '../../lib/customElements/TableauHybride'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

texte += creeTableauHybrideElement({
  numeroExercice: this.numeroExercice,
  questionIndex: i,
  tableau: {
    rows: [
      [
        { type: 'text', texte: 'Jour', header: true },
        { type: 'text', texte: 'Lundi', header: true },
      ],
      [
        { type: 'text', texte: '8h - 9h', header: true },
        {
          type: 'select',
          id: 'L1C1',
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'Mathématiques', value: 'Mathématiques' },
            { label: 'Français', value: 'Français' },
          ],
          choix0: true,
        },
      ],
    ],
  },
})

handleAnswers(
  this,
  i,
  {
    L1C1: { value: 'Mathématiques' },
  },
  { formatInteractif: 'tableau-hybride' },
)
```

Les cellules à compléter gardent les identifiants `LxCy`, comme
`tableau-mathlive`. Une cellule `type: 'mathfield'` est corrigée avec la
comparaison MathLive habituelle ; une cellule `type: 'select'` attend une valeur
exacte parmi les choix proposés.

Les cellules `type: 'text'` peuvent porter `header: true` pour styliser les
en-têtes de ligne ou de colonne. Pour une liste déroulante avec une valeur
d'attente, placer par convention `{ label: 'Choisir', value: '' }` en premier
choix et activer `choix0: true`.

En HTML, le tableau reprend la classe `tableauMathlive` et donc les styles
partagés définis dans `app.css`, aussi bien en mode interactif que statique.

Le helper suit le contrat des autres custom elements : `interactivityOn: false`
produit un tableau statique à compléter, en laissant des `...` dans les cellules
interactives. `correctionOn: true` produit un tableau complété statique. Dans ce
mode de correction, les cellules `mathfield` et `select` doivent porter leur
`value` ; les valeurs numériques sont affichées avec `miseEnEvidence`, les
valeurs textuelles avec `texteEnCouleurEtGras`. Hors HTML, `create()` renvoie un
tableau LaTeX statique ; en Typst, il renvoie le même rendu statique que le HTML
sans interactivité.

Lors de la vérification interactive, le composant passe en lecture seule sans
reconstruire le tableau afin de conserver les saisies visibles dans les champs.

### Des champs dans les cellules d'un tableau

Une cellule vide de `AddTabDbleEntryMathlive` ne contient qu'un seul champ. Quand une cellule doit contenir plusieurs trous (par exemple `\ldots + \dfrac{\ldots}{10} + \dfrac{\ldots}{100}`), on y place un `fill-in-the-blank` : la cellule est alors une cellule HTML (`latex: false`) dont le texte est le custom element.

```ts
import { FillInTheBlankElement } from '../../lib/customElements/FillInTheBlank'

const cellule: Icell = {
  texte: FillInTheBlankElement.create({
    id: `champTexteEx${numeroExercice}Q0L${ligne}C${colonne}`, // id du math-field
    elementId: `fill-in-the-blankEx${numeroExercice}Q0L${ligne}C${colonne}`, // id de l'élément
    numeroExercice,
    questionIndex: 0,
    dataKeyboard,
    content: '\\placeholder[a]{}+\\dfrac{\\placeholder[b]{}}{10}',
  }),
  latex: false,
  gras: false,
  color: 'black',
}
```

`elementId` est indispensable dès qu'une question contient plusieurs `fill-in-the-blank` : sans lui, tous les éléments partagent l'identifiant `fill-in-the-blankEx<n>Q<i>`.

La vérification par cellule de `verifyTableauMathLive()` ne sait pas lire les trous d'un champ : il faut fournir un `callback` à `handleAnswers()`, qui lit chaque trou avec `getPromptValue(nom)`, le compare avec `fonctionComparaison()`, colore le trou avec `setPromptState(nom, 'correct' | 'incorrect', true)` et renvoie `{ isOk, feedback, score }`. Exemple complet : [`src/exercices/6e/6N2autoB-1.ts`](../../../../src/exercices/6e/6N2autoB-1.ts).

## Éditeur Instrumenpoche

À utiliser pour faire compléter un programme de construction aux instruments.
Voir la page dédiée :
[éditeur Instrumenpoche](editeur-iep.md).

## QCM

À utiliser pour cocher une ou plusieurs propositions.

```ts
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const propositions = [
  { texte: '$4$', statut: true },
  { texte: '$5$', statut: false },
  { texte: '$6$', statut: false },
]

texteCorr += 'La bonne réponse est $4$.'

handleAnswers(
  this,
  i,
  {
    qcm: {
      enonce: texte,
      propositions,
      correction: texteCorr,
      options: { ordered: false, radio: true },
    },
  },
  { formatInteractif: 'mathalea-qcm' },
)

texte += addMathaleaQcm(this, i, { radio: true })
```

`addMathaleaQcm()` injecte un custom element `mathalea-qcm`. Pour un nouvel exercice, préférer ce format moderne à l'ancien helper `propositionsQcm()`, qui reste utile pour maintenir les exercices existants.

## QCM ramifié

À utiliser quand un choix de QCM détermine la question de justification à
afficher. Chaque proposition peut porter son propre barème et sa propre question
de suite.

```ts
import { addMathaleaBranchingQcm } from '../../lib/customElements/MathaleaBranchingQcm'

texte += addMathaleaBranchingQcm(this, i, {
  choices: [
    {
      texte: 'Vrai',
      statut: true,
      points: 1,
      followup: {
        prompt: 'Donner une expression réduite commune.',
        expected: {
          value: '4x',
          options: { developpementEgal: true },
        },
        points: 3,
      },
    },
    {
      texte: 'Faux',
      statut: false,
      points: 1,
      followup: {
        prompt: 'Donner un contre-exemple.',
        texteAvant: '$x=$',
        callback: (answer) => ({
          isOk: answer === '0',
          feedback: 'Ce nombre ne fournit pas un contre-exemple.',
        }),
        points: 3,
      },
    },
  ],
})
```

Le composant injecté est `mathalea-branching-qcm`. La branche affichée est celle
choisie par l'élève, et la vérification additionne les points du choix initial et
ceux de la justification associée.

## Points cliquables dans une figure MathALEA2D

À utiliser quand l'élève doit sélectionner des points dans une figure produite par `mathalea2d()`.

```ts
import {
  addPointsCliquables,
  type PointCliquableData,
} from '../../lib/customElements/PointsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const figureId = `figEx${this.numeroExercice}Q${i}`
const points: PointCliquableData[] = [
  { x: 0, y: 0, id: 'P0', etat: false },
  { x: 1, y: 0, id: 'P1', etat: false },
]
const pointsAttendus: PointCliquableData[] = [
  { x: 0, y: 0, id: 'P0', etat: false },
  { x: 1, y: 0, id: 'P1', etat: true },
]

texte += mathalea2d(
  { id: figureId, xmin: -1, ymin: -1, xmax: 2, ymax: 1 },
  objets,
)
texte += addPointsCliquables({
  numeroExercice: this.numeroExercice ?? 0,
  questionIndex: i,
  figureId,
  points,
})

handleAnswers(
  this,
  i,
  { reponse: { value: JSON.stringify(pointsAttendus) } },
  { formatInteractif: 'points-cliquables' },
)
```

Le custom element `points-cliquables` injecte les groupes SVG dans la figure repérée par `figureId`, gère les clics, ajoute le `span#resultatCheck...` et le `div#feedback...`, puis expose dans `value` la liste JSON des points avec leur état courant. La réponse attendue passée à `handleAnswers()` utilise le même format, avec `etat: true` pour les points qui doivent être cliqués.

## Fractions cliquables

`fractionCliquable()` produit un schéma de fraction dans une figure `mathalea2d()` et l'associe au custom element `fraction-cliquable`. Sans métadonnées d'exercice, il peut encore servir de brouillon interactif.

Pour l'utiliser comme vraie réponse élève dans un nouvel exercice, passer `numeroExercice` et `questionIndex` dans les options, puis déclarer la réponse attendue avec la valeur du schéma :

```ts
const schema = fractionCliquable(0, 0, 2, 4, {
  numeroExercice: this.numeroExercice,
  questionIndex: i,
})

texte += mathalea2d({ xmin: -0.2, xmax: 10, ymin: -1, ymax: 2 }, schema)

handleAnswers(
  this,
  i,
  { reponse: { value: schema.value } },
  { formatInteractif: 'fraction-cliquable' },
)
```

`fraction-cliquable.value` expose la liste JSON des parts avec leur `id` et leur état `etat`. Le setter `value` restaure ces états, ce qui permet la reprise d'une réponse élève.

## Objets cliquables dans une figure MathALEA2D

À utiliser quand l'élève doit sélectionner plusieurs types d'objets dans une figure `mathalea2d()` : point, segment, droite, cercle, polygone ou polyline.

```ts
import {
  addObjetsCliquables,
  type ObjetCliquableData,
} from '../../lib/customElements/ObjetsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const figureId = `figEx${this.numeroExercice}Q${i}`
const objets: ObjetCliquableData[] = [
  { type: 'segment', id: 'AB', x1: 0, y1: 0, x2: 3, y2: 1, etat: false },
  { type: 'cercle', id: 'c', x: 2, y: 2, r: 1, etat: false },
  {
    type: 'polyline',
    id: 'ligne-brisee',
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ],
    etat: false,
  },
]
const objetsAttendus = objets.map((objet) => ({
  ...objet,
  etat: objet.id === 'AB',
}))

texte += mathalea2d(
  { id: figureId, xmin: -1, ymin: -1, xmax: 5, ymax: 4 },
  objets2d,
)
texte += addObjetsCliquables(this, i, { figureId, objets })

handleAnswers(
  this,
  i,
  { reponse: { value: JSON.stringify(objetsAttendus) } },
  { formatInteractif: 'objets-cliquables' },
)
```

Le custom element `objets-cliquables` injecte une couche SVG superposée à la figure. Les zones de clic sont transparentes et élargies avec `hitWidth`, tandis que les objets sélectionnés sont rendus visibles avec `selectedColor`. Le setter `value` restaure l'état depuis le JSON stocké dans `exercice.answers`, notamment pour Capytale. Le helper ajoute aussi le `span#resultatCheck...` et le `div#feedback...`.

## Liste déroulante

À utiliser pour choisir une réponse dans un menu.

```ts
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const choices = [
  { label: 'Choisir', value: '' },
  { label: 'rectangle', value: 'rectangle' },
  { label: 'triangle', value: 'triangle' },
]

texte += choixDeroulant(this, i, { choices, choix0: false })
texteCorr += 'La figure est un rectangle.'

handleAnswers(
  this,
  i,
  { reponse: { value: 'rectangle' } },
  { formatInteractif: 'liste-deroulante' },
)
```

Le helper injecte un custom element `liste-deroulante`. Il ne produit rien
hors HTML ou sans interactivité : prévoir une alternative (voir plus bas).

Chaque choix a une `value`, la chaîne renvoyée quand il est sélectionné et
comparée à la réponse attendue. Préférer des valeurs courtes (`'Uni'`, `'Auc'`)
aux libellés complets. L'affichage du choix est donné par l'une de ces clés :

| Clé     | Affichage                                                          |
| ------- | ------------------------------------------------------------------ |
| `label` | texte, balises HTML acceptées (`'<strong>Important</strong>'`)     |
| `latex` | formule rendue par MathLive (`'\\dfrac{1+\\sqrt{5}}{2}'`)          |
| `svg`   | élément SVG, affiché en 20 × 20 px                                 |
| `image` | URL d'une image, affichée en 30 × 30 px (prévoir une image carrée) |

Un choix peut aussi être une simple chaîne, qui sert alors d'affichage et de
valeur.

Par défaut (`choix0: false`), le premier choix n'est pas sélectionnable : c'est
le texte affiché tant que l'élève n'a rien choisi, avec `value: ''`. Avec
`choix0: true`, il devient un choix comme les autres et est sélectionné au
départ : un élève qui ne répond pas donnerait alors une réponse, peut-être
juste. Garder un premier choix inerte.

### Alternative hors interactivité

`listeDeroulanteToQcm()` transforme les choix en propositions de QCM, pour la
sortie papier ou sans interactivité :

```ts
import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { propositionsQcm } from '../../lib/interactif/qcm'

if (this.interactif && context.isHtml) {
  texte += choixDeroulant(this, i, { choices })
  handleAnswers(
    this,
    i,
    { reponse: { value: bonneReponse } },
    { formatInteractif: 'liste-deroulante' },
  )
} else {
  listeDeroulanteToQcm(this, i, choices, bonneReponse, { vertical: true })
  texte += propositionsQcm(this, i).texte
}
```

`bonneReponse` doit être la `value` d'un des choix. Les choix de `value` vide
sont ignorés. Options : `vertical` et `ordered` (vrais par défaut, pour garder
l'ordre de la liste).

## Multi Mathfield

À utiliser quand plusieurs champs MathLive doivent être coordonnés, mais sans passer par un texte à trous simple.

```ts
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

texte += addMultiMathfield(this, i, {
  dataTemplate: '$x=%{field0}$ et $y=%{field1}$',
  dataOptions: {
    field0: { texteAvant: '' },
    field1: { texteAvant: '' },
  },
})

texteCorr += `$x=${x}$ et $y=${y}$.`

handleAnswers(
  this,
  i,
  {
    field0: { value: x },
    field1: { value: y },
  },
  { formatInteractif: 'multi-mathfield' },
)
```

Le helper injecte un custom element `multi-mathfield`.

### Une liste déroulante parmi les champs

Un champ dont les options contiennent `choices` n'est pas un MathLive mais une
liste déroulante (le custom element `liste-deroulante` est imbriqué dans le
`multi-mathfield`). C'est le seul moyen de mélanger un menu et des champs
MathLive dans une même question, puisqu'une question n'a qu'un seul
`formatInteractif`.

```ts
texte += addMultiMathfield(this, i, {
  dataTemplate: `a) Quelle inconnue choisir ? %{field0}
b) Écrire l'équation : %{field1}`,
  dataOptions: {
    field0: { choices, ldots: true },
    field1: { keyboard: KeyboardType.clavierDeBaseAvecEgal, ldots: true },
  },
})

handleAnswers(
  this,
  i,
  {
    field0: { value: ['d0', 'd1'] },
    field1: { value: equation, options: { egaliteExpression: true } },
  },
  { formatInteractif: 'multi-mathfield' },
)
```

Points à connaître :

- `choices` a le même format que pour `choixDeroulant()` ; ajouter en tête un
  choix neutre `{ label: 'Choisir…', value: '' }` car le premier choix sert
  d'invite et n'est pas sélectionnable (`choix0: false` par défaut) ;
- la comparaison est une égalité stricte avec `value` ; un tableau de valeurs
  permet d'accepter plusieurs choix ;
- les libellés sont du **texte** : éviter le LaTeX, qui n'est pas rendu dans le
  shadow DOM de la liste.

### Une suite de phrase conditionnelle

Dans un gabarit interactif, un élément HTML portant
`data-show-when="field0:oui"` est affiché uniquement si `field0` vaut `oui`.
Il peut contenir du texte, des listes et des champs MathLive :

```ts
dataTemplate: 'La courbe %{field0}<span data-show-when="field0:oui"> une asymptote %{field1}, d’équation %{field2}</span>.'
```

Les champs d'une section masquée ne sont pas exigés à la vérification.
La réponse au champ qui commande la section reste toujours vérifiée.
Prévoir un barème de total constant, par exemple `toutPourUnPoint`, et un
énoncé non interactif explicite (toutes les branches restent visibles dans le
rendu statique du gabarit). Le rétablissement des réponses sauvegardées met
également à jour la visibilité. Voir `src/exercices/TSpe/TSA2-12.ts`.

### Un QCM parmi les champs

Un champ dont les options contiennent `qcm` n'est pas un MathLive mais un QCM
radio imbriqué dans le `multi-mathfield`. Cela permet de mélanger, dans une
même question interactive, des calculs saisis et des choix de conclusion.

```ts
texte += addMultiMathfield(this, i, {
  dataTemplate: `a) Le membre de gauche vaut %{field0}.
b) Le membre de droite vaut %{field1}.
c) Le nombre proposé est-il solution ? %{field2}`,
  dataOptions: {
    field0: { keyboard: KeyboardType.clavierNumbers, ldots: true },
    field1: { keyboard: KeyboardType.clavierNumbers, ldots: true },
    field2: {
      qcm: [
        { label: 'Oui', value: 'oui' },
        { label: 'Non', value: 'non' },
      ],
    },
  },
})

handleAnswers(
  this,
  i,
  {
    field0: { value: membreGauche },
    field1: { value: membreDroit },
    field2: { value: 'oui' },
  },
  { formatInteractif: 'multi-mathfield' },
)
```

Points à connaître :

- `qcm` a le même format de choix que `choixDeroulant()` ;
- la comparaison est une égalité stricte avec `value` ; un tableau de valeurs
  permet d'accepter plusieurs choix ;
- ajouter `vertical: true` dans les options du champ pour afficher les choix les
  uns sous les autres.

### Touches propres à un champ

Chaque champ MathLive d'un `multi-mathfield` a son clavier (`keyboard`). Pour
des touches propres à un champ, combiner `KeyboardType.clavierPersonnalisable`
(chiffres et opérations) ou `KeyboardType.clavierEntierementPersonnalisable`
(aucune autre touche) avec `dataKeys`, comme pour
[`ajouteChampTexteMathLive()`](#ajouter-des-touches-propres-à-une-question) :

```ts
dataOptions: {
  field0: { keyboard: KeyboardType.complexes },
  field1: {
    keyboard: KeyboardType.clavierEntierementPersonnalisable,
    dataKeys: ['VECT', '=', 'A', 'B', 'C', 'D'],
  },
}
```

Modèle : `src/exercices/TEx/TEC2-15.ts` (affixes dans un champ, égalité de
vecteurs dans l'autre).

### Barème personnalisé

La clé `bareme` de `handleAnswers()` reçoit la liste des points des champs
(dans l'ordre de déclaration) et renvoie `[pointsObtenus, pointsPossibles]`.
Elle sert notamment à obtenir un total constant quand le nombre de champs
dépend de la question tirée :

```ts
// Cinq étapes valant chacun un point, même si l'étape b) a plusieurs champs.
const bareme = (points: number[]): [number, number] => [
  points[0] + Math.min(...points.slice(1, 1 + nbChampsEtapeB)) + /* … */ 0,
  5,
]
```

Un exemple complet (liste déroulante, barème constant et corrections dépendant
du choix fait dans la liste) : [`src/exercices/4e/4L13-2.ts`](../../../../src/exercices/4e/4L13-2.ts).

### Corriger selon la réponse donnée dans un autre champ

`compare` peut être une fermeture qui lit l'état courant du composant au moment
de la vérification. C'est ainsi que 4L13-2 corrige les étapes b) à d) en
fonction de l'inconnue choisie à l'étape a) :

```ts
const varianteChoisie = () => {
  const multi = document.getElementById(
    `multi-mathfieldEx${this.numeroExercice}Q${i}`,
  )
  const liste = multi?.shadowRoot?.querySelector(
    'liste-deroulante[data-name="field0"]',
  ) as { value?: string } | null
  return variantes.find((variante) => variante.cle === liste?.value)
}
```

## Sélection de SVG

À utiliser quand l'élève doit sélectionner un ou plusieurs dessins. La réponse est la somme des valeurs des SVG sélectionnés.

```ts
import { addSvgSelection } from '../../lib/customElements/SvgSelectionElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const svgs = [
  { svg: svgA, value: 1 },
  { svg: svgB, value: 2 },
  { svg: svgC, value: 4 },
]

texte += addSvgSelection(this, i, { svgs })
texteCorr += 'Il fallait sélectionner les deux premiers dessins.'

handleAnswers(
  this,
  i,
  { reponse: { value: 3 } },
  { formatInteractif: 'svg-selection' },
)
```

Ici, sélectionner `svgA` et `svgB` donne `1 + 2 = 3`.

## Figure cliquable

À utiliser quand les figures existent déjà dans l'énoncé et que l'élève doit cliquer sur certaines d'entre elles.

```ts
import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'

this.cliqueFiguresArray ??= []
this.cliqueFiguresArray[i] = [
  { id: `figureAEx${this.numeroExercice}Q${i}`, solution: true },
  { id: `figureBEx${this.numeroExercice}Q${i}`, solution: false },
]

texte += `<div id="figureAEx${this.numeroExercice}Q${i}">${svgA}</div>`
texte += `<div id="figureBEx${this.numeroExercice}Q${i}">${svgB}</div>`
texte += addCliqueFigure(this, i)

texteCorr += 'Il fallait cliquer sur la figure A.'
```

Le helper injecte un custom element `clique-figure` et renseigne le `formatInteractif`. Ici, on n'appelle pas `handleAnswers()` : la réponse attendue est portée par `this.cliqueFiguresArray[i]`.

Insérer `addCliqueFigure(this, i)` après les figures, en mode HTML interactif,
pour activer leurs clics dès l'affichage. Déclarer seulement
`cliqueFiguresArray[i]` et `formatInteractif` ne suffit pas à activer la sélection.
La préparation de la vue peut précéder l’insertion de l’énoncé dans le DOM :
le composant doit donc faire partie du HTML de chaque question, après les
figures et après le remplissage de `cliqueFiguresArray[i]`. Cela vaut aussi
pour les exercices hérités et pour les questions contenant des programmes Scratch.

L'élève peut sélectionner plusieurs figures et les désélectionner jusqu'à la
validation. Un halo orange clair indique le survol, et le contour orange indique
la sélection ; aucun des deux ne révèle si la réponse est correcte. La
correction et la note sont calculées à la validation.

Au clavier, Tab et Maj+Tab parcourent les figures dans l'ordre d'affichage.
Entrée ou Espace sélectionne ou désélectionne la figure ayant le focus, sans
faire défiler la page. Chaque figure expose un rôle de case à cocher et son
état (`aria-checked`), avec un nom « Figure 1. », « Figure 2. », etc., complété
par sa description si elle existe. Le focus reste distinct du contour de
sélection. Après validation, les figures sont désactivées et retirées du parcours
de tabulation ; la réponse enregistrée conserve le même format qu'à la souris.

Dans `6G0-4`, décrire la nature du tracé donnerait la réponse : les descriptions
présentent la tâche et les points nommés, et `demandeLaVue` signale ce besoin.
L'accès au clavier permet de répondre sans souris, mais ne remplace pas la
reconnaissance visuelle évaluée (voir
[Accessibilité](../rediger-un-exercice.md#accessibilité)).

## Glisser-déposer

À utiliser quand l'élève doit placer des étiquettes dans des zones.

```ts
import DragAndDrop from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const leDragAndDrop = new DragAndDrop({
  exercice: this,
  question: i,
  consigne: 'Compléter avec les étiquettes disponibles.',
  enonceATrous: '$3+4$ donne %{rectangle1}.',
  nomsZones: ['Résultat de la somme'],
  etiquettes: [
    [
      { id: 'sept', contenu: '$7$' },
      { id: 'huit', contenu: '$8$' },
    ],
  ],
})

this.dragAndDrops ??= []
this.dragAndDrops[i] = leDragAndDrop

texte += leDragAndDrop.ajouteDragAndDrop({
  melange: true,
  duplicable: false,
})

texteCorr += '$3+4=7$.'

handleAnswers(
  this,
  i,
  {
    rectangle1: { value: 'sept' },
  },
  { formatInteractif: 'drag-and-drop' },
)
```

`DragAndDrop.ajouteDragAndDrop()` injecte un custom element `drag-and-drop`. Les zones s'appellent `rectangle1`, `rectangle2`, etc.

L'élève peut aussi répondre sans glisser, au clavier ou par un simple clic ou tap : sélectionner une étiquette, puis activer la zone. Rien à écrire pour cela, mais `nomsZones` doit donner à chaque zone (`nomsZones[0]` pour `rectangle1`, etc.) un nom compréhensible sans voir la page, car il est lu par les lecteurs d'écran : « Position 2 sur 6 dans l'ordre croissant » plutôt que le « Zone 2 sur 6 » utilisé par défaut. Ce nom n'apparaît que dans l'attribut `data-nom-zone`, en mode interactif : il ne change ni les tirages ni les sorties LaTeX et Typst. Les contenus des étiquettes sont lus à partir du MathML de KaTeX (`$\dfrac34$` donne « 3 sur 4 ») et une image doit porter un attribut `alt`.

Pour plusieurs étiquettes dans une zone, déclarer `options: { multi: true, ordered: false }` : leur ordre est alors libre. Ajouter `feedbackOnLabels: true` pour colorer chaque étiquette en vert ou en rouge selon son placement et masquer le bilan textuel global. Un barème par étiquette peut lire les identifiants enregistrés dans ``exercice.answers[`rectangleDNDEx${numeroExercice}Q${question}R${zone}`]`` (séparés par `;`) ; son maximum doit rester fixe.

## Relier les étiquettes

À utiliser pour un appariement : deux colonnes d'étiquettes carrées que l'élève relie deux à deux.

```ts
import {
  addRelierEtiquettes,
  type LienRelier,
} from '../../lib/customElements/RelierEtiquettesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const gauche = [
  { id: 'G0', texte: 'positif' },
  { id: 'G1', texte: 'strictement positif' },
]
const droite = [
  { id: 'D0', texte: '$n > 0$' },
  { id: 'D1', texte: '$n \\geqslant 0$' },
]
const liens: LienRelier[] = [
  { gauche: 'G0', droite: 'D1' },
  { gauche: 'G1', droite: 'D0' },
]

texte += addRelierEtiquettes(this, i, {
  gauche,
  droite,
  interactivityOn: this.interactif,
})

handleAnswers(
  this,
  i,
  { reponse: { value: JSON.stringify(liens) } },
  { formatInteractif: 'relier-etiquettes' },
)
```

Points à connaître :

- les étiquettes se passent en chaînes (`['positif', 'négatif']`, identifiants `G0`, `G1`… et `D0`, `D1`… attribués automatiquement) ou en objets `{ id, texte }` quand l'exercice a besoin d'identifiants stables ;
- le contenu d'une étiquette est du **texte** éventuellement mêlé de LaTeX entre `$` (rendu par KaTeX), pas du HTML ;
- l'élève relie au clic (une étiquette puis l'autre), au doigt ou en glissant d'une colonne à l'autre ; un lien déjà tracé se retire en le refaisant ou en cliquant dessus ;
- par défaut une étiquette ne porte qu'un seul lien (un nouveau lien remplace le précédent) ; passer `multiple: true` pour lever cette limite ;
- `value` est le JSON des liens `{ gauche, droite }` ; c'est aussi le format attendu par `handleAnswers()` et par la restauration des copies ;
- la correction colore les traits (vert juste, rouge faux, pointillés verts pour un lien manquant) et le score est proportionnel au nombre de liens justes ;
- pour afficher la solution dans `texteCorr`, appeler `RelierEtiquettesElement.create({ id: …, gauche, droite, liens, interactivityOn: false })` avec un **id distinct** de celui de l'énoncé.

Le composant produit aussi les sorties imprimées : une figure TikZ en LaTeX et une figure Typst native (sans paquet externe), avec les mêmes couleurs de traits. Voir [le custom element](../../maintenance-moteur/interactivite/relier-etiquettes.md).

## Schéma en barre

À utiliser pour faire modéliser un problème arithmétique : l'élève choisit
parmi les six schémas en barre (additif ou multiplicatif ; parties-tout,
comparaison ou comparaison avec total), puis en complète les textes avec les données de l'énoncé et un
« ? » pour la valeur cherchée.

```ts
import {
  addSchemaEnBarre,
  type SchemaEnBarreAttendu,
} from '../../lib/customElements/SchemaEnBarreElement'

const attendu: SchemaEnBarreAttendu = {
  type: 'multiplicatif-parties-tout',
  textes: { part: '6', nombreDeParts: '4', tout: '?' },
  nbRectangles: 4,
}

texte += addSchemaEnBarre(this, i, { attendu })
```

Points à connaître :

- `attendu` pose `formatInteractif` et la réponse attendue : pas de
  `handleAnswers()` à appeler ;
- seule la place des nombres est vérifiée : pour chaque texte de
  `attendu.textes` qui contient un nombre, le texte saisi à la même place
  doit contenir ce nombre, quel que soit son habillage (`12`, `12 km`,
  `Matin\n12 pages`) ; les textes sans nombre (`?`, une étiquette) ne sont
  pas jugés ;
- `attendu.textesIndicatifs` s'affiche dans la correction sans être vérifié
  (les étiquettes A et B, que l'élève nomme librement) ;
- un texte de rectangle peut tenir sur deux lignes avec `\n` (« Roses », puis
  « 6 fleurs ») dans le schéma figé de la correction ;
- dans un schéma additif parties-tout, les deux parties peuvent être
  échangées ;
- `nbRectangles` (2 à 5, ou `'plus'` pour trois rectangles suivis de
  pointillés) n'est vérifié que s'il est fourni ; l'omettre quand le nombre de
  parts est l'inconnue ;
- `typeImpose` supprime le choix entre les six schémas : l'élève ne fait
  que compléter ;
- l'accolade « Tout » d'une comparaison dépend du type :
  `additif-comparaison-total` et `multiplicatif-comparaison-total` la dessinent,
  `additif-comparaison` et `multiplicatif-comparaison` non ; un problème qui
  fait intervenir le total attend donc le type avec total ;
- pour afficher le schéma attendu dans `texteCorr`, appeler
  `addSchemaEnBarre(this, i, { initialState, interactivityOn: false, id })`
  avec un **id distinct** de celui de l'énoncé (ni `attendu`, ni
  `handleAnswers()` : la correction ne doit pas écraser la réponse attendue) ;
- sans interactivité, `create()` imprime le gabarit vide du schéma quand le
  type est imposé, et rien sinon (l'élève dessine le schéma lui-même).

Une banque de problèmes prêts à l'emploi, avec leur schéma attendu, leurs
calculs et leur phrase de conclusion, est dans
`src/lib/problems/problemesSchemasEnBarre.ts` ; `6N4A-5` la combine avec un
champ MathLive dans un `mathalea-couteau-suisse` (voir
[Couteau suisse](couteau-suisse.md)). L'outil du
professeur `P030` affiche le composant seul, pour modéliser un problème au
tableau. Voir
[le custom element](../../maintenance-moteur/interactivite/schema-en-barre.md).

## Multiples champs dans une figure 2D

À utiliser quand un champ doit être posé dans une figure produite par `mathalea2d()`.

```ts
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { mathalea2d } from '../../modules/mathalea2d'

const input = new MetaInteractif2d(
  [
    {
      content: '%{champ1}\\text{ cm}^2',
      x: 2,
      y: 1,
      classe: '',
      blanc: '\\ldots ',
      opacity: 1,
      index: 0,
    },
  ],
  { exercice: this, question: i },
)

texte += mathalea2d({ xmin: 0, ymin: 0, xmax: 5, ymax: 3 }, [figure, input])
texteCorr += mathalea2d({ xmin: 0, ymin: 0, xmax: 5, ymax: 3 }, [figure])
texteCorr += `Aire : $${aire}\\text{ cm}^2$.`

handleAnswers(
  this,
  i,
  {
    field0: {
      value: aire,
      options: { unite: true },
    },
  },
  { formatInteractif: 'meta-interactif-2d' },
)
```

`mathalea2d()` injecte les custom elements `meta-interactif-2d` autour des champs. Les réponses s'appellent `field0`, `field1`, etc., selon l'`index` des inputs.

Chaque champ affiche le smiley habituel 😎 ou ☹️ après vérification. Une
question peut aussi inclure des listes déroulantes hors de la figure, avec les
identifiants `liste-deroulanteEx{numeroExercice}Q{i}field{index}` et les réponses
`field{index}` correspondantes.

Le barème par défaut est `toutPourUnPoint`. Pour attribuer un point à chaque
champ, ajouter `bareme: toutAUnPoint` aux réponses de `handleAnswers()` ; le
maximum annoncé aux plateformes prend aussi ce barème en compte. Le nombre de
champs doit alors rester fixe quel que soit le tirage, conformément à la
[règle du barème fixe](../interactivite-simple.md#règle-impérative--un-nombre-de-points-fixe-par-question).

## Demi-droite interactive

À utiliser pour placer un ou plusieurs points sur une demi-droite graduée (qui peut se transformer en droite avec l'option showNegative)

```ts
import { demiDroiteInteractive } from '../../lib/customElements/demi_droite_interactive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

texte += demiDroiteInteractive(this, i, {
  x0: 0,
  minT: 0,
  maxT: 10,
  partsCount: 10,
  subdivisionMode: 'axis',
  showEqualityMarks: false,
  points: [],
})

texteCorr += 'Le point attendu est en $3$.'

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({
        x0: 0,
        maxT: 10,
        partsCount: 10,
        showwNegative: false,
        points: [{ pointValue: 3, label: 'A' }],
      }),
    },
  },
  { formatInteractif: 'demi-droite-interactive' },
)
```

La réponse attendue est une configuration sérialisée, pas seulement l'abscisse du point. L'objet `points` contient les points que l'élève doit placer, avec leur `pointValue` et leur `label`. `showEqualityMarks: false` masque les marques d'égalité de longueur quand les graduations sont très serrées. `axisMin` permet de fixer la borne gauche visible quand `showNegative` ne doit pas produire une portion symétrique par rapport à 0. La clé `showwNegative` correspond au nom historique encore accepté par certains affichages de réponses. Vérifier un exercice existant proche, par exemple `6N3D-2.ts`, si plusieurs points ou des fractions sont attendus.

`subdivisionMode` choisit l'interprétation de `partsCount` :

- `'axis'` (valeur par défaut) partage toute la portion visible en
  `partsCount` parts ;
- `'unit'` partage chaque unité en `partsCount` parts. Dans ce second mode,
  avec `partsCount: 1` au départ, les clics successifs sur le bouton `+`
  produisent des demis, des tiers, des quarts, etc. Ce mode convient pour
  représenter $\frac{3}{7}$ comme trois fois $\frac{1}{7}$.

Hors HTML, `demiDroiteInteractive()` produit une figure statique :

- en LaTeX : un `tikzpicture` ;
- en Typst : une image SVG embarquée dans un marqueur `<mathalea-typst>`.

Quand `interactivityOn` vaut `true`, la demi-droite graduée est affichée sans
les points à placer. Quand `interactivityOn` vaut `false`, les points fournis
dans l'option `points` sont dessinés, ce qui convient au rendu de correction.

## Intervalle sur une droite graduée

À utiliser quand l'élève doit colorier une partie d'une droite graduée et
choisir le sens des crochets. Les deux premiers clics fixent les bornes ; un
clic ultérieur sur une borne intérieure inverse son crochet. Les extrémités de
la droite représentent les infinis et ne portent donc jamais de crochet.

```ts
import {
  addIntervalleDroite,
  type IntervalleDroiteValue,
} from '../../lib/customElements/IntervalleDroiteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const reponse: IntervalleDroiteValue = {
  start: 2,
  end: 5,
  leftBracket: '[',
  rightBracket: null,
}

texte += addIntervalleDroite(this, i, {
  min: -1,
  max: 5,
  labelValue: 2,
})

handleAnswers(
  this,
  i,
  { reponse: { value: JSON.stringify(reponse) } },
  { formatInteractif: 'intervalle-droite' },
)
```

`leftBracket` et `rightBracket` acceptent `'['`, `']'` ou `null`. Utiliser
`null` uniquement lorsque la borne correspond à `min` ou `max`. Chaque
question vaut un point, indépendamment du nombre de clics nécessaires.

## Solveur d'équations et d'inéquations

`mathalea-solveur` fait rédiger une suite de transformations équivalentes à
l'élève. La première ligne reste affichée et chaque clic sur « + » ajoute
une ligne lorsque la transformation est correcte. La dernière ligne non vide
est exposée dans `value` et vérifiée par le bouton standard « Vérifier les
réponses » avec la valeur déclarée dans `handleAnswers()`.

La question n'est comptée juste que si la dernière ligne est la forme résolue
(`isSolvedForm()` : l'inconnue seule d'un côté, un nombre sans calcul à
poursuivre de l'autre) **et** conforme à la valeur attendue. Les fractions
numériques sont acceptées même si elles ne sont pas irréductibles :
`x=\\dfrac{6}{4}` est une réponse finale juste si la solution attendue est
`x=\\dfrac{3}{2}`. Les écritures avec une barre oblique (`x=-5/7`)
et les fractions LaTeX sans accolades autour des chiffres seuls
(`x=-\\frac57`, `x=\\frac{-5}7`) sont également acceptées.
Le dénominateur doit être non nul. Une étape
intermédiaire équivalente à la solution (ex : `x+3-3=7-3`) ne rapporte donc
aucun point.

Lorsque tous les solveurs d'un exercice sont terminés (équation résolue, ou
étape fausse en mode `evaluation`), l'exercice se vérifie tout seul : le
solveur émet l'évènement `solveur-termine` et les vues élève et prof appellent
leur vérification si toutes les questions sont des solveurs
(`src/lib/customElements/solveurTermine.ts`).

Dans la correction, écrire « La solution de l'équation $…$ est $valeur$ » en
ne mettant en évidence que la valeur (`3`, pas `x=3`).

```ts
import { addMathaleaSolveur } from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

texte += addMathaleaSolveur(this, i, {
  initial: '3x+5=17',
  kind: 'equation',
  mode: 'entrainement',
})

handleAnswers(
  this,
  i,
  { reponse: { value: 'x=4' } },
  { formatInteractif: 'mathalea-solveur' },
)
```

(exemple minimal : voir plus bas pour le choix du mode et du barème.)

Hors interactivité (`exercice.interactif` faux), `addMathaleaSolveur` n'écrit
que l'équation (`$3x+5=17$`) : ni boutons, ni cadres, ni lignes d'étapes. Il
n'y a donc rien à tester dans l'exercice. L'option `interactivityOn` n'a besoin
d'être renseignée que pour forcer ce comportement. Un élément créé avec
`interactivity-on="false"` (ex : correction de la CAN) n'affiche lui aussi que
l'équation.

Deux variantes sont disponibles :

- `kind: 'equation'` conserve le signe `=` et contrôle l'équivalence des deux
  membres ;
- `kind: 'inequation'` accepte `<`, `>`, `\\leqslant` et `\\geqslant`, et
  contrôle le retournement du signe lors d'une transformation par un facteur
  négatif.

Le `mode` choisit la façon de traiter une étape fausse :

- `evaluation` : la première étape fausse fige immédiatement le solveur et la
  question est comptée fausse. Elle vaut 1 point.
- `entrainement` : une étape fausse est conservée en rouge et figée, puis une
  nouvelle ligne permet de reprendre depuis la dernière étape correcte. Les
  étapes fausses sont ignorées lors du contrôle d'équivalence et ne deviennent
  jamais la valeur finale du composant. Dans un exercice interactif, avec
  `baremeSolveur('entrainement')`, la question vaut 2 points : 0 si la solution
  n'est pas trouvée, 1 si elle est trouvée malgré au moins une étape fausse, 2
  si elle est trouvée sans aucune étape fausse. Dans un exercice non
  interactif, c'est un brouillon sans note.

Les exercices proposent deux paramètres, qui ne servent pas dans la même
situation :

- une case à cocher « Mode entrainement en non interactif » : l'élément
  s'affiche alors en brouillon dans un exercice non interactif ;
- un choix de barème, utilisé lorsque l'exercice est interactif (1 : sur
  1 point, mode `evaluation`, valeur par défaut ; 2 : sur 2 points, mode
  `entrainement` évalué). `formulaireBaremeSolveur()` fournit sa déclaration et
  `modeSolveur()` convertit sa valeur en mode. `optionsSolveur()` combine les
  deux paramètres et renvoie les options `mode` et `interactivityOn`
  d'`addMathaleaSolveur()`.

Le barème doit toujours être déclaré dans `handleAnswers()` avec
`baremeSolveur(mode)` : c'est lui qui fixe le total de la question (1 ou
2 points), conformément à la règle des points fixes par question. Le
commentaire `commentaireSolveur` décrit ces options à l'enseignant.

```ts
import {
  addMathaleaSolveur,
  baremeSolveur,
  commentaireSolveur,
  formulaireBaremeSolveur,
  modeSolveur,
  optionsSolveur,
} from '../../lib/customElements/MathaleaSolveurElement'

// constructeur : les deux paramètres suivants libres, ici sup et sup2
this.comment = commentaireSolveur
this.besoinFormulaireCaseACocher = ['Mode entrainement en non interactif']
this.sup = false
this.besoinFormulaire2Numerique = formulaireBaremeSolveur()
this.sup2 = 1

// nouvelleVersion()
texte += addMathaleaSolveur(this, i, {
  initial: '3x+5=17',
  ...optionsSolveur(this.interactif, this.sup, this.sup2),
})
handleAnswers(
  this,
  i,
  {
    reponse: { value: 'x=4' },
    bareme: baremeSolveur(modeSolveur(this.sup2)),
  },
  { formatInteractif: 'mathalea-solveur' },
)
```

Un exercice qui mélange des questions avec solveur et d'autres questions doit
garder le même total pour chaque question quel que soit le tirage : voir
`3L15-3`, où les questions sans solveur sont doublées avec le barème sur 2 points.

### Résolution dans C

`complex: true` (équations uniquement, avec `variable: 'z'` en général) fait
résoudre l'équation dans $\mathbb{C}$ :

- `i` est l'unité imaginaire (`i`, `\mathrm{i}` et `\imaginaryI` sont
  équivalents) et le clavier propose la touche `i` (bloc
  `basicOperationsComplexes`) ;
- l'équivalence des étapes est contrôlée sur les complexes, par
  `isEquivalentEquation({ complexes: true })` (voir
  `checks-composables.md`) : multiplier ou diviser les deux membres par un
  complexe non nul, développer, ou écrire une fraction de complexes
  (`z=\dfrac{-1+i}{2+3i}`) est accepté ;
- la forme résolue est la forme algébrique `a+bi` : `a` et `b` sont des entiers,
  des décimaux ou des fractions (`\dfrac{1}{13}+\dfrac{5}{13}i` ou
  `\dfrac{1}{13}+\dfrac{5i}{13}`), et aucun des deux termes n'est nul quand
  l'écriture en comporte deux. Contrairement aux équations dans R, les
  fractions n'ont pas besoin d'être irréductibles : `z=\dfrac{2}{4}+i` rapporte
  les points. `z=\dfrac{1+5i}{13}` ou `z=\dfrac{-1+i}{2+3i}` sont équivalents
  mais pas encore résolus ;
- la valeur attendue de `handleAnswers()` peut être écrite avec
  `Complexe.tex()` (`z=${solution.tex()}`) : elle est comparée numériquement à
  la dernière ligne.

```ts
texte += addMathaleaSolveur(this, i, {
  initial: '(2+3i)z+1-i=0',
  variable: 'z',
  complex: true,
  ...optionsSolveur(this.interactif, this.sup, this.sup2),
})
```

Voir `TEC1-41`.

### Conclusion et équations produit

Chaque ligne validée par le bouton « + » (même icône que le calcul en plusieurs
étapes) est contrôlée. L'option `conclusion` choisit la façon de terminer la
résolution d'une équation dans R :

- `'x='` (défaut) : l'élève s'arrête à `x=…` ;
- `'S='` : une ligne `S =` apparaît une fois l'équation résolue, l'élève y écrit
  l'ensemble des solutions (`\\{-2;3\\}`). C'est cette ligne qui est vérifiée
  avec le `compare` de `handleAnswers()` (ex : `seq([sameSet()])`) ;
- `'phrase'` : l'élève complète « La solution de l'équation est … » ou, après
  une équation produit ou une équation `x^2=a`, « Les solutions de l'équation
  sont … ». Les valeurs sont séparées par des points-virgules (`-2;3`), la
  valeur attendue est de la même forme avec une comparaison `suiteDeNombres`.

Avec `S=` ou `phrase`, une équation `x^2=a` (`a` nombre sans calcul à poursuivre)
est considérée comme résolue : l'élève donne ses deux solutions (aucune si
`a<0`, une seule si `a=0`). La conclusion est contrôlée par rapport aux équations
résolues par l'élève (`x=3`, `x^2=9`...), sans doublon.

`equationProduit: true` (équations dans R uniquement) prépare la résolution par
factorisation d'une équation du second degré (voir `2L22-5`). Dès que la
dernière étape validée est un produit de deux expressions affines égal à zéro
(`(2x+1)(x-3)=0`, `3x(2x+1)=0`, `0=(x+2)(x-5)` ; les facteurs constants non
nuls sont ignorés, `equationsProduitNul()` dans `equationProduit.ts`), le bouton
« Équation produit » s'affiche à côté du « + » :

- il écrit en bleu la propriété du produit nul (`regleProduitNul`) et ouvre
  deux colonnes, une par facteur (`2x+1=0` et `x-3=0`) ; chaque colonne se
  résout comme une équation ordinaire (étapes équivalentes jusqu'à la forme
  résolue) et les colonnes peuvent être traitées dans n'importe quel ordre ;
- la ligne de conclusion n'apparaît que lorsque toutes les équations sont
  résolues (ou, sans passer par le bouton, lorsque l'équation de départ
  elle-même est résolue, par exemple `(x+3)^2=0` ramené à `x=-3`). Avec la
  conclusion `x=`, le solveur se termine à ce moment-là et la valeur attendue
  est la liste des équations résolues (`['x=0', 'x=-1']`, dans n'importe quel
  ordre) ;
- un carré `(x+3)^2=0` n'est pas reconnu comme un produit de deux facteurs
  (le bouton n'apparaît pas) : l'élève peut l'écrire `(x+3)(x+3)=0`.

Le barème est celui du solveur (`baremeSolveur()`) ; en mode `entrainement`, une
étape fausse dans une colonne ou une conclusion fausse compte comme une étape
fausse.

```ts
texte += addMathaleaSolveur(this, i, {
  initial: 'x^2+5x+6=0',
  equationProduit: true,
  conclusion: 'S=',
  ...optionsSolveur(this.interactif, false, this.sup3),
})
handleAnswers(
  this,
  i,
  {
    reponse: { value: '\\{-3;-2\\}', compare: seq([sameSet()]) },
    bareme: baremeSolveur(modeSolveur(this.sup3)),
  },
  { formatInteractif: 'mathalea-solveur' },
)
```

Pour une inéquation résolue sous la forme `x<...`, `x\\leqslant...`, `x>...` ou
`x\\geqslant...`, `showInterval: true` ajoute une représentation en lecture
seule avec `IntervalleDroiteElement`. Les options `intervalMin` et
`intervalMax` fixent la fenêtre affichée :

```ts
texte += addMathaleaSolveur(this, i, {
  initial: '-2x+3<7',
  kind: 'inequation',
  showInterval: true,
  intervalMin: -5,
  intervalMax: 5,
})
```

## Cercle trigonométrique

À utiliser pour sélectionner une position sur le cercle trigonométrique.

```ts
import {
  addTrigoCircleSelection,
  trigoCircleSelectionValue,
} from '../../lib/customElements/TrigoCircleSelectionElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const solutions = question.solutions

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: trigoCircleSelectionValue(
        solutions.map((solution) => solution.angleRad),
      ),
    },
  },
  { formatInteractif: 'trigo-circle-selection' },
)

texte += addTrigoCircleSelection(this, i, {
  showAngleLabels: true,
  showCoordinateLabels: Boolean(this.sup2),
  style: 'display:block; max-width: 46rem;',
  interactivityOn: this.interactif,
})

texteCorr += 'Il fallait sélectionner les points correspondant aux solutions.'
texteCorr += addTrigoCircleSelection(this, i, {
  id: `trigo-circle-selection-correctionEx${this.numeroExercice}Q${i}`,
  showAngleLabels: true,
  showCoordinateLabels: true,
  interactivityOn: false,
  markedPoints: solutions.map((solution) => ({
    angle: solution.angleRad,
    color: '#f15929',
  })),
})
```

`trigoCircleSelectionValue()` transforme la liste des angles attendus en valeur numérique vérifiable par le custom element. Chaque angle vient de `solution.angleRad`, comme dans l'exercice `2mTrigoFct-3.ts`. L'appel à `addTrigoCircleSelection()` est contextuel : en HTML interactif, il produit le custom element ; en LaTeX, il produit un cercle trigonométrique via `mathalea2d` ; en Typst, il embarque un SVG statique. Quand `interactivityOn` vaut `true`, aucun point attendu n'est marqué sur le rendu statique. Quand `interactivityOn` vaut `false`, les points fournis par `markedPoints` sont dessinés, ou à défaut les points déduits de `value`.

## Horloge interactive

À utiliser pour faire régler une heure.

```ts
import { addInteractiveClock } from '../../lib/customElements/InteractiveClock'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import Hms from '../../modules/Hms'

texte += addInteractiveClock(this, i, {
  interactivityOn: this.interactif,
  showHands: this.interactif,
})

texteCorr += addInteractiveClock(this, i, {
  id: `interactive-clock-correctionEx${this.numeroExercice}Q${i}`,
  hour,
  minute,
  interactivityOn: false,
  showHands: true,
})

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: new Hms({ hour, minute }).toString(),
    },
  },
  { formatInteractif: 'interactive-clock' },
)
```

La réponse attendue est la chaîne produite par `Hms.toString()`. Le custom element sauvegarde la réponse élève comme objet sérialisé, puis la vérification reconstruit l'heure attendue avec `Hms.fromString()`, comme dans l'exercice `canc3D04.ts`.

`addInteractiveClock()` gère directement les contextes de sortie :

- en HTML standard, il injecte le custom element interactif ou figé ;
- en LaTeX, il retourne une horloge `mathalea2d` statique ;
- en Typst, il retourne une image SVG embarquée dans un marqueur
  `<mathalea-typst>`.

Quand `showHands` vaut `false`, l'horloge est rendue sans aiguilles, ce qui
convient à l'énoncé interactif. Quand `interactivityOn` vaut `false` avec
`showHands: true`, l'heure fournie est dessinée pour la correction.

## Guide-âne

À utiliser pour un guide-âne interactif dans une construction géométrique.

```ts
import { addGuideAne } from '../../lib/customElements/GuideAne'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

const targetAB = 12
const targetN = 5
const targetP = 3
const targetFraction = `\\dfrac{${targetP}}{${targetN}}`
const targetValue = (targetAB * targetP) / targetN

texte += addGuideAne(this, i, {
  alpha: 45,
  targetAB,
  targetFraction,
  targetValue,
  snapToCentimeter: true,
  disableADrag: true,
  displayTargetOn: false,
})

texteCorr += `$AD=${targetFraction}\\times AB=${targetValue}$ cm.`

handleAnswers(
  this,
  i,
  {
    reponse: {
      value: JSON.stringify({
        n: targetN,
        p: targetP,
        lengthAD: targetValue,
        lengthAB: targetAB,
      }),
    },
  },
  { formatInteractif: 'guide-ane' },
)
```

La réponse attendue est une configuration sérialisée du rapport à construire. `alpha` règle l'inclinaison du guide-âne, mais ce n'est pas la réponse vérifiée. Le custom element vérifie que la construction atteint la cible, comme dans l'exercice `4G30-0.ts`.

## Tableur

À utiliser quand l'élève doit compléter une petite feuille de calcul.

```ts
import { addSheet } from '../../lib/customElements/MySpreadSheet'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

texte += addSheet(this, i, {
  data: [
    ['Nombre', 'Double'],
    [3, ''],
  ],
  minDimensions: [2, 2],
  columns: [{ width: 90 }, { width: 90 }],
  interactif: this.interactif,
  showVerifyButton: false,
})

texteCorr += 'Voici la formule à saisir en cellule B2 : `=A2*2`.'

handleAnswers(
  this,
  i,
  {
    sheetAnswer: {
      goodAnswerFormulas: [
        {
          ref: 'B2',
          formula: '=A2*2',
        },
      ],
      sheetTestDatas: [
        {
          ref: 'A2',
          rangeValues: [1, 20],
        },
      ],
    },
  },
  { formatInteractif: 'my-spreadsheet' },
)
```

La réponse attendue décrit les formules à vérifier, pas les valeurs affichées dans les cellules. Pour un exemple plus complet avec plusieurs situations, partir de `6I1B-7.ts`.

Le tableur a beaucoup d'options. Pour un nouvel exercice, copier d'abord un cas existant proche.

## Tableau de signes ou de variations

À utiliser pour faire compléter un tableau de signes ou de variations.

```ts
import {
  addTableauSignesVariations,
  creerTableauSignesVariations,
} from '../../lib/customElements/TableauSignesVariationsElement'

texte += addTableauSignesVariations(this, i, {
  config,
  interactivityOn: this.interactif,
})

texteCorr += creerTableauSignesVariations(configCorrigee, {
  readonly: true,
  numeroExercice: this.numeroExercice,
  numeroQuestion: i,
})
```

Pour la correction minimale (réponse courte), affecter à
`this.listeReponsesCourtes[i]` le tableau corrigé tout en orange, avec
`{ ...configCorrigee, couleur: orangeMathalea }` : sans cela, la correction
minimale Typst ne retient que les formules `miseEnEvidence()` du texte. Les
cellules `highlight` sont mises en évidence en orange et en gras dans les trois
formats (HTML, Typst, LaTeX).

Ce helper déclare lui-même les données nécessaires à la vérification. Lire aussi `src/lib/interactif/tableauSignesVariations/DOCUMENTATION.md` avant de créer un nouveau tableau.

## Calculatrice à touches cassées

`addCalculator()` affiche une calculatrice dont certaines touches sont
inutilisables ou utilisables un nombre limité de fois. L'élève doit obtenir la
réponse attendue à l'écran ; c'est le dernier résultat affiché qui est
comparé à `value`.

```ts
import { addCalculator } from '../../../lib/customElements/CalculatorElement'

texte += addCalculator(this, i, {
  brokenKeys: ['5', '*'],
  limitedKeys: [{ key: '2', limit: 1 }],
})
handleAnswers(
  this,
  i,
  { reponse: { value: reponse } },
  { formatInteractif: 'my-calculator' },
)
```

Les touches sont désignées par la valeur de leur bouton (tableau `buttons` de
`CalculatorElement.ts`) : chiffres, `+`, `-`, `*`, `/`, `(`, `)`, `.`, `^2`…
Hors HTML, une calculatrice statique est dessinée en LaTeX et en Typst, avec
les touches cassées grisées. Des défis prêts à l'emploi sont dans
`src/lib/calculatrice/defisCalculatriceCassee.ts`. Exemple :
`src/exercices/can/6e/can6C7-07.ts`.

## Couteau suisse

À utiliser quand une même question doit enchaîner plusieurs custom elements
interactifs autonomes. Lire la page dédiée :
[Mathalea Couteau Suisse](couteau-suisse.md).

Exemple de référence : `src/exercices/2e/2F21-9.ts`.

## Scratch et Blockly

Ces éléments servent surtout aux exercices de programmation visuelle.

```ts
import { addScratchEditor } from '../../lib/customElements/ScratchEditor'

texte += addScratchEditor(this, i, {
  height: '250px',
  width: '640px',
  interactivityOn: true,
})
```

```ts
import { addBloklyEditor } from '../../lib/customElements/BlocklyEditor'

texte += addBloklyEditor(this, i, {
  toolbox,
  solutionBlocks,
  height: '250px',
  width: '640px',
  interactivityOn: true,
})
```

Lire [ScratchEditor](scratch-editor.md) ou [BlocklyEditor](blockly-editor.md) avant de créer un exercice avec ces composants. Les exemples à copier sont `src/exercices/5e/5I1C.ts` pour une traduction de calcul en blocs et `src/exercices/5e/5I1D.ts` pour un programme avec variables et callback de vérification.

## DiagramPieAssessmentElement

Ce composant permet de créer un diagramme circulaire interactif.

```ts
import { DiagramPieAssessmentElement } from '../../lib/customElements/DiagramPieAssessmentElement'

texte += addDiagramPieAssessment(this, i, {
            items: [
              {label: 'A', effectif:12},{label: 'B', effectif:8},{label: 'C': effectif: 16}
            ],
            mode: 'angle' as PieAssessmentMode,
            shape: 'pie' as PieAssessmentShape,
            infosStatus: false,
          })
```

Il peut être utilisé selon 3 modes :

- 'angle' demande l'angle associé à chaque label (cas d'usage dans 5D1D-1)
- 'effectif' demande l'effectif associé à chaque label
- 'label' demande le label associé à au choix : l'effectif ou l'angle fourni.

Quand `interactivityOn` vaut `false`, le composant n'affiche plus les
champs interactifs : le diagramme reste vide avec sa légende en dessous, et la
table devient une table statique de conversion. La colonne correspondant au
mode demandé (`angle`, `effectif` ou `label`) contient des cellules vides ; les
autres colonnes visibles sont remplies avec les valeurs fournies ou calculées.
Si une valeur non demandée vaut `null` (`effectif` en mode `angle`, ou `angle`
en mode `effectif`), la cellule statique affiche aussi des pointillés afin de
ne jamais rendre le texte `null`. La valeur `0` reste affichée comme une donnée
valide.
L'option `colorOn`, à `true` par défaut, contrôle les couleurs de légende dans
les rendus statiques. Avec `colorOn: false`, les carrés de légende sont blancs
avec un contour afin de laisser les élèves choisir leurs propres couleurs.

Pour un exemple d'utilisation, un exemple à étudier est `src/exercices/5e/5D1D-1.ts`.
Il contient les versions 'pie' et 'semi-pie' (shape), mais aussi d'autre diagrammes comme le DiagramBarAssessmentElement décrit ci-après.

## DiagramBarAssessmentElement

Ce composant permet de créer un diagramme en barres interactif.

```ts
import { DiagramBarAssessmentElement } from '../../lib/customElements/DiagramBarAssessmentElement'

texte += addDiagramBarAssessment(this, i,{
            unitValue: 200,
            unitLabel: `individus`,
            yMax: 1000,
            mode: 'hauteur' as BarAssessmentMode,
            infosStatus: false,
            interactivityOn: true,
            items:[
              {label: 'A', effectif:12},{label: 'B', effectif:8},{label: 'C': effectif: 16}
            ]})
```

Il peut être utilisé selon 3 modes :

- 'hauteur' demande la hauteur de la barre associée à chaque label (cas d'usage dans 5D1D-1)
- 'effectif' demande l'effectif associé à chaque label (on fournira les hauteurs par exemple)
- 'label' demande le label associé à chaque barre donnée par au choix : sa hauteur ou son effectif.

Quand `interactivityOn` vaut `false`, le diagramme en barres affiche une table
statique complète (`Catégorie`, `Effectifs`, `Hauteurs`) avec des pointillés
pour les valeurs `null`. Sans `correctionOn`, le repère reste vide ; en
correction, passer `correctionOn: true` pour afficher les barres. L'option
`colorOn`, à `true` par défaut, contrôle la couleur des barres ; avec
`colorOn: false`, le rendu HTML et LaTeX utilise des hachures, et le rendu Typst
des niveaux de gris.

Pour un exemple d'utilisation, un exemple à étudier est `src/exercices/5e/5D1D-1.ts`.

## Correction maison (`custom`)

Quand aucun custom element ne convient — c'est le cas des exercices apiGeom, où l'élève construit une figure —, l'exercice corrige lui-même :

```ts
export const interactifReady = true
// Ne pas exporter `interactifType` : le format est déclaré question par question.

export default class MonExercice extends Exercice {
  correctionInteractive = (i: number) => {
    // Sauvegarde de la réponse pour le LMS : la clé doit être l'id de la figure
    this.answers[this.figuresApiGeom![i].id] = figureAnswerJson(
      this.figuresApiGeom![i],
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const { isValid, message } = this.figuresApiGeom![i].checkAngle({
      angle: 90,
      label1: 'A',
      label2: 'B',
      label3: 'C',
    })
    if (divFeedback != null) divFeedback.innerHTML = message
    return isValid ? 'OK' : 'KO'
  }
}
```

`correctionInteractive(i)` renvoie `'OK'` ou `'KO'`. Pour qu'une question rapporte plusieurs points, poser `this.exoCustomResultat = true` dans le constructeur et renvoyer un tableau (`['OK', 'KO', 'OK']`) : chaque entrée vaut un point.

Le moteur n'affiche rien à la place de l'exercice : c'est à `correctionInteractive` d'écrire le feedback dans `#feedbackEx{numeroExercice}Q{i}` et, s'il y a lieu, de figer la figure (`figure.isDynamic = false`).

Le modèle complet est `src/exercices/modèlesExos/20_exercice_classique_apigeom.ts`.

### Toujours indexer par `i`

C'est la condition pour que l'exercice puisse être repris comme une question parmi d'autres par un méta-exercice — une CAN ou une « Sélection d'automatismes » (`1A`, `3A`). Dans ce cas, `correctionInteractive` est appelée avec l'index de la question **dans l'exercice affiché**, qui n'est plus 0.

- `#feedbackEx${this.numeroExercice}Q${i}`, jamais `Q0` ni `Q${0}` ;
- `this.figuresApiGeom[i]`, jamais `[0]` ;
- `figureApigeom({ exercice: this, i, figure })` avec l'indice de la boucle de `nouvelleVersion()`, et la figure rangée dans `this.figuresApiGeom[i]`.

Aucun décalage n'est à gérer dans l'exercice : `figureApigeom()` s'en charge à partir de `this.indexQuestionHote`, posé par le méta-exercice. Le détail du mécanisme est dans [le système d'interactivité](../../maintenance-moteur/interactivite/systeme-interactivite.md#réhébergement-dune-question-custom).

## fin de la liste des éléments

# Bonnes pratiques

## Affichage de la correction

Quel que soit le custom element, `texteCorr` ne doit pas dépendre du widget interactif. Écrire une correction lisible en texte, LaTeX ou figure statique :

```ts
texteCorr += `On calcule $${a}\\times ${b}=${a * b}$.`
```

Pour une figure, utiliser une version non interactive :

```ts
texteCorr += mathalea2d(paramsFigure, objetsCorrection)
```

Ou utiliser le composant en désactivant l'interactivité : `interactivityOn: false`.

```ts
texteCorr += demiDroiteInteractive(this, i, {
  x0: 0,
  minT: 0,
  maxT: 10,
  partsCount: 10,
  points: [{ pointValue: 3, label: 'A' }],
})
```

## Vérifier localement

Après avoir ajouté une interaction :

```bash
pnpm check
pnpm prebuild-unit-tests
```

Pour tester un seul exercice dans la vérification d'interactivité :

```bash
CHANGED_FILES=src/exercices/6e/6M2B-1.ts pnpm exec vitest run tests/integration/interactivity_all.test.ts
```

Remplacer le chemin par celui de l'exercice modifié.
