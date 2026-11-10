# Ajouter une interactivité simple

Le cas le plus courant consiste à afficher un champ MathLive puis à enregistrer
la réponse attendue pour chaque question.

## Principe

Deux opérations sont indissociables :

1. ajouter le champ de saisie dans l'énoncé ;
2. déclarer la réponse avec `handleAnswers()`.

Si une seule opération est présente, l'élève ne pourra pas répondre ou sa
réponse ne pourra pas être vérifiée.

## Déclarer l'exercice interactif

Ajoutez les métadonnées près du titre et de l'UUID :

```ts
export const interactifReady = true
```

Ajoutez les imports adaptés à la profondeur du fichier :

```ts
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
```

## Ajouter le champ

Dans la boucle de `nouvelleVersion()` :

```ts
let texte = `$${a}+${b}=$`

if (this.interactif) {
  texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
}
```

La condition conserve un énoncé propre quand l'interactivité est désactivée ou
quand l'exercice est exporté.

Une question ne contient **qu'un seul** appel à `ajouteChampTexteMathLive()`,
avec l'indice `i` de la question. Si elle attend plusieurs réponses, utiliser
un seul champ à trous avec `remplisLesBlancs()` (voir
[Texte à trous](complements/formats-interactifs.md#texte-à-trous)) ou des
sous-questions avec `createQuestion()`. Deux champs `2 * i` et `2 * i + 1`
décalent les indices de `autoCorrection` par rapport à `listeQuestions` (voir
[Un index par question](complements/un-index-par-question.md)).

Le champ reçoit automatiquement un nom pour les lecteurs d'écran
(« Exercice 2, question 3 : réponse »), complété par `texteAvant` quand c'est un
texte ou une formule simple. Rien à faire dans la plupart des cas. Pour un nom
plus précis, utiliser l'option facultative `nomAccessible`, qui remplace
« réponse » :

```ts
ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
  nomAccessible: 'longueur du segment AB',
})
```

Elle existe aussi pour `ajouteChampTexte()`, `remplisLesBlancs()`, le `field` de
`createQuestion()` et chaque champ d'un `multi-mathfield`. Sur un `<math-field>`
écrit à la main, poser l'attribut `data-nom-accessible`. Voir
[Nom accessible des champs de réponse](../maintenance-moteur/interactivite/systeme-interactivite.md#nom-accessible-des-champs-de-réponse).

## Enregistrer la réponse

Toujours avec le même indice `i` :

```ts
handleAnswers(
  this,
  i,
  {
    reponse: {
      value: a + b,
    },
  },
  { formatInteractif: 'mathalea-mathfield' },
) /
```

`formatInteractif` est le formatInteractif de la question [voir la documentation des formats interactifs](complements/formats-interactifs.md)

`value` reçoit la valeur que MathALÉA doit accepter. Le comparateur standard
convient aux nombres et expressions courantes. Attention au type : `value: 7`
(nombre) n'accepte que le résultat `7`, alors que `value: '7'` (chaîne)
accepte aussi `3+4`.

Pour une fraction, une unité, une expression sous une forme précise, un
ensemble ou plusieurs critères, utilisez en priorité les
[checks composables](complements/checks-composables.md) ; voir aussi
[Choisir les options de comparaison](complements/options-de-comparaison.md).

Un fichier d'exercice ne contient jamais de fonction de comparaison : si aucun
check ne convient, on en ajoute un dans `src/lib/interactif/checks/`.

## Exemple dans la boucle

```ts
const resultat = a + b
let texte = `$${a}+${b}=$`
const texteCorr = `$${a}+${b}=${resultat}$`

if (this.interactif) {
  texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
}

handleAnswers(this, i, {
  reponse: { value: resultat },
})

if (this.questionJamaisPosee(i, a, b)) {
  this.listeQuestions[i] = texte
  this.listeCorrections[i] = texteCorr
  i++
}
```

Déclarez la réponse avant d'incrémenter `i`.

## Règle impérative : un nombre de points fixe par question

Une question d'un exercice doit **toujours** rapporter le même nombre de
points maximum, quels que soient la graine et ce qui est tiré au sort. C'est
indispensable à la remontée des scores vers les recorders (Capytale, Moodle…),
qui enregistrent un barème maximum figé pour un exercice donné.

Par défaut, une question vaut 1 point, sauf les formats à plusieurs champs
(`fill-in-the-blank`, `tableau-mathlive`, `multi-mathfield`) corrigés avec
`toutAUnPoint`, qui rapportent **un point par champ**. Dès que le nombre de
champs d'une question dépend du tirage (nombre de solutions, de lignes, de
diviseurs, sous-problème tiré au sort…), fixez le total avec la clé `bareme`
de `handleAnswers()` :

```ts
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'

handleAnswers(
  this,
  i,
  { bareme: troisPointsProportionnels, ...reponses },
  { formatInteractif: 'multi-mathfield' },
)
```

`troisPointsProportionnels` ramène la proportion de champs justes sur 3 points,
`toutPourUnPoint` donne 1 point si tout est juste. Une fonction de barème
personnalisée doit, elle aussi, renvoyer un maximum constant.

Le détail technique (calcul de `pointsMaxExercice()`) est dans
[Système d'interactivité](../maintenance-moteur/interactivite/systeme-interactivite.md#stabilité-du-barème-face-au-tirage-aléatoire).

## Formats plus complexes

### Conserver un QCM en option

Pour un automatisme construit avec `ExerciceQcmA`, la classe
`src/exercices/ExerciceQcmACourt.ts` conserve le tirage et les propositions du
QCM, mais affiche une saisie courte par défaut. La case « Version QCM » (`sup3`)
réactive le QCM. La réponse attendue est normalement la première proposition,
sans délimiteurs mathématiques ni unité ; les propriétés `reponseCourte`,
`enonceCourt`, `correctionCourte`, `compareReponseCourte` et `clavierReponseCourte`
permettent de traiter les cas qui exigent une autre saisie, une consigne adaptée ou
une autre comparaison. Le texte placé avant ou après le champ se règle avec
`texteAvantReponseCourte` et `texteApresReponseCourte` (`optionsChampTexte` n'est pas lu
par `ExerciceQcmACourt`). Un texte écrit en dur, comme `$X=$`, est répété à l'identique à
chaque tirage : utiliser la lettre du tirage en cours. Le champ est placé
sous l'énoncé ; `champReponseCourteEnLigne = true` le place à la suite de
l'énoncé (par exemple après « $P\times$ »). Le score de la
saisie courte est toujours d’un point par question.

En saisie libre, le mode de comparaison peut être laissé à la comparaison par
défaut, qui accepte toute écriture de même valeur (`0,5`, `\frac{1}{2}`,
`\frac{2}{4}`…). Lorsque la forme de la réponse compte, elle est imposée en
donnant à `compareReponseCourte` une combinaison de
[checks](complements/checks-composables.md), jamais une fonction écrite dans
l'exercice :

```ts
import { isEqual, isFraction, seq } from '../../lib/interactif/checks'

this.compareReponseCourte = seq([isEqual(), isFraction()])
```

Une réponse attendue en fraction se vérifie avec `isFraction`, une réponse en
nombre décimal ou entier avec `onlyDecimalNumbers`. Ces contraintes sont
facultatives : 1A-E05-1, 1A-E05-3 et 1A-E05-4 gardent la comparaison par défaut,
alors que 1A-E05-2 et 1A-P05-1 à 5 imposent un mode.
Dans tous les cas, une probabilité ou une valeur doit être demandée comme telle
(« Quelle est la valeur de… ? »), et non comme une notation (`P_{A_3}(S)`) que la
comparaison ne saurait pas vérifier. Les exercices 1A-E05-1 à 4 et 1A-P05-1 à 6
donnent des exemples.

Quand plusieurs valeurs sont correctes (toute note comprise entre 0 et la médiane voulue,
toute valeur strictement comprise entre les deux termes centraux d'un effectif pair),
`reponseCourte` renvoie l'intervalle (`[0;9]`, `]9;10[`) et `compareReponseCourte` vaut
`seq([onlyDecimalNumbers(), valueInInterval()])` (la saisie doit être un nombre écrit en
chiffres, pas un calcul). La correction du QCM, qui
ne présente qu'une valeur, ne convient plus : `correctionCourte` énonce l'intervalle des
valeurs possibles, puis met en évidence un exemple. 1A-S02-1 et 1A-S02-9 donnent des exemples.

Le clavier virtuel de la saisie libre se règle avec `clavierReponseCourte`
(`KeyboardType`), choisi d'après le type de la réponse attendue : une fraction
demande `clavierDeBaseAvecFraction` ; des entiers relatifs, `clavierDeBase` ;
des entiers naturels ou des décimaux positifs, `clavierNumbers` (chiffres et
virgule) ; une liste de nombres séparés par des points-virgules,
`clavierNumbersAvecPointVirgule` (chiffres, virgule et point-virgule). Les autres cas (unités, lettres, puissances…) sont listés dans
[Claviers virtuels](../maintenance-moteur/interactivite/claviers.md). Sans
réglage, le clavier est `clavierDeBase`.

Pour les probabilités (notation `P(B)`, consigne « Calculer $P(B)$. » ou « $P(B)=$ »,
clavier et comparaison), voir [Probabilités](mathematiques/probabilites.md). Un exercice
en saisie libre n'a pas de ligne `amcType` (voir [Export AMC](complements/export-amc.md#type-amc-et-saisie-libre)).

La saisie libre est la valeur par défaut : la case « Version QCM » est décochée
(réglage hérité de `ExerciceQcmACourt`, sans rien à écrire dans le
constructeur). Pour un exercice déjà publié en QCM, ce changement de défaut
modifie les liens partagés sans paramètre `s3`. Il faut donc archiver la
version publiée avec `pnpm archive <code>` avant de changer le défaut : les
anciens liens gardent alors le QCM, et le fichier de travail reçoit un nouvel
`uuid`. Les exercices 1A-E05-1 à 1A-E05-4, 1A-P05-1 à 1A-P05-6 et 1A-S04-1 à 1A-S04-8
suivent ce modèle.

Quand la bonne réponse du QCM porte une unité (`$12\,^{\circ}\text{C}$`, `$25~\%$`),
`reponseCourte` ne garde que le nombre et l'unité passe dans `texteApresReponseCourte`.
Dans la `correction`, écrire la valeur dans `miseEnEvidence()` suivie de l'unité en noir
(voir [Couleur du résultat final](rediger-un-exercice.md#couleur-du-résultat-final)) :
`mettreEnEvidenceSelonMode()` (`src/lib/interactif/alignerMiseEnEvidenceQcm.ts`) met la
bonne proposition complète en orange en QCM et sans interactivité, et seulement la valeur
du champ en saisie libre.

`reponseCourte` est facultative. Sans elle, la réponse attendue est la première
proposition débarrassée des `$`, des `\text{…}` et `\mathrm{…}` (unités en lettres) et des
espaces fines `\,` : `$12\text{ cm}$` donne `12`. Elle est à écrire quand ce retrait ne
suffit pas : une unité qui n'est pas dans un `\text` (`^{\circ}`, `\%` après le nombre), une
réponse qui n'est pas la première proposition, une forme de réponse particulière
(intervalle, ensemble, fraction).

La correction de la saisie libre est la `correction` du QCM, dont `mettreEnEvidenceSelonMode()`
retire de l'orange ce que le champ n'attend pas. Une `correctionCourte` n'est utile que si
la question de la saisie libre n'est pas celle du QCM (voir
[Couleur du résultat final](rediger-un-exercice.md#couleur-du-résultat-final)).
Si la correction QCM est construite par une fonction (`corrige(mise, unite)`),
l'appeler deux fois, avec la bonne réponse QCM puis avec la réponse de la saisie
libre, évite de dupliquer le texte. Cette construction ne doit faire aucun
tirage aléatoire supplémentaire, sans quoi les tirages du QCM publié se
décalent.

Pour une grandeur dont l'élève doit donner l'unité (périmètre, aire, volume),
`src/lib/interactif/saisieGrandeur.ts` fournit la réponse attendue et la
comparaison :

- `reponseGrandeur(12.5, 'cm^2')` avec `compareGrandeur` accepte aussi une
  unité équivalente (`1250 mm²`) et refuse une saisie sans unité ;
- `reponseGrandeurAvecPi('16\\pi', 'cm^2')` avec `compareGrandeurAvecPi` pour
  une valeur exacte contenant $\pi$ (`unite: true` ne sait pas lire $\pi$) : la
  valeur est comparée sans forme imposée, l'unité doit être celle attendue.

La phrase qui porte la question se place dans `texteAvantReponseCourte`
(« L'aire du triangle $ABC$ vaut »). Le clavier est réduit au nécessaire :
`clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable` et
`optionsChampReponseCourte = optionsClavierGrandeur({ unitesEnonce, dimension,
unitePrincipale, avecPi })` donnent les chiffres, la virgule, $\pi$ si besoin,
les unités de l'énoncé à la puissance attendue, puis `mm` et `cm` (et l'unité
principale) aux trois puissances (`cm`, `cm²`, `cm³`, `mm`…) comme distracteurs. Les unités dépendant du
tirage se renseignent dans `appliquerLesValeurs`. Hors interactif, `enonceCourt` ajoute la question
posée classiquement. Comme l'unité est saisie, la mise en évidence de la
correction la contient. Modèles : 1A-G02-1 à 1A-G02-14.

Une composition de questions (`MetaExerciceCan`, par exemple `1A-A01-3`, `1A-A01-4` ou `2A-A01-3`) peut
elle aussi proposer la saisie libre. Ses questions étendent `ExerciceQcmACourt` et
mettent `this.sup3 = true` : seules, elles restent des QCM. La composition s'écrit
`super(questions, { versionQcm: true })` ; elle ajoute alors un 4e paramètre
« Version QCM » (décoché : saisie libre) qu'elle transmet à chaque question. En AMC,
les questions restent des QCM. Une composition qui n'active pas l'option garde ses
questions en QCM, même quand elles sont partagées avec une autre composition. Une
question peut proposer autre chose que la saisie courte quand « Version QCM » est décochée :
`EAM-CESpe-2026-Q4` fait construire la droite dans une figure apiGeom (voir
[Géométrie dynamique avec apiGeom](complements/geometrie-dynamique-apigeom.md)). Elle redéfinit
`nouvelleVersion()` (QCM si `sup3`, sinon construction avec les mêmes appels à `versionAleatoire()`)
et retrouve sa figure dans `correctionInteractive(i)` par `this.figuresApiGeom[i]`, car l'index de la
question change quand la composition l'héberge. Une construction n'a pas de réponse courte :
la question déclare `this.listeReponsesCourtes[i] = null` (voir
[Réponse courte et correction minimale](rediger-un-exercice.md#réponse-courte-et-correction-minimale)),
et `MetaExerciceCan` reporte cette déclaration à l'index de la composition.
Quand la mise en évidence de la correction du QCM porte sur « $S=$ valeur » alors que le champ
n'attend que la valeur, `mettreEnEvidenceSelonMode()` fait sortir le libellé de la mise en
évidence en saisie libre, sans rien écrire dans l'exercice. Un
intervalle se compare avec l'option `intervalle`, un ensemble de solutions avec
`ensembleDeNombres` et le clavier `clavierEnsemble` ; le libellé (`$S=$`) se règle avec
`texteAvantReponseCourte`. Une composition qui reformule ses sujets d'annales explique le
choix dans `this.comment`.
Archiver la composition avant de changer son défaut : son ancienne version, qui
n'active pas l'option, garde le QCM.

Un QCM « Quelle affirmation est vraie ? » se convertit en demandant la grandeur dont parle
l'affirmation vraie (la médiane, le minimum, l'étendue, un quartile, un effectif lu sur la
courbe…). `enonceCourt` remplace la question par « Déterminer… » ; la question, la réponse et la
correction sont fixées à chaque tirage, sans appel aléatoire de plus (voir
1A-S01-7 et 1A-S01-8). Quand l'unité suit le champ, `texteApresReponseCourte` peut être
réaffecté à chaque tirage.

Dans une figure, les nombres des légendes sont en mode mathématique, comme ceux de l'énoncé :
`texteParPosition('$50\\text{ habitants}$', …)` est tracé par `latex2d` (un texte qui commence
par `$` est traité ainsi), et un nombre placé dans un `\\text{…}` s'écrit entre `$`
(`'\\text{Notes sur $20$}'`). Les graduations de `repere` passent déjà par `latex2d`.

Le livre de recettes [Formats interactifs spécialisés](complements/formats-interactifs.md)
couvre notamment :

- les textes à trous et tableaux MathLive ;
- les champs texte et listes déroulantes ;
- les QCM ;
- le glisser-déposer et les sélections SVG ;
- les figures cliquables et composants spécialisés.

Si vous devez créer un nouveau type de composant ou modifier la vérification
globale, passez à la
[documentation moteur de l'interactivité](../maintenance-moteur/interactivite/systeme-interactivite.md).
