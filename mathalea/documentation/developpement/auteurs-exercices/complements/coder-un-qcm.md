# Coder un QCM

Ce guide explique comment ajouter un QCM moderne à un exercice classique qui
hérite de `Exercice`. La réponse attendue se déclare avec `handleAnswers()` et
le composant HTML s'ajoute avec `addMathaleaQcm()`. Le code de l'exercice ne
manipule donc pas directement `this.autoCorrection[i]`.

Les contrats décrits ici ont été vérifiés dans
`src/lib/customElements/MathaleaQcm.ts`,
`src/lib/interactif/gestionInteractif.ts`, `src/lib/interactif/qcm.ts` et
`src/lib/types.ts`, ainsi que dans `tests/unit/mathaleaQcm.test.ts`.

Pour le cycle général d'un exercice, lire aussi
[créer un exercice](../creer-un-exercice.md). Les autres formats sont présentés
dans [formats interactifs spécialisés](formats-interactifs.md). Pour le
pipeline de vérification, voir
[système d'interactivité](../../maintenance-moteur/interactivite/systeme-interactivite.md).

## Pré-requis

Un exercice QCM moderne doit avoir :

- un fichier dans `src/exercices/`, au bon niveau de dossier ;
- `export const interactifReady = true` ;
- un appel à `handleAnswers()` pour chaque question acceptée avec le formatInteractif `mathalea-qcm`;
- un appel à `addMathaleaQcm()` après `handleAnswers()` ;
- `listeQuestionsToContenu(this)` à la fin de `nouvelleVersion()` pour un
  exercice classique.

Pour AMC, ajouter ces métadonnées seulement si l'exercice a réellement été
vérifié en export papier :

```ts
export const amcReady = true
export const amcType = 'qcmMono' // une seule bonne réponse
// ou
export const amcType = 'qcmMult' // plusieurs bonnes réponses possibles
```

## Squelette minimal

Cet exemple convient à un fichier placé dans `src/exercices/6e/`. Adapter les
chemins d'import pour un autre dossier.

```ts
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Choisir la bonne réponse'
export const interactifReady = true
export const uuid = 'a-remplacer'
export const refs = {
  'fr-fr': ['6X00-0'],
  'fr-ch': [],
}

export default class ChoisirLaBonneReponse extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(2, 9)
      const b = randint(2, 9)
      let texte = `Calculer $${a}+${b}$.`
      let texteCorr = `$${a}+${b}=${a + b}$.`
      const propositions = [
        { texte: `$${a + b}$`, statut: true },
        { texte: `$${a + b + 1}$`, statut: false },
        { texte: `$${a + b - 1}$`, statut: false },
      ]
      const qcmOptions = { radio: true, vertical: true }

      if (this.questionJamaisPosee(i, a, b)) {
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )

        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
```

Points importants :

- remplacer `uuid = 'a-remplacer'` par un UUID généré avec la commande indiquée
  dans [créer un exercice](../creer-un-exercice.md) :

```sh
pnpm getNewUuid
```

- `refs['fr-fr']` contient l'identifiant utilisé dans l'URL de prévisualisation
  `?id=...` ;
- `handleAnswers()` doit être appelé avant `addMathaleaQcm()`, car il déclare les
  propositions que le composant doit afficher ;
- l'énoncé fourni à `handleAnswers()` doit être autonome pour les exports ;
- la correction fournie dans `qcm.correction` est synchronisée vers AMC ;
- `questionJamaisPosee()` doit recevoir les valeurs qui caractérisent vraiment
  la question.

## Déclarer les propositions

`handleAnswers()` attend une valeur de la forme suivante pour le format
`mathalea-qcm` :

```ts
handleAnswers(
  this,
  i,
  {
    qcm: {
      enonce: texte,
      propositions,
      correction: texteCorr,
      options: qcmOptions,
    },
  },
  { formatInteractif: 'mathalea-qcm' },
)
```

Chaque proposition est un objet de type :

```ts
{
  texte: '$4$',
  statut: true,
  feedback: 'Message facultatif'
}
```

- `texte` est le contenu affiché à côté de la case ou du bouton radio. Il peut
  contenir du HTML ou du LaTeX entre `$...$`.
- `statut` indique si la proposition est correcte.
- `feedback` est facultatif. Les messages des propositions cochées sont
  regroupés dans le retour global de la question.

Le format moderne conserve les propositions dans l'ordre fourni. Il ne supprime
pas automatiquement les doublons. Si les distracteurs sont calculés, vérifier
qu'ils sont distincts avant d'accepter la question et mélanger explicitement le
tableau si l'ordre doit varier.

## Options d'affichage

Les options communes à la déclaration et au composant sont :

| Option           | Effet                                                            |
| ---------------- | ---------------------------------------------------------------- |
| `radio: true`    | Utilise des boutons radio. À réserver à une seule bonne réponse. |
| `vertical: true` | Affiche une proposition par ligne en HTML.                       |

Déclarer une seule variable et la réutiliser évite de produire, par exemple, un
composant à cases à cocher alors que la réponse a été déclarée en boutons radio :

```ts
const qcmOptions = { radio: true, vertical: true }

handleAnswers(
  this,
  i,
  {
    qcm: {
      enonce: texte,
      propositions,
      correction: texteCorr,
      options: qcmOptions,
    },
  },
  { formatInteractif: 'mathalea-qcm' },
)

texte += addMathaleaQcm(this, i, {
  ...qcmOptions,
  interactivityOn: this.interactif,
})
```

`addMathaleaQcm()` accepte aussi `format: 'lettre'` et `style` pour adapter le
rendu HTML. Les options historiques `ordered` et `lastChoice` restent utilisées
par `propositionsQcm()`, notamment pour le fallback LaTeX, mais ne mélangent pas
le composant HTML moderne.

Pour la vue Typst, `propositionsQcm()` accepte `typstColumns` (nombre de
colonnes par défaut des propositions, ex. `2` pour une grille 2×2 de figures ;
sans lui, des figures sont sur une seule colonne) et `typstFigureAlign`
(`'left'`, `'center'` ou `'right'`, alignement par défaut des figures des
propositions). La palette de mise en page
permet ensuite de le modifier. Voir [Vue Typst](../../maintenance-moteur/exports/typst.md).

Pour plusieurs bonnes réponses, utiliser des cases à cocher :

```ts
const qcmOptions = { radio: false, vertical: true }
```

La réponse est validée seulement si toutes les propositions vraies sont cochées
et qu'aucune proposition fausse ne l'est.

## Ajouter le QCM à la question

Après `handleAnswers()`, ajouter le composant HTML :

```ts
texte += addMathaleaQcm(this, i, {
  ...qcmOptions,
  interactivityOn: this.interactif,
})
```

`addMathaleaQcm()` retourne une chaîne vide hors du contexte HTML. Il n'est donc
pas nécessaire de l'entourer d'un test pour un exercice qui n'a pas besoin d'un
rendu LaTeX des propositions.

Lorsque le rendu LaTeX doit afficher les choix, utiliser le helper historique
après `handleAnswers()` :

```ts
if (context.isHtml) {
  texte += addMathaleaQcm(this, i, {
    ...qcmOptions,
    interactivityOn: this.interactif,
  })
} else if (!context.isAmc) {
  const qcmLatex = propositionsQcm(this, i)
  texte += qcmLatex.texte
  texteCorr += qcmLatex.texteCorr
}
```

`handleAnswers()` a déjà préparé les données internes dont
`propositionsQcm()` a besoin : aucune écriture directe dans `autoCorrection`
n'est nécessaire.

## Correction

La correction affichée par l'exercice reste une correction rédigée classique :

```ts
const texteCorr = `$${a}+${b}=${bonneReponse}$.`
```

Fournir la même correction à `handleAnswers()` :

```ts
qcm: {
  enonce: texte,
  propositions,
  correction: texteCorr,
  options: qcmOptions,
}
```

Cette propriété `correction` est notamment copiée vers les données AMC. Elle ne
remplace pas `this.listeCorrections[i]`, qui alimente la correction des sorties
classiques.

Dans le fallback LaTeX, `qcmLatex.texteCorr` montre explicitement les bonnes
propositions. Il peut être ajouté à la correction rédigée comme dans le
squelette minimal.

## Gestion interactive

Le format moderne est déclaré par :

```ts
export const interactifReady = true
```

`handleAnswers()` enregistre le format et les réponses attendues. Le bouton de
validation route ensuite la question vers `MathaleaQcmElement.verifQuestion()`,
qui :

- lit les cases ou boutons associés à la question ;
- sauvegarde les choix dans `exercice.answers` ;
- valide seulement l'ensemble exact des bonnes réponses ;
- verrouille le composant après validation.

## Rendu non interactif

Deux approches sont possibles :

1. appeler `propositionsQcm()` uniquement hors HTML et hors AMC pour obtenir
   l'environnement LaTeX `qcmprop` ;
2. construire une consigne non interactive plus naturelle, par exemple
   `Entourer la bonne réponse : ...`.

Dans les deux cas, `handleAnswers()` reste l'unique point de déclaration de la
réponse attendue.

## AMC

Pour un QCM simple :

```ts
export const amcReady = true
export const amcType = 'qcmMono'
```

Pour plusieurs bonnes réponses :

```ts
export const amcReady = true
export const amcType = 'qcmMult'
```

`handleAnswers()` copie automatiquement l'énoncé, les propositions, les options
et `qcm.correction` vers la structure dédiée à AMC. Le code de l'exercice ne
doit donc remplir directement ni `autoCorrection` ni `autoCorrectionAMC` pour
ce cas.

Points de vigilance :

- `qcmMono` doit avoir exactement une proposition vraie ;
- `qcmMult` accepte plusieurs propositions vraies, mais l'élève doit cocher
  exactement l'ensemble attendu ;
- l'énoncé fourni dans `qcm.enonce` doit être autonome et imprimable ;
- les propositions ne doivent pas dépendre d'un composant navigateur ;
- garder une déclaration explicite de `amcType` et tester l'export.

Pour plus de détails, voir [export AMC](export-amc.md).

## Variante `ExerciceSimple`

Pour un exercice simple qui possède déjà une réponse libre, une version QCM
optionnelle peut être générée avec :

```ts
this.versionQcmDisponible = true
this.reponse = bonneReponse
this.distracteurs = [mauvaise1, mauvaise2, mauvaise3]
this.versionQcmOptions = { radio: true }
```

Le moteur construit le QCM lorsque `versionQcm` est activé. Cette voie convient
aux exercices CAN ou aux exercices courts disponibles à la fois en saisie libre
et en QCM.

### Garantir quatre propositions dans une version QCM simple

`getDistracteurs()` (`src/lib/interactif/qcmDistractors.ts`) retire les doublons
textuels et les distracteurs textuellement identiques à la bonne réponse, puis
mélange les candidats et en conserve au maximum trois. Il ne complète pas la
liste : trois distracteurs calculés peuvent donc ne donner que deux mauvaises
réponses, voire moins, selon les valeurs tirées.

Pour obtenir quatre propositions, prévoir trois mauvaises réponses distinctes
et des candidats de secours adaptés au calcul. L'utilitaire
`distracteursDistincts()` du même module permet de conserver les candidats
principaux et de compléter avec les secours, sans tirage supplémentaire :

```ts
this.distracteurs = distracteursDistincts(
  this.reponse,
  candidatsPrincipaux,
  candidatsDeSecours,
)
```

L'utilitaire ignore les différences d'espacement et les délimiteurs `$`, mais
ne vérifie pas l'équivalence mathématique : simplifier les fractions et vérifier
que les secours sont réellement faux. Prévoir assez de secours pour garder
exactement trois distracteurs, même dans les cas particuliers. Vérifier le
résultat sur plusieurs graines, notamment celles qui provoquent des collisions.

Si le tirage publié fournit plus de trois candidats principaux, passer
`Math.max(3, candidatsPrincipaux.length)` comme quatrième argument. Cela garde
le réservoir de candidats pour le mélange effectué par `getDistracteurs()`,
au lieu de limiter systématiquement le choix aux trois premiers.

Une proposition de secours doit correspondre à une erreur plausible (oubli
d'un carré, confusion entre somme et produit, erreur de signe…). Le moteur ne
peut pas en inventer une universelle pour des réponses aussi variées que des
nombres, des expressions, des ensembles ou des figures. Pour un exercice
publié, vérifier aussi la stabilité des tirages après le changement.

Relancer la génération de la question tant que trois distracteurs distincts ne
sont pas disponibles est une autre possibilité. Borner le nombre de tentatives
et prévoir le cas où aucune ne convient : un doublon systématique dans les
formules des distracteurs ne disparaît pas en changeant les nombres. Relancer
le même mélange des candidats ne crée pas de nouveau distracteur. Pour un
exercice publié, rejeter un tirage auparavant accepté change l'énoncé associé
à sa graine ; archiver la version publiée si l'on adopte ce comportement.

Pour tester cette version :

```txt
http://localhost:5173/alea/?id=REF_EXERCICE&i=1&qcm=1
```

Sans `qcm=1`, l'exercice peut rester en saisie libre même si
`versionQcmDisponible` vaut `true`.

## Maintenir un QCM historique

Les exercices existants qui remplissent directement `autoCorrection[i]` et
appellent `propositionsQcm()` restent pris en charge. Le helper renseigne
`autoCorrection[i].formatInteractif` avec `mathalea-qcm` : cette propriété par
question est la source de vérité, y compris lorsque l'exercice propose à chaud
un choix entre QCM et champ MathLive. `interactifType` n'existe plus et ne doit
pas être exporté.

Pour un nouveau QCM, préférer systématiquement :

1. `handleAnswers(..., { formatInteractif: 'mathalea-qcm' })` ;
2. `addMathaleaQcm()` pour le rendu HTML ;
3. éventuellement `propositionsQcm()` uniquement pour le fallback LaTeX.

`buildQcmForExercise()` et `listeDeroulanteToQcm()` appartiennent également au
parcours historique : les conserver pour maintenir les exercices qui les
utilisent déjà.

### Classes `ExerciceQcm` et `ExerciceQcmA`

`ExerciceQcm` sert aux QCM historiques sans aléatoirisation propre à l'exercice.
`ExerciceQcmA` ajoute une méthode `versionAleatoire()` pour les exercices dont
les valeurs ou les propositions changent à chaque génération.

Ces classes construisent elles-mêmes `autoCorrection` à partir des propriétés
suivantes :

- `this.enonce` contient l'énoncé ;
- `this.reponses` contient les propositions ;
- `this.correction` contient la correction générale de la question ;
- `this.corrections` peut contenir une correction associée à chaque proposition ;
- `this.options` contient les options du QCM, par exemple `vertical`, `ordered`,
  `radio`, `compact` ou `dontKnow`.

Ces classes n'ajoutent aucune case au panneau des paramètres : il n'y a ni
« Sujet original », ni « Consigne augmentée », ni « Ajout de « Je ne sais pas » ».
Pour proposer la réponse « Je ne sais pas » dans un exercice précis, mettre
`this.options.dontKnow = true`.

Pour un QCU, laisser `this.bonnesReponses` à `undefined`. La première
proposition est alors considérée comme la seule bonne réponse :

```ts
this.reponses = [
  '$4$', // bonne réponse
  '$5$',
  '$6$',
]
this.corrections = ['$2+2=4$.', '$5$ est trop grand.', '$6$ est trop grand.']
this.bonnesReponses = undefined
this.options = { vertical: true, radio: true }
```

Le moteur brasse les propositions et garde chaque entrée de `this.corrections`
associée à la proposition correspondante. Ne pas utiliser `this.correction` pour
porter une correction différente par proposition.

Renseigner `this.bonnesReponses` uniquement pour un vrai QCM à plusieurs
réponses possibles. Dès que cette propriété existe, `ExerciceQcm` bascule en
mode multi-réponses et force `options.radio = false`, donc des cases à cocher
remplacent les boutons radio.

## Prévisualiser et tester

Pendant le développement :

1. lancer le serveur local avec `pnpm dev` ;
2. ouvrir l'exercice avec son identifiant :

```txt
http://localhost:5173/alea/?id=REF_EXERCICE&i=1
```

ou avec son UUID :

```txt
http://localhost:5173/alea/?uuid=UUID_GENERE&i=1
```

3. tester au moins une bonne et une mauvaise réponse ;
4. vérifier le rendu non interactif ou LaTeX si l'exercice doit être imprimé ;
5. vérifier AMC si `amcReady` est déclaré.

Pour une validation ciblée du rapport interactif :

```sh
INTERACTIF_REPORT=1 CHANGED_FILES='src/exercices/6e/mon-qcm.ts' pnpm vitest src/lib/amc/report-interactif.test.ts --run
```

Remplacer le chemin par celui du fichier modifié. Le rapport est décrit dans
[rapports d'exercices](../../../tests/rapports-exercices.md).

Avant commit :

```sh
pnpm prebuild-unit-tests
```

Si des fichiers TypeScript ou Svelte sont modifiés :

```sh
pnpm check
```

## Dépannage

`handleAnswers() attend une valeur QCM pour le format 'mathalea-qcm'` : vérifier
la présence du niveau `{ qcm: { ... } }` autour des propositions.

Le QCM est vide : vérifier que `handleAnswers()` est appelé avant
`addMathaleaQcm()` et que le tableau `propositions` contient au moins deux
éléments.

Le QCM s'affiche mais ne se valide pas : vérifier
`{ formatInteractif: 'mathalea-qcm' }`.

Des cases à cocher s'affichent au lieu de boutons radio : passer le même
`qcmOptions` à `handleAnswers()` et à `addMathaleaQcm()`.

Les boutons radio correspondent à plusieurs réponses attendues : ne pas utiliser
`radio: true` si plusieurs propositions ont `statut: true`.

Les propositions ne changent jamais d'ordre : le composant moderne respecte
l'ordre fourni ; mélanger explicitement le tableau avant `handleAnswers()`.

Le QCM apparaît en HTML mais pas en LaTeX : `addMathaleaQcm()` est HTML
uniquement ; utiliser le fallback `propositionsQcm()` montré plus haut.

L'export AMC est incohérent : vérifier `amcType`, `qcm.enonce`,
`qcm.correction`, le nombre de bonnes réponses et l'absence de contenu
strictement navigateur dans les propositions.
