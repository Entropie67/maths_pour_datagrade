# Créer un custom element (convention MathALÉA)

Ce guide impose le pattern à suivre pour tout nouveau custom element du projet.

Objectif : avoir une API homogène pour l'injection HTML, la mise à jour d'affichage, la sérialisation de la réponse élève et la désactivation de l'interactivité.

## Classe de base

Toute nouvelle classe doit étendre `MathaleaCustomElement` dans `src/lib/customElements/MathaleaCustomElement.ts`.

L'implémentation du custom element doit être placée dans `src/lib/customElements/`. Les helpers métier qui appellent `create(...)` ou encapsulent le composant doivent prendre place dans le même fichier que le composant. Les fonctions utilitaires qui ne servent qu'à ce custom element sont également intégrées à ce fichier ; un fichier séparé est réservé à une logique réellement partagée avec d'autres modules.

Exemple de signature minimale :

```ts
export class MonElement extends MathaleaCustomElement {
  static readonly elementTag = 'mon-element'
}
```

## Règles obligatoires

1. Héritage

- La classe étend `MathaleaCustomElement`.
- Le tag est déclaré via `static readonly elementTag`.
- Le tag est en kebab-case (suite de mots en minuscules où les espaces sont remplacés par des tirets - ).
- Le tag sert de valeur à `autoCorrection[questionIndex].formatInteractif`.
- Le fichier de la classe se trouve dans `src/lib/customElements/`.

2. Méthode statique create

- `create(...)` retourne la chaîne à injecter dans l'énoncé : HTML en contexte HTML, ou LaTeX/chaîne vide en contexte non HTML selon les capacités du composant.
- `create(...)` prend un seul argument objet.
- Cet objet contient au minimum :
  - `id?: string`
  - `numeroExercice?: number`
  - `questionIndex?: number`
  - puis les options spécifiques du composant.
- Si `id` est fourni, il est utilisé tel quel.
- Sinon, l'id est construit avec la convention : `${elementTag}Ex${numeroExercice}Q${questionIndex}`.
- Les attributs doivent être passés en camelCase ; la base les convertit en kebab-case.
- Si le composant possède une sortie imprimable (`renderLatex()`), sa méthode `create(...)` doit gérer explicitement le contexte non HTML : instancier l'élément en mémoire, initialiser son état métier depuis les options, puis retourner `renderLatex()`.
- Si le composant possède une sortie Typst native (`renderTypst()`), `create(...)` doit traiter `context.isTypst` avant le cas LaTeX et retourner `<mathalea-typst>${codeTypst}</mathalea-typst>`. Ce marqueur est inséré tel quel par `htmlToTypst()`.
- Si le composant n'a pas de sortie non HTML exploitable, le comportement par défaut de `MathaleaCustomElement.create(...)` suffit : il retourne une chaîne vide hors HTML.

### Cahier des charges des sorties

Un custom element pédagogique doit choisir sa sortie selon le contexte global :

- `context.isHtml === true` et `context.isTypst === false` : `create(...)`
  retourne un élément HTML. Celui-ci peut être interactif ou figé selon
  `interactivityOn`.
- `context.isTypst === true` : `create(...)` retourne un marqueur
  `<mathalea-typst>...</mathalea-typst>` contenant le Typst pur produit par
  `renderTypst()`. La vue Typst régénère les exercices avec `context.isHtml`
  encore vrai, donc ce cas doit être testé avant la branche HTML standard.
- `context.isHtml === false` : `create(...)` retourne le code LaTeX équivalent,
  produit par `renderLatex()`, ou une chaîne vide si le composant n'a pas de
  rendu imprimable.

Pour les composants d'évaluation, `interactivityOn` pilote aussi la sortie
imprimable :

- `interactivityOn === true` : version énoncé/évaluation, avec les zones à
  compléter ou le support graphique vide attendu.
- `interactivityOn === false` : version correction complète, avec données,
  figure et éléments d'identification nécessaires.

3. Helper d'instanciation côté exercice

- Chaque composant expose une fonction helper (par exemple `addXxx(...)`) servant d'interface stable pour les exercices.
- Signature attendue du helper :
  - 1er argument : `exercice` (instance `IExercice`)
  - 2e argument : `questionIndex` (un nombre entier)
  - 3e argument : objet d'options du composant (incluant éventuellement `id`).
- Le helper appelle `create(...)` en transmettant `numeroExercice: exercice.numeroExercice` et `questionIndex`.
- Le type du 3e argument doit être exporté (ex. `XxxOptions`) pour un usage typé dans les exercices.

Exemple :

```ts
export type DemiDroiteInteractiveOptions = {
  x0?: number
  initialT?: number
  minT?: number
  maxT?: number
  partsCount?: number
  subdivisionMode?: 'axis' | 'unit'
  axisMin?: number
  showNegative?: boolean
  showEqualityMarks?: boolean
  multiplePoints?: boolean
  interactivityOn?: boolean
  points?: ValeurPoint[]
  id?: string
  pointsColor?: string
}

export function demiDroiteInteractive(
  exercice: IExercice,
  questionIndex: number,
  options?: DemiDroiteInteractiveOptions,
): string {
  return DemiDroiteInteractiveElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}
```

Quand un composant sait produire une sortie LaTeX statique, ne pas court-circuiter
le helper avec `if (!context.isHtml) return ''`. Le helper doit appeler
`create(...)` dans tous les contextes et laisser la classe décider de la sortie.

Exemple de helper pour un composant avec `renderLatex()` :

```ts
export function addDiagramXxxAssessment(
  exercice: IExercice,
  questionIndex: number,
  options: DiagramXxxAssessmentOptions,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramXxxAssessmentElement.elementTag
  return DiagramXxxAssessmentElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
```

4. Méthode render contextuelle

- En HTML : `render()` met à jour le DOM du composant.
- En LaTeX : `render()` retourne la variante LaTeX si elle existe, sinon une chaîne vide.
- Pour la partie LaTeX, implémenter `renderLatex()` quand nécessaire.
- En Typst : si le composant ne peut pas être rejoué par `htmlToTypst()`, implémenter
  `renderTypst()` et faire retourner à `create(...)` un marqueur
  `<mathalea-typst>...</mathalea-typst>` quand `context.isTypst` est vrai.
- En contexte non HTML, aucun `connectedCallback()` n'est exécuté : `create(...)`
  doit donc préparer directement l'état nécessaire à `renderLatex()`.
- Ne pas faire dépendre `renderLatex()` du shadow DOM, d'attributs hydratés par le
  navigateur, ni d'éléments HTML internes. Il doit fonctionner à partir de l'état
  métier du composant.
- Même règle pour `renderTypst()` : produire du Typst pur à partir de l'état métier,
  sans dépendre du shadow DOM.
- Si `interactivityOn === true`, la sortie LaTeX doit représenter la version
  imprimable de l'évaluation, avec les zones à compléter pertinentes. Si
  `interactivityOn === false`, elle doit représenter la version statique/correction
  complète.

5. Propriété value

- Le getter `value` retourne l'état métier du composant (réponse élève).
- Le setter `value` réinjecte un état (correction figée, restitution Capytale, reprise de session).
- Le type exact dépend du composant, mais la propriété s'appelle toujours `value`.

### Contrat de sérialisation et de rejeu — obligatoire

`verifQuestion()` enregistre la réponse dans `exercice.answers`, dont les valeurs
sont des chaînes. Lors du rejeu, notamment dans Capytale,
`mathaleaWriteStudentPreviousAnswers()` transmet **cette chaîne sans la
désérialiser** :

```ts
element.value = answers[element.id]
```

Par conséquent, même si le getter retourne un objet, un tableau ou un nombre,
le setter doit toujours accepter la représentation sérialisée effectivement
stockée dans `exercice.answers`. Accepter uniquement le type natif du getter ne
respecte pas le contrat.

Pour un état structuré, utiliser ce modèle :

```ts
get value(): MonEtat {
  return this.readState()
}

update(nextValue: MonEtat | string): void {
  let state: MonEtat
  if (typeof nextValue === 'string') {
    try {
      const parsed: unknown = JSON.parse(nextValue)
      if (!isMonEtat(parsed)) return
      state = parsed
    } catch {
      return
    }
  } else {
    state = nextValue
  }
  this.applyState(state)
}

set value(nextValue: MonEtat | string) {
  this.update(nextValue)
}
```

Le parsing doit être défensif : une sauvegarde vide, ancienne ou corrompue ne
doit ni lever d'exception ni effacer un état valide. Si le getter retourne un
nombre, le setter doit au minimum accepter `number | string` et convertir avec
`Number(...)` après validation.

Le cycle à garantir est exactement celui-ci :

1. l'élève produit un état non vide ;
2. `verifQuestion()` enregistre `exercice.answers[element.id]` ;
3. la page est recréée avec la même graine ;
4. `mathaleaWriteStudentPreviousAnswers()` réinjecte la chaîne enregistrée ;
5. le getter restitue le même état métier et une nouvelle vérification donne la
   même note.

Convention recommandée pour éviter les divergences getter/setter :

- Implémenter une méthode publique `update(state)` qui applique l'état restaurable et déclenche le `redraw`/`render`.
- Faire déléguer le setter `value` vers `update(state)`.
- Faire retourner par le getter `value` toutes les propriétés nécessaires à une restauration fidèle par `update(state)`.
- Ne pas piloter `update(state)` avec des champs dérivés/recalculés au rendu (exemples : ratio formaté, booléen de seuil, longueurs recalculées). Ces champs peuvent être présents dans le getter pour l'affichage/diagnostic, mais doivent être recalculés après `update`.
- En cas d'évolution de schéma de données (`targetAB` renommé, etc.), lire l'ancien et le nouveau nom côté parsing pendant une période de compatibilité, et n'écrire que le nouveau nom côté production.

### Test Playwright de rejeu — obligatoire

Tout nouveau `MathaleaCustomElement` qui porte une réponse élève doit être livré
avec un test Playwright de rejeu. Le test doit utiliser un état représentatif et
non vide ; un aller-retour sur la valeur initiale vide ne constitue pas une
preuve suffisante.

Le scénario doit :

- produire une réponse dans le composant puis la vérifier ;
- récupérer la chaîne réellement enregistrée dans `exercice.answers` ;
- recharger la même URL et la même graine ;
- injecter la réponse avec `mathaleaWriteStudentPreviousAnswers()` ou reproduire
  strictement son affectation `element.value = storedAnswer` ;
- comparer l'état restauré à l'état saisi ;
- relancer la vérification et comparer la note avant et après rejeu.

Un composant purement technique, qui ne possède aucune réponse persistée, peut
être exempté. Cette exemption doit être explicite et justifiée dans le catalogue
des tests ; l'absence silencieuse de scénario n'est pas admise.

6. Propriété interactivityOn

- `interactivityOn` permet de rendre le composant inerte sans perdre son affichage.
- Le composant doit appliquer cet état à ses contrôles (inputs, boutons, drag, listeners actifs).
- Exemples d'utilisation : dans la fonction de vérification pour ne plus permettre de modifications ultérieures ; dans `mathaleaWriteStudentPreviousAnswers()` pour figer la copie de l'élève dans Capytale.
- Quand `interactivityOn` passe à `false`, la classe de base applique
  `renderMathInElement()` après le hook `onInteractivityChanged()`. Le LaTeX entre
  dollars créé par le rendu figé est donc converti en KaTeX après la réinjection
  de la réponse élève. Cette opération couvre le DOM léger et chaque shadow root
  ouvert : l'auto-render KaTeX ne franchit pas seul une frontière de shadow DOM.
- Une classe fille qui surcharge le setter `interactivityOn` doit conserver cette
  garantie, de préférence en déléguant au setter de la classe de base. Un shadow
  root fermé ne peut pas être parcouru par la base ; le composant qui en crée un
  doit y déclencher lui-même le rendu KaTeX.

7. Lifecycle DOM

- `connectedCallback()` installe le composant et appelle `render()`.
- `disconnectedCallback()` nettoie les listeners et ressources externes.

8. Enregistrement

- Ne pas appeler `customElements.define(...)` directement : utiliser `registerMathaleaCustomElement(MaClasse)` (exporté par `src/lib/customElements/MathaleaCustomElement.ts`).
- Ce helper définit l'élément dans le navigateur (de façon idempotente) et l'ajoute au registre `mathaleaCustomElementsRegistry`, qui permet les traitements génériques (corrections CAN notamment).

## Intégration dans l'interactivité de MathALÉA

Afin que le custom element soit correctement pris en charge par le système d'interactivité, il y a plusieurs étapes à réaliser :

- Ajouter dans `src/lib/types.ts` le tag à l'union `InteractivityType`.
- Ajouter dans `src/lib/types.ts` le tag à la garde `isInteractivityType()`, qui
  double l'union côté exécution. `handleAnswers()` s'en sert pour valider le
  `formatInteractif` reçu : un tag absent de cette fonction est **silencieusement
  remplacé par `'mathlive'`**, et la vérification part alors chercher un champ
  MathLive inexistant.
- Ajouter le tag à `listOfCustomElements` dans `src/lib/customElements/MathaleaCustomElement.ts`.
- Enregistrer la classe avec `registerMathaleaCustomElement(MaClasse)`.
- Ajouter l'import du module dans `tests/unit/canSolutions.test.ts` : ce test
  vérifie que chaque tag de `listOfCustomElements` est bien dans le registre, ce
  qui suppose que le module a été chargé.
- Ajouter le scénario Playwright de rejeu du composant. Le registre et le
  catalogue de rejeu doivent rester exhaustifs : l'ajout d'un tag sans scénario
  ni exemption technique justifiée doit faire échouer la CI.
- La méthode statique `verifQuestion(exercice,questionIndex)` doit être implémentée dans l'élément. Elle porte la vérification, l'hydratation de `exercice.answers`, du `span#resultatCheckEx` et du `div#feedbackEx`.
- Le retour de la fonction doit être : `{
isOk: boolean
feedback: string
score: { nbBonnesReponses: number; nbReponses: number }
}`. comme pour les callbacks de corrections.
- La méthode statique `pointsMaxQuestion(exercice, questionIndex)` retourne le `score.nbReponses` que `verifQuestion()` produira si l'élève répond juste partout. Elle vaut 1 par défaut : ne la surcharger que si une question du composant peut rapporter plusieurs points (plusieurs champs, barème spécifique). Elle est appelée avant toute saisie pour afficher le barème dans les paramètres de l'exercice, voir [le barème d'un exercice interactif](systeme-interactivite.md#barème-dun-exercice-interactif).
- Le dispatch par le registre est générique : `exerciceInteractif()`, `gestionCan.ts`, `Can.svelte` et `QuestionParPage.svelte` consultent `listOfCustomElements` puis `mathaleaCustomElementsRegistry` pour appeler `verifQuestion()`. Il n'y a donc plus de branche spécifique à ajouter dans ces fichiers pour un custom element correctement enregistré.
- Les formats historiques MathLive `mathlive`, `fillInTheBlank`, `tableauMathlive` et `texte` sont normalisés vers leurs tags (`mathalea-mathfield`, `fill-in-the-blank`, `tableau-mathlive`, `mathalea-textfield`) par `mathliveCompatibleToCustomElementFormat()` dans `src/lib/types.ts`. Ne pas ajouter de nouveau cas historique sans raison de compatibilité forte : préférer le tag du custom element comme `formatInteractif`.
- Dans les exercices utilisant ces éléments, `handleAnswers()` doit être utilisé pour renseigner `exercice.autoCorrection[questionIndex].valeur`, qui sera lu par `verifQuestion()` afin d'obtenir la réponse attendue de l'élément pour cette question. Si la réponse attendue doit être un objet, la stocker dans un format que `verifQuestion()` sait relire explicitement. De même, la `value` correspondant à la réponse de l'élève doit rester compatible avec la restauration via `mathaleaWriteStudentPreviousAnswers()`.

`interactifType` n'existe plus et ne doit jamais être exporté ni renseigné sur
une instance d'exercice. Le routage est exclusivement porté par
`autoCorrection[questionIndex].formatInteractif`, généralement posé par le
helper du composant ou par `handleAnswers()`.

## Affichage dans les corrections de la CAN

La vue des corrections de la CAN (`Solutions.svelte`, via `src/lib/components/canSolutions.ts`) traite les customElements enregistrés de façon générique grâce à deux hooks statiques de `MathaleaCustomElement`, à surcharger si besoin :

- `static formatStudentAnswer(rawAnswer: string): string` : formate la réponse brute de l'élève (telle que stockée dans `exercice.answers`) pour la ligne « Réponse donnée : ... ». Par défaut, la valeur brute est affichée telle quelle (suffisant pour `liste-deroulante`). À surcharger si la valeur stockée n'est pas lisible directement (ex. `InteractiveClock` stocke un JSON `{hour, minute, second}`).
- `static stripFromQuestionHtml(questionHtml: string): string` : transforme le HTML de la question pour la liste des corrections. Par défaut, le composant reste visible mais son attribut `interactivity-on` est forcé à `false` (composant désactivé, non interactif). À surcharger pour retirer le composant de l'énoncé (ex. `InteractiveClock`).

Le customElement d'une question est repéré par son tag dans le HTML de la question. Si un composant en contient un autre (ex. `possible-multi-lines-answer` contient un `mathalea-mathfield`), c'est le tag le plus extérieur, donc le premier du HTML, qui gère l'affichage.

Un customElement enregistré via `registerMathaleaCustomElement` est donc pris en charge par les corrections CAN sans modifier `Solutions.svelte` ni `canSolutions.ts`.

## Cas spécial : élément technique non visible

### Empilements de cubes 3D

`cube-stack-editor` (`CubeStackEditorElement.ts`) permet à l'élève d'ajouter,
supprimer et sélectionner des cubes. Sa `value` reprend le JSON version 1 de
vision-espace (`grid` et tableau `cubes` avec `x`, `y`, `z`, `color`). Le helper
`addCubeStackEditor(exercice, questionIndex, options)` accepte notamment
`initialState` et `expectedState`.

Les coordonnées des cubes acceptent les demi-entiers. En mode « Sélectionner »,
quatre boutons déplacent les cubes sélectionnés horizontalement, selon `x` ou
`z`, par pas de `0,5`. Cela permet de reproduire les empilements dont certains
cubes sont à cheval entre deux positions entières.

La vérification compare la géométrie seule : les couleurs et la taille de la
grille sont ignorées, et les coordonnées sont comparées modulo une translation
et l'une des 24 rotations propres du cube. Une symétrie seule n'est donc pas
acceptée.

### Motifs 2D sur une grille carrée

`shape-2d-grid-editor` (`Shape2DGridEditorElement.ts`) permet de tamponner des
formes `Shape2D` dans les cases d'une grille carrée. Le helper
`addShape2DGridEditor(exercice, questionIndex, options)` reçoit obligatoirement
`shapes`, la liste ordonnée des formes proposées dans la palette. Il accepte
aussi `grid`, `initialState` et `expectedState`.

L'état JSON de version 1 contient `grid` et un tableau `cells` dont chaque
entrée porte `x`, `y` et le nom du tampon `shape`. La vérification tient compte
des formes, de leur rotation, de leur échelle et de leurs positions relatives,
mais ignore la taille de la grille et une translation globale du motif.
Plusieurs tampons peuvent occuper la même case, notamment pour représenter des
allumettes qui se croisent. Les coordonnées acceptent les demi-entiers. En mode
« Sélectionner », quatre boutons déplacent les formes sélectionnées selon `x`
ou `y`, par pas de `0,5`, afin d'aligner précisément les formes tournées autour
de leur centre. Comme tout `MathaleaCustomElement`, il peut être déclaré comme
enfant d'un `mathalea-couteau-suisse` avec son `questionIndex` et son
`autoCorrection` propres.

Si un composant doit être créé comme objet DOM technique (tests, vérifications hors affichage), ne pas détourner `create(...)`.

Utiliser une méthode dédiée, par exemple :

- `createEltToAppendToDom(...)`

Ce nommage évite de mélanger :

- API HTML standard (`create`) ;
- API technique d'instanciation DOM interne.

Exemple d'usage : `MySpreadsheetElement` instancie des feuilles de calcul techniques dans le DOM (invisibilisées) pour des vérifications hors affichage.

Un custom element peut aussi être purement technique et ne porter aucune
réponse élève. Dans ce cas, il ne doit pas être ajouté à `InteractivityType` ni
à `listOfCustomElements` : il utilise seulement le cycle de vie DOM pour
installer et nettoyer des listeners liés à un rendu. Exemple :
`cube-iso-interaction`, injecté par `mathalea2d()` quand `updateCubeIso()`
enregistre une projection 3D manipulable.

Un composant technique qui doit **changer les réglages de son exercice** (donc
provoquer une régénération et une mise à jour de l'URL) émet l'événement DOM
`settings`, avec le même `detail` que le panneau de réglages (`sup`, `sup2`,
`nbQuestions`…) :

```ts
this.dispatchEvent(
  new CustomEvent('settings', {
    detail: { sup: nouvelleValeur },
    bubbles: true,
    composed: true,
  }),
)
```

`ExerciceMathaleaVueProf` écoute cet événement sur l'`<article>` de l'énoncé et
le traite avec `handleNewSettings()`. Ne pas écrire directement dans
`exercicesParams` : l'exercice ne serait pas régénéré. La vue TBI
(`TbiExerciceCard`) écoute aussi cet événement sur l'`<article>` de chaque
carte. Exemple : `questions-de-cours-selecteur`, voir
[Questions de cours](../architecture/questions-de-cours.md).

Un tel composant est détruit puis recréé à chaque régénération. Pour qu'un champ
de saisie garde le focus :

- mémoriser le champ actif dans une `Map` de module, indexée par numéro
  d'exercice (`focusin`), et le vider quand le focus sort du composant
  (`focusout`) pour ne pas le reprendre après un clic ailleurs ;
- émettre `settings` dans un `setTimeout` : le `change` d'un champ part avant
  que Tab ne déplace le focus, et la régénération, lancée en microtâche,
  remplacerait l'élément avant que le champ suivant ne soit noté ;
- valider aussi la saisie sur Entrée (`keydown`), le `change` n'y étant pas
  toujours émis dans l'énoncé.

Exemple : `construction-triangle-selecteur`
(`ConstructionTriangleSelecteur.ts`, exercice P011). L'enseignant choisit une
construction de triangle, puis complète une figure à main levée avec les noms
des sommets et les mesures. La figure est tracée avec roughjs, comme l'option
`mainlevee` de `mathalea2d`, mais avec une graine fixe (le rendu ne consomme
pas la graine de l'exercice) ; chaque côté passe par des points légèrement
décalés pour l'effet de main qui tremble, et s'arrête exactement aux sommets.
Les champs, sans cadre (`STYLE_CHAMP_DISCRET`), sont posés en position absolue
par-dessus le SVG, à quelques unités du dessin : leur taille réelle, convertie
dans le repère du SVG, donne la distance minimale au trait le plus proche
(côté, arc d'angle, traits d'égalité). Un `ResizeObserver` sur la figure et sur
chaque champ refait ce calcul quand le zoom, les polices ou la saisie changent
leur taille ; les champs de mesure prennent la largeur de leur valeur ; le select reprend `SelectUnique.svelte`
(`STYLE_SELECT_SANS_FOND`). Il est proposé en vue prof et en vue TBI.

Toutes ses tailles sont en `em`, y compris la police des champs (`text-[1em]`,
sinon un champ de formulaire garde sa taille en `rem`) : le zoom de la page
agrandit la police du conteneur de l'exercice (`resizeContent()`), le composant
suit donc le zoom. Le lecteur Instrumenpoche du bouton « Montrer l'animation »
(`ElementButtonInstrumenpoche`) a de même une largeur maximale de `36em` : son
SVG occupe toute cette largeur, l'animation grossit avec le zoom. Les réglages restent stockés dans `sup` (construction), `sup2` (nom)
et `sup3` (mesures séparées par des espaces), ce qui garde valides les liens
déjà partagés. Hors vue enseignante (vue élève notamment), l'exercice affiche
la figure `mathalea2d` et le bouton de l'animation.

Pour remplacer un écouteur global `exercicesAffiches` qui ne sert qu'à attendre
que le HTML d'un exercice soit dans le DOM, utiliser `mathalea-dom-ready`. Le
composant reçoit un nom d'action et un payload sérialisable, puis exécute le
callback enregistré à son `connectedCallback()`. Si le callback retourne une
fonction, elle est appelée au `disconnectedCallback()`.

Attention au cycle de régénération d'un énoncé (« Nouvel énoncé ») : les noms
d'action sont le plus souvent stables (ils ne dépendent que des numéros
d'exercice et de question), et `nouvelleVersion()` réinscrit le nouveau callback
**avant** que Svelte ne retire l'ancien élément du DOM. Une fonction de nettoyage
qui appelle `unregisterCallback(action)` désinscrirait donc l'inscription toute
fraîche. `DomReadyActionElement.unregisterCallback()` ignore pour cette raison
les désinscriptions obsolètes : elle ne supprime l'entrée que si le callback
inscrit est bien celui dont le nettoyage est en cours (ou celui passé en second
argument, à utiliser quand la désinscription a lieu hors de ce nettoyage — voir
`destroy()` dans `src/lib/figureApigeom.ts`).

## Grilles de chiffres

Les composants qui font remplir un damier de chiffres (`kenken-grille`,
`killer-sudoku-grille`, `grimuku-grille`, `tables-effacees-grille`) partagent
`src/lib/customElements/grilleDeChiffres.ts` :

- `verifieLesCases()` et `pointsMaxDesCases()` portent le barème « un point par
  case juste ». Le composant n'a plus qu'à implémenter l'interface
  `GrilleDeChiffres` (`value`, `interactivityOn`, `marqueLesCases()`,
  `afficheLeScore()`) et à leur déléguer `verifQuestion()` et
  `pointsMaxQuestion()`.
- `creeChampDeSaisie()`, `filtreLaSaisie()`, `deplacementDuClavier()` et
  `deplaceLeFocus()` donnent la saisie d'un chiffre par case : seuls les
  chiffres autorisés sont acceptés, le focus reste sur la case saisie (une
  grille ne se remplit pas dans l'ordre de lecture) et les flèches du clavier
  déplacent le curseur.
- Les clés de réponse suivent la convention des tableaux MathALÉA
  (`cleDeLaCase()` produit `L1C1`, `L1C2`...), ce qui rend la grille corrigeable
  par le même code que `tableau-hybride`. Attention : le type `Valeur` ne
  déclare ces clés que jusqu'à `L3C5`, une grille plus grande doit donc les
  ajouter une à une (voir `EN-gratte-ciel`, `EN-kenken`, `EN-killer-sudoku`, `EN-grimuku`).

Un composant dont les cases n'attendent pas un chiffre isolé n'emprunte que le
barème et les clés de réponse. `pyramide-nombres` (voir `EN-pyramide`) est dans
ce cas : ses cases attendent un entier relatif, éventuellement à plusieurs
chiffres. Il implémente `GrilleDeChiffres` et délègue `verifQuestion()` et
`pointsMaxQuestion()` à `verifieLesCases()` et `pointsMaxDesCases()`, mais
construit ses propres champs de saisie et son propre déplacement au clavier,
la pyramide n'étant pas un damier rectangulaire. Ses clés `LxCy` numérotent les
lignes depuis le sommet.
`etoile-calculs` (exercice `EN-EtoileCalculs`) ne reprend que le barème : ses
clés de réponse sont les mêmes `L1C1`, `L1C2`... (une par flèche), donc
`pointsMaxQuestion()` délègue à `pointsMaxDesCases()`. Tout le reste diffère,
parce qu'une flèche attend un entier et non un chiffre : la saisie se fait dans
un champ MathLive et la comparaison est celle de `fonctionComparaison()`, pas
l'égalité de chaînes de `verifieLesCases()`.

## Dessin mesuré : `etoile-calculs`

Ce composant montre comment poser un dessin dont les étiquettes sont du texte
mathématique, donc de largeur inconnue à l'avance.

- **Police uniforme.** Les nombres et les opérations sont écrits en LaTeX
  (`$\times 9 + 1$`) dans des éléments du DOM clair, puis composés par
  `renderMathInElement()` avec `optionsKatex` : la figure a exactement la police
  des autres énoncés. Seules les flèches sont un SVG, sans aucun texte.
- **Clavier.** Les champs sont des `MathfieldElement` créés à la main, avec
  `data-keyboard` construit par `buildDataKeyboardFromStyle()` et passés à
  `setMathfield()` : c'est ce qui ouvre le clavier MathALÉA, indispensable sur
  téléphone où le clavier du système n'apparaît pas sur ces champs.
- **Alignement.** `dispositionEtoile()` ne place pas les étiquettes sur un
  cercle : sur chaque direction elle empile le demi-encombrement du nombre
  central, un blanc, la flèche, un blanc, puis le demi-encombrement de
  l'étiquette (`sortieBoite()` donne la distance du centre d'une boîte à son
  bord dans une direction). Toutes les flèches ont donc la même longueur et
  partent du bord de leur étiquette, quelle que soit la longueur de l'opération.
  Le cadre du dessin est déduit des boîtes obtenues.
- **Mesures réelles.** Les largeurs estimées ne servent qu'aux sorties
  imprimées et au tout premier rendu. En HTML, un `ResizeObserver` sur les
  étiquettes, le nombre central et le conteneur relance la mise en place dès que
  KaTeX a composé, que les polices sont chargées, que l'enseignant change le
  zoom ou que la largeur disponible change. Sur écran étroit, le dessin est
  réduit (`transform: scale`) jusqu'à `ECHELLE_MINIMALE` avant de défiler.
- **Sorties imprimées.** LaTeX produit un `tikzpicture`, Typst un dessin natif
  (`place` + `line` + `polygon` + mode mathématique) : aucune image n'est
  embarquée, les formules restent composées par le moteur du document.
- Les réponses ne sont mises dans le DOM que pour la correction
  (`montreSolution`).

## Cas avancés

## Cas spécifique : diagrammes (outil prof vs évaluation)

Pour les diagrammes, distinguer explicitement deux usages.

- Outil auteur/prof (construction libre) : `diagram-builder`.
  - Usage recommandé : préparation d'énoncés, de corrections, d'exemples visuels.
  - Non recommandé pour évaluer directement un élève sur une compétence de construction.
- Outils d'évaluation (contraints) : un composant par scénario métier.
  - Exemple : `diagram-pie-assessment` pour un exercice d'angles de secteurs.
  - Exemple : `diagram-bar-assessment` pour un exercice de hauteurs de bâtons avec unité.

Principe pédagogique : en mode évaluation, l'élève ne doit pas pouvoir "obtenir"
le graphique complet par simple saisie des données de l'énoncé. Le composant doit
imposer la variable didactique attendue (angles, hauteurs, échelles, etc.).

- MySpreadsheetElement (tableur) : [architecture du tableur](tableur.md)
- BlocklyEditor : [architecture de Scratch et Blockly](scratch-blockly.md)
- DecompositionFacteursPremiersElement (algorithme de décomposition, deux modes de vérification, trois rendus) : [recette côté exercice](../../auteurs-exercices/complements/formats-interactifs.md#algorithme-de-décomposition-en-facteurs-premiers)
- RelierEtiquettesElement (composant à trois rendus : HTML interactif, LaTeX et Typst) : [relier les étiquettes](relier-etiquettes.md)
- SchemaEnBarreElement (choix parmi six schémas, textes éditables, trois rendus) : [schéma en barre](schema-en-barre.md)

## Checklist avant merge

- Le composant étend `MathaleaCustomElement`.
- `elementTag` est défini.
- L'enregistrement passe par `registerMathaleaCustomElement(...)`.
- `create(...)` existe et est utilisée par les helpers d'injection.
- Le helper `addXxx(...)` (ou équivalent) expose la signature `(exercice, questionIndex, options)` avec un type d'options exporté.
- `value` (getter/setter) est implémentée et testée.
- `value` est symétrique avec `update(...)` (restauration depuis l'objet renvoyé par le getter).
- `interactivityOn` est respectée.
- `connectedCallback()` et `disconnectedCallback()` sont propres.
- Le rendu non HTML est défini (`renderLatex()` ou chaîne vide assumée).
- Le rendu Typst est défini quand le composant HTML ne peut pas être converti
  automatiquement (`renderTypst()` + marqueur `<mathalea-typst>` dans
  `create(...)`).
- L'affichage dans les corrections CAN est correct (`formatStudentAnswer` et `stripFromQuestionHtml` surchargées si les valeurs par défaut ne conviennent pas).
- `pointsMaxQuestion` est surchargée si une question du composant peut rapporter plus d'un point.
- Un composant qui crée des `math-field` appelle `nommeChampsAutourDe(this)` à la fin de son rendu (voir [Nom accessible des champs de réponse](systeme-interactivite.md#nom-accessible-des-champs-de-réponse)).
- Le tag est présent aux quatre endroits attendus : `InteractivityType`,
  `isInteractivityType()`, `listOfCustomElements` et les imports de
  `tests/unit/canSolutions.test.ts`.

## Migration d'un composant existant

Ordre recommandé :

1. Faire hériter la classe de `MathaleaCustomElement`.
2. Ajouter `elementTag`.
3. Introduire `create(...)` et rebrancher le helper historique (`addXxx`) dessus.
4. Déplacer la classe dans `src/lib/customElements/` si elle vivait ailleurs.
5. Uniformiser `value` et `interactivityOn`.
6. Ajouter le nettoyage dans `disconnectedCallback()`.
7. Vérifier que le tag est présent dans `InteractivityType`, `listOfCustomElements` et le registre.
8. Vérifier que le composant est traité correctement dans `exercice.answers`, dans les corrections CAN et dans la reprise des réponses élèves.

### Migration d'un helper historique

Quand le composant remplace un ancien helper déjà utilisé dans de nombreux exercices, conserver le helper comme API stable et le faire appeler `create(...)`.

Principes appliqués aux wrappers MathLive :

- le wrapper reçoit l'id conventionnel du custom element, par exemple `mathalea-mathfieldEx0Q0` ;
- l'élément interne conserve l'id ou les sélecteurs legacy attendus par les exercices existants, par exemple `champTexteEx0Q0` ou `table#tabMathliveEx0Q0` ;
- la vérification terminale vit dans `verifQuestion()` du wrapper ;
- si une vérification très spécifique est nécessaire, le helper peut accepter une callback optionnelle et la transmettre au wrapper.

## Fichiers utiles

- Base : `src/lib/customElements/MathaleaCustomElement.ts`
- Interactivité : [système d'interactivité](systeme-interactivite.md)
- Recettes côté exercice : [formats interactifs spécialisés](../../auteurs-exercices/complements/formats-interactifs.md)
