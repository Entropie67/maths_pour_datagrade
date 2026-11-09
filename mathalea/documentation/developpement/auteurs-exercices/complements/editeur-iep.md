# Éditeur Instrumenpoche

## Lisibilité des noms de points dans les animations

`Alea2iep.pointCreer(point, { dx, dy })` place le nom du point avec un décalage
en coordonnées de la figure. La méthode `pointNomDeplacer(point, { dx, dy })`
déplace ensuite ce même texte, sans créer un second nom ni déplacer le point.
Elle agit sur le dernier nom créé pour ce point par `pointCreer()` ou
`pointNommer()`.

Les macros de triangles acceptent `placerNomsSommets: true` dans leurs options
pour choisir chaque emplacement dès la création du point. Elles comparent
plusieurs positions autour du sommet et retiennent celle qui s'éloigne des côtés,
des traits de construction et, pour les constructions au compas, des arcs connus.
P011 utilise ce réglage pour ses six constructions. Sans cette option, les macros
conservent leur placement historique.

Le custom element `alea-iep-editeur` affiche un éditeur de programme de
construction aux instruments. Il sert notamment pour les exercices où l'élève
doit compléter une suite d'étapes puis tester l'animation avec Instrumenpoche.

## Utilisation dans un exercice

Utiliser le helper `addEditeurIep()` depuis
`src/lib/customElements/ElementIepEditeur.ts`.

```ts
import {
  addEditeurIep,
  type InstructionIep,
  type InstructionsDisponiblesIep,
} from '../../lib/customElements/ElementIepEditeur'

const programmeInitial: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0, protege: true },
  { type: 'point', nom: 'B', x: 5, y: 0, protege: true },
  { type: 'segment', p1: 'A', p2: 'B' },
  { type: 'demiDroitePointDirection', p1: 'A', angle: 45 },
  { type: 'droitePointPente', p1: 'B', pente: 1 },
]
const instructionsDisponibles: InstructionsDisponiblesIep = [
  'parallele',
  'intersection',
]

texte += addEditeurIep(this, i, {
  programmeInitial,
  instructionsDisponibles,
})
```

Le helper :

- retourne une figure statique en LaTeX ou en Typst hors HTML ;
- construit l'id avec la convention des `MathaleaCustomElement` si aucun `id`
  n'est fourni ;
- renseigne `autoCorrection[questionIndex].formatInteractif` avec
  `alea-iep-editeur`.

## Programme initial

L'option `conditionsInitiales` reçoit aussi un tableau d'`InstructionIep`,
mais ces instructions ne sont pas affichées dans le programme éditable. Elles
sont jouées immédiatement au début de l'animation, avant les instructions
visibles. Elles servent à installer une figure de départ que l'élève doit
compléter, par exemple un triangle sur lequel construire une hauteur ou un
cercle circonscrit.

Les conditions initiales sont incluses dans la valeur sauvegardée, dans la
réponse élève enregistrée et dans le programme à comparer à la réponse
attendue. Les instructions visibles peuvent référencer les étapes des
conditions initiales avec les indices du programme complet. Pour éviter les
ambiguïtés, la numérotation affichée des instructions visibles commence après
les étapes consommées par les conditions initiales.

Quand l'éditeur HTML est interactif, il affiche automatiquement au-dessus de la
zone « Ajouter une instruction » une figure statique correspondant aux
conditions initiales. Les exercices n'ont donc pas besoin d'ajouter une figure
`mathalea2d` séparée uniquement pour ce contexte. Si aucune condition initiale
n'est fournie, aucun aperçu SVG n'est affiché.

Quand l'éditeur HTML est interactif, il affiche aussi, sous cette figure, la liste
repliable « Étapes déjà construites » qui décrit les conditions initiales. Quand
cette liste n'apporte rien à l'élève (par exemple une grille de points nommés),
passer `masquerEtapesInitiales: true` : seule la figure reste affichée et la
numérotation des instructions de l'élève commence toujours à 1.

Dans l'animation de l'éditeur, les instruments nécessaires au programme sont
affichés dès le départ dans une zone de rangement en haut à droite du SVG. Après
chaque instruction, l'éditeur les remet silencieusement dans cette zone avec une
rotation-translation d'angle `0`. Les macros IEP jouées par l'éditeur
préservent la visibilité des instruments déjà visibles, ce qui évite les effets
de masquage/réapparition pendant la construction.

```ts
const conditionsInitiales: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0 },
  { type: 'point', nom: 'B', x: 5, y: 0 },
  { type: 'point', nom: 'C', x: 2, y: 3 },
  { type: 'polygoneRapide', sommets: 'A,B,C' },
]

texte += addEditeurIep(this, i, {
  conditionsInitiales,
  instructionsDisponibles: ['perpendiculaire', 'intersection'],
})
```

L'option `programmeInitial` reçoit un tableau d'`InstructionIep`. Ces
instructions sont chargées au premier affichage de l'éditeur et sont incluses
dans l'animation comme dans la valeur sauvegardée.

Si l'exercice est régénéré avec un autre `programmeInitial` mais le même id
d'éditeur, l'éditeur abandonne le programme sauvegardé précédent et repart du
nouveau programme initial. Cela évite de conserver les étapes d'une ancienne
version après un changement de paramétrage de l'exercice.

Chaque instruction peut porter `protege: true`. Ces instructions restent
visibles, mais l'élève ne peut pas les modifier, les supprimer ni les déplacer.
Les autres instructions du programme initial peuvent donc servir d'erreurs à
corriger.

L'option `instructionsInitialesProtegees` reste disponible pour verrouiller une
liste d'indices en dehors des instructions, en commençant à `0`. Le raccourci
`programmeInitialProtege: true` verrouille tout le programme initial.

## Instructions disponibles

L'option `instructionsDisponibles` limite les types proposés dans le menu
« Ajouter une instruction ». Elle reçoit des valeurs de type
`TypeInstructionIep`, ou directement une liste typée
`InstructionsDisponiblesIep`.

Dans l'éditeur, les instructions sont présentées par catégories : points,
tracés de base, constructions, codages, instruments et animation. Quand
`instructionsDisponibles` est fourni, seules les catégories contenant au moins
une instruction autorisée sont affichées.

Cette configuration convient par exemple pour faire construire un
parallélogramme avec les côtés opposés parallèles :

```ts
texte += addEditeurIep(this, i, {
  programmeInitial,
  instructionsDisponibles: ['parallele', 'intersection'],
})
```

Pour une construction par cercles de centre `O`, on peut proposer une palette
différente :

```ts
texte += addEditeurIep(this, i, {
  programmeInitial,
  instructionsDisponibles: ['cercle', 'intersection'],
})
```

Les instructions `point` et `pointADistance` demandent des coordonnées ou un
angle. Pour un élève qui doit seulement « placer un point » ou « placer un point
à 5 cm de A », on propose plutôt `pointLibre` (seul le nom est demandé) et
`pointADistanceLibre` (nom, point de départ et distance) : la position ou la
direction est tirée au hasard au moment de l'ajout, conservée si on modifie
l'étape, et n'apparaît pas dans le programme affiché (« Placer un point A. »,
« Placer un point B à 5 cm de A. »). Dans un programme écrit par l'exercice
(correction), on peut fixer `x`, `y` ou `angle` pour une figure reproductible.

L'instruction `pointSurObjetADistance` place un point sur une droite déjà
tracée (étape `etape` : droite, segment, demi-droite, parallèle,
perpendiculaire…) à `distance` cm du point `p1`. Des deux points possibles,
`choix` garde le plus haut (1), le plus bas (2), le plus à gauche (3) ou le
plus à droite (4). L'animation place le zéro de la règle graduée sur `p1`, dans
la direction du point, puis marque le point. Dans l'éditeur, la liste « De » ne
propose que les points situés sur la droite choisie.

Les sommets d'un polygone (`polygone`, `polygoneRapide`) s'écrivent « A,B,C »,
« A B C » ou « ABC » : sans séparateur, chaque nom commence par une majuscule
(« A1B1C1 », « A'B'C' »). Utiliser `lireSommetsPolygone()` pour les relire
dans un vérificateur.

L'instruction `arc` trace au compas une petite marque de centre `p1` autour du
point visé `p2`. L'instruction `arcPointPointCentre` trace un arc de cercle
dont on donne le centre et les deux extrémités : `p1` est le centre, `p2` la
première extrémité et `p3` la seconde extrémité. L'animation utilise
`Alea2iep.compasTracerArcCentre2extremites()` et trace le plus petit des deux arcs possibles ; pour un demi-cercle, il est tracé
de `p2` à `p3` dans le sens trigonométrique (inverse des aiguilles d'une
montre).

L'instruction `reporterLongueurCompas` reporte une longueur au compas :
`p1` et `p2` donnent l'écartement du compas, `p3` est le centre de l'arc tracé,
et `angle` donne la direction, en degrés, du point autour duquel tracer la
marque. L'animation utilise la macro
`Alea2iep.reporterAuCompas2pointsCentreDirection()`. Pour un report sur un
support de direction connue, passer `directionReportCompas` à l’éditeur : le
champ de direction et sa mention dans les descriptions sont masqués, et les
nouveaux reports utilisent cette direction. Les programmes JSON conservés
contiennent toujours leur angle explicite.

Les instructions `polygone` et `polygoneRapide` tracent un polygone fermé avec
les méthodes Alea2iep correspondantes :

- `polygone` appelle `Alea2iep.polygoneTracer` ;
- `polygoneRapide` appelle `Alea2iep.polygoneRapide`.

Elles reçoivent les sommets sous forme de chaîne, séparés par des virgules,
espaces ou points-virgules :

```ts
const programmeInitial: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0 },
  { type: 'point', nom: 'B', x: 5, y: 0 },
  { type: 'point', nom: 'C', x: 2, y: 3 },
  { type: 'polygone', sommets: 'A,B,C' },
]
```

L'instruction `milieu` place un point nommé au milieu de deux points déjà
construits, avec la macro `Alea2iep.milieuALaRegle()`.

L'instruction `codageMilieu` code les deux demi-segments de part et d'autre
d'un milieu déjà construit. Elle reçoit `p1` et `p3` comme extrémités du
segment, `p2` comme milieu, puis `codage` avec les mêmes symboles que
`segmentCodage`. Si les deux extrémités sont confondues, l'étape est ignorée.

L'instruction `demiTourPoint` construit l'image d'un point par la symétrie
centrale de centre un point déjà construit. Elle reçoit `nom` pour l'image,
`p1` pour le point antécédent et `p2` pour le centre de symétrie. L'animation
code automatiquement les deux demi-segments de part et d'autre du centre.

Les instructions `demiDroitePointDirection` et `droitePointPente` évitent de
créer un second point uniquement pour donner une direction :

- `demiDroitePointDirection` reçoit `p1` comme origine et `angle`, en degrés,
  mesuré avec l'horizontale entre `-180` et `180` ;
- `droitePointPente` reçoit `p1` et `pente`, le coefficient directeur. Pour une
  droite verticale dans un appel direct TypeScript, utiliser
  `Number.POSITIVE_INFINITY`. Dans le JSON de l'éditeur, utiliser la chaîne
  `"Infinity"` car JSON ne conserve pas les valeurs infinies numériques.

Dans l'éditeur, `angle` et `pente` peuvent être omis. La valeur est alors tirée
au hasard au moment de tester l'animation : un angle entier entre `-180` et
`180` pour `demiDroitePointDirection`, ou une pente entière entre `-5` et `5`
pour `droitePointPente`.

Pour limiter l'encombrement du SVG généré par l'éditeur, les droites et
demi-droites y sont tracées avec une longueur dédiée de `8` cm, au lieu de la
longueur courante de la règle.

L'instruction `paralleleAObjet` construit une parallèle à un objet déjà tracé
et passant par un point :

```ts
const programmeInitial: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0 },
  { type: 'point', nom: 'B', x: 2, y: 2 },
  { type: 'droitePointPente', p1: 'A' },
  { type: 'paralleleAObjet', etape: 2, p1: 'B' },
]
```

L'objet référencé par `etape` doit être une droite, un segment, une demi-droite
ou une parallèle déjà construite. Les étapes sont indexées à partir de `0` dans
le JSON, donc `etape: 2` désigne la troisième instruction.

L'instruction `perpendiculaireAObjet` suit le même principe pour construire une
perpendiculaire au support d'un objet directionnel déjà tracé :

```ts
const programmeInitial: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0 },
  { type: 'point', nom: 'B', x: 3, y: 2 },
  { type: 'demiDroitePointDirection', p1: 'A', angle: 30 },
  { type: 'perpendiculaireAObjet', etape: 2, p1: 'B' },
]
```

La perpendiculaire ainsi construite devient elle-même un objet directionnel et
peut servir à une intersection, une parallèle, une autre perpendiculaire ou un
prolongement.

Les tracés rectilignes qui représentent un support unique sont proposés comme
supports pour les points d'intersection, les parallèles à un objet, les
perpendiculaires à un objet et les prolongements. Cela inclut les droites,
segments, traits, demi-droites, parallèles, perpendiculaires, médiatrices,
bissectrices et demi-droites tracées au rapporteur.

L'instruction `prolongerObjet` ajoute un tracé plus long, centré sur le tracé
visible courant, pour un objet directionnel déjà construit, sans créer de
nouvel objet géométrique. Les intersections doivent donc continuer de
référencer l'objet initial :

```ts
const programmeInitial: InstructionIep[] = [
  { type: 'point', nom: 'A', x: 0, y: 0 },
  { type: 'point', nom: 'B', x: 4, y: 1 },
  { type: 'demiDroitePointDirection', p1: 'A', angle: 30 },
  { type: 'prolongerObjet', etape: 2, longueur: 15 },
]
```

La valeur `longueur` désigne la longueur totale du nouveau tracé.

## Options utiles

| Option                           | Rôle                                                                                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conditionsInitiales`            | Instructions jouées immédiatement avant le programme visible, sans être affichées dans l'éditeur.                                                                                  |
| `programmeInitial`               | Instructions déjà présentes dans l'éditeur.                                                                                                                                        |
| `instructionsDisponibles`        | Types d'instructions proposés dans le menu d'ajout.                                                                                                                                |
| `protege`                        | Propriété d'une instruction initiale qui la protège contre l'édition, la suppression et le déplacement.                                                                            |
| `instructionsInitialesProtegees` | Indices des instructions initiales à protéger.                                                                                                                                     |
| `programmeInitialProtege`        | Raccourci pour protéger tout le programme initial.                                                                                                                                 |
| `programmeAttendu`               | Programme complet attendu, utilisé seulement pour cadrer la figure imprimable de l'énoncé quand `interactivityOn` vaut `true`.                                                     |
| `loadSaveButtons`                | Affiche les boutons de sauvegarde et chargement JSON.                                                                                                                              |
| `allowFullscreen`                | Ajoute un bouton qui ouvre le lecteur dans une modale plein écran. La fermeture replace le même lecteur dans l'éditeur, sans perdre son état. Cette option est désactivée par défaut et peut aussi être activée dans un exercice élève. |
| `interactivityOn`                | Désactive l'édition quand la valeur vaut `false` : la zone d'ajout et les boutons de modification des lignes sont masqués, mais le bouton « Tester l'animation » reste disponible. |
| `masquerProgramme` | Masque la liste du programme de construction (HTML) : seule l'animation reste visible (bouton « Voir l'animation »), par exemple pour une correction animée sans le détail des instructions. |
| `clavier` | Blocs de touches du clavier virtuel MathALÉA pour les champs « nom », « nombre » et « sommets » du polygone (ex. `[['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ','], ['A', 'B', 'C']]`). Chaque chaîne est le texte inséré. Le champ nombre devient alors un champ texte qui accepte la virgule. Sans cette option, ce sont des champs de saisie ordinaires. Les noms de points proposés par défaut sont alors ceux des touches du clavier. |
| `sansOutils` | Retire des intitulés et des descriptions des étapes la mention des instruments (« à la règle », « au compas », « avec la règle et l’équerre »), ainsi que « (règle + équerre) » : c'est à l'élève de choisir son instrument. Les objets référencés par une étape (« la parallèle au segment [AB] passant par C ») sont toujours désignés par leur nom et non par leur numéro d'étape lorsque c'est possible. |
| `directionReportCompas` | Direction en degrés imposée aux nouveaux reports au compas. Masque le champ de direction et sa mention dans les descriptions. |
| `pointsMax` | Nombre de points de la question (1 par défaut), lu par `ElementIepEditeur.pointsMaxQuestion()`. Le vérificateur doit alors renvoyer un `score` sur ce total, le même pour tous les tirages. |
| `verifyCallbackName`             | Nom d'une callback de vérification enregistrée avec `ElementIepEditeur.registerVerificationCallback()`.                                                                            |

## Rendu imprimable

Hors HTML, `addEditeurIep()` retourne une figure statique sans instruments :

- en LaTeX : un `tikzpicture` ;
- en Typst : une image SVG embarquée dans un marqueur `<mathalea-typst>`.

Quand `interactivityOn` vaut `true`, la figure affichée à l'élève ne contient
que les conditions initiales. Le cadre est toutefois calculé pour contenir toute
la construction attendue si elle est disponible. Le helper essaie alors de lire
un programme IEP JSON depuis `autoCorrection[questionIndex].valeur.reponse.value`
(renseigné par `handleAnswers()`), ou utilise l'option `programmeAttendu` si
elle est fournie explicitement.

Quand `interactivityOn` vaut `false`, la figure imprimable contient les
conditions initiales et tout le `programmeInitial`, ce qui convient à une
correction statique.

## Vérification interactive

`ElementIepEditeur.verifQuestion(exercice, i)` enregistre la réponse élève dans
`exercice.answers`, désactive l'éditeur, puis vérifie la construction.

Par défaut, la vérification compare le programme élève à la réponse attendue
déclarée avec `handleAnswers()`, après normalisation des clés et sans tenir
compte de `protege`.

Pour les constructions qui acceptent plusieurs procédures équivalentes, utiliser
un callback nommé :

```ts
ElementIepEditeur.registerVerificationCallback(
  'mon-verificateur',
  ({ studentProgram, expectedRaw }) => {
    // Rejouer ou analyser studentProgram, puis comparer les objets finaux utiles.
    return { isOk: true, feedback: 'Bravo !' }
  },
)

texte += addEditeurIep(this, i, {
  programmeInitial,
  verifyCallbackName: 'mon-verificateur',
})
```

La callback reçoit `exercice`, `questionIndex`, `editor`, `studentProgram` et
`expectedRaw`, puis retourne `{ isOk, feedback?, score? }`.

Dans `6G2C-2`, le score reste sur 4 points pour chaque figure : un point pour
le report de la longueur totale sur la demi-droite, un pour le tracé d’un
segment sur cette demi-droite, un pour la longueur correcte du segment et un
pour un segment de longueur correcte, sur la demi-droite et en bleu. Le report
complet sans segment final est ainsi valorisé. La version archivée conserve
son ancien vérificateur et son score sur 1 point.
