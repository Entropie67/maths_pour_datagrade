# Faire un exercice 3D

Ce guide explique comment créer ou maintenir un exercice qui affiche un solide en 3D. Il couvre les deux rendus actuellement utilisés dans le dépôt :

- le rendu dynamique HTML avec `<canvas-3d>` et Three.js ;
- le rendu statique par projection 3D vers `mathalea2d()`, compatible HTML, LaTeX, PDF et AMC.

Les exemples et imports ci-dessous ont été vérifiés dans le code courant, notamment dans `src/exercices/can/6e/can6M3-04.ts`, `src/exercices/5e/5G53.ts`, `src/exercices/3e/3A10DNB1.ts`, `src/lib/3d/3d_dynamique/Canvas3DElement.ts` et `src/lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere.ts`.

## Pré-requis

Avant d'ajouter de la 3D, savoir créer un exercice classique et vérifier qu'il
génère déjà son énoncé, sa correction et sa réponse sans rendu 3D. Voir
[créer un exercice](../creer-un-exercice.md) et
[ajouter une interactivité simple](../interactivite-simple.md).

Installer les dépendances du dépôt, puis lancer les contrôles avec l'option demandée par le projet :

```bash
pnpm install
pnpm check:changed
pnpm prebuild-unit-tests
```

Pour prévisualiser localement :

```bash
pnpm dev
```

## Choisir le bon type de rendu

Utiliser un rendu statique `mathalea2d()` quand la figure doit apparaître en LaTeX, PDF ou AMC, ou quand l'élève n'a pas besoin de manipuler la scène. C'est le choix le plus robuste pour un exercice de géométrie classique. Les objets 3D projetés exposent une propriété `.c2d` qui contient les objets MathALÉA 2D à passer à `mathalea2d()`.

Utiliser `ajouteCanvas3d()` seulement pour l'HTML quand la rotation, le plein écran ou la visualisation dynamique apporte vraiment quelque chose. `Canvas3DElement` rend d'abord une image statique, puis ouvre une scène Three.js manipulable au clic ou au bouton plein écran. Ce rendu ne doit pas être le seul support de l'exercice, car il ne s'exporte pas en LaTeX.

Un bon modèle pour débuter est `src/exercices/can/6e/can6M3-04.ts` : si l'option "3D dynamique" est cochée et que le contexte est HTML, l'exercice affiche un canvas ; sinon il affiche le même pavé en projection statique.

## Structure recommandée

Séparer trois choses dans `nouvelleVersion()` :

1. les données mathématiques de l'exercice ;
2. la description de la scène dynamique ;
3. le rendu statique de secours.

Exemple minimal inspiré de `can6M3-04` :

```ts
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import {
  ajouteCanvas3d,
  type Elements3DDescription,
} from '../../../lib/3d/3d_dynamique/Canvas3DElement'
import { paveLPH3d } from '../../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { createUuid } from '../../../lib/outils/aleatoires'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'

const largeur = 3
const profondeur = 2
const hauteur = 4

if (this.sup && context.isHtml) {
  const cubes: Elements3DDescription[] = []

  for (let x = 0; x < largeur; x++) {
    for (let y = 0; y < profondeur; y++) {
      for (let z = 0; z < hauteur; z++) {
        cubes.push({
          type: 'cube',
          pos: [x, z, y],
          size: 1,
          edges: true,
        })
      }
    }
  }

  const content = {
    objects: [
      ...cubes,
      { type: 'ambientLight' as const, color: 0xffffff, intensity: 0.8 },
      {
        type: 'directionalLight' as const,
        color: 0xffffff,
        intensity: 1.2,
        position: [5, 5, 5],
      },
    ],
    autoCenterZoomMargin: 1.2,
  }

  this.question += ajouteCanvas3d({
    id: `canvas3d-mon-exercice-${createUuid()}`,
    content,
    width: 250,
    height: 250,
  })
} else {
  const pave = paveLPH3d(0, 0, 0, 0.75, largeur, profondeur, hauteur)
  this.question += mathalea2d(
    Object.assign({}, fixeBordures(pave.c2d)),
    pave.c2d,
  )
}
```

Points importants :

- `id` doit être unique, surtout si l'exercice peut générer plusieurs questions. Utiliser `createUuid()` ou inclure `this.numeroExercice` et l'indice de question.
- Le canvas dynamique doit être gardé derrière `context.isHtml`. En dehors de l'HTML, produire du `mathalea2d()` ou du texte.
- `this.sup` est souvent utilisé pour piloter une case "3D dynamique" : `this.besoinFormulaireCaseACocher = ['3D dynamique', false]`.
- Les imports relatifs changent selon le dossier de l'exercice ; reprendre le même style que les fichiers voisins.

## Ajouter une scène dynamique HTML

Le point d'entrée est :

```ts
import {
  ajouteCanvas3d,
  type Elements3DDescription,
} from '../../../lib/3d/3d_dynamique/Canvas3DElement'
```

`ajouteCanvas3d()` retourne une chaîne HTML :

```ts
ajouteCanvas3d({
  id: 'canvas3d-id-unique',
  content,
  width: 300,
  height: 300,
  className: 'classe-optionnelle',
  buttonLabel: 'Visualisation 3D', // optionnel : remplace la vignette par ce bouton
})
```

Par défaut, le composant affiche une image statique munie d'un bouton plein
écran. Avec `buttonLabel`, il n'affiche que le bouton demandé et ouvre
directement la scène manipulable au clic. Ce mode convient notamment à une
visualisation complémentaire placée dans une correction.

`content` est un objet sérialisable avec au minimum `objects`. Les options utiles sont :

- `autoCenterZoomMargin` : marge de cadrage automatique, souvent entre `1` et `1.4`.
- `cameraPosition` : position fixe de la caméra, par exemple `[8, 8, 8]`.
- `cameraTarget` : point visé, par exemple `[0, 0, 0]`.

Les types directement reconnus par `Canvas3DElement` sont actuellement :

- `cube` : `{ type: 'cube', pos: [x, y, z], size, edges }` ;
- `skyscraperGrid` : grille de hauteurs et quatre listes d'indices de
  visibilité (`north`, `south`, `west`, `east`), rendues avec un sol quadrillé,
  des immeubles texturés et les indices autour de la grille ;
- `bufferGeometry` : géométrie Three.js sérialisée ou union créée par les helpers de `solidesThreeJs.ts` ;
- `group` : objet Three.js sérialisé par `.toJSON()` ;
- `geoPoint` et `geoPoints` ;
- `realisticEarthSphere`, `customWireSphere`, `skySphere` ;
- `ambientLight`, `directionalLight` ;
- `canvas3dButton` pour des boutons dans l'overlay du canvas.

Pour un solide autre qu'un empilement de cubes, regarder `src/exercices/5e/5G53.ts`. Il utilise `createPrismWithWireframe()`, `createPyramidWithWireframe()`, `createTruncatedPyramidWithWireframe()` et `createWireframeUnion()` depuis `src/lib/3d/3d_dynamique/solidesThreeJs.ts`, puis passe le résultat comme `type: 'bufferGeometry'`.

Ne pas reprendre tels quels les anciens exemples de documentation qui mettaient `type: 'prism'`, `type: 'pyramid'` ou `type: 'wireframeUnion'` directement dans `objects` : ces libellés ne sont pas lus directement par `Canvas3DElement`. Il faut passer par `bufferGeometry` ou `group`.

### Contrat de sérialisation et conservation du rendu

`BufferGeometryDescription.geometry` contient les données de `.toJSON()`, soit
un `THREE.BufferGeometryJSON`, soit un `Object3DWithGeometriesJSON`. Le second
type complète `Object3DJSON` avec la liste optionnelle `geometries` émise à la
racine par Three.js. Ne pas transmettre une instance vivante de `Group` à la
place de ces données.

Pour une union, comme dans `src/exercices/6e/6G0-9.ts`, conserver :

```ts
const objects: Elements3DDescription[] = [
  {
    type: 'bufferGeometry',
    geometry: createWireframeUnion(geometries).toJSON(),
  },
]
```

L'appel explicite à `.toJSON()` produit les mêmes données que l'appel implicite
effectué par `JSON.stringify()` sur l'instance. Il n'ajoute pas de tirage
aléatoire. Le canvas filtre les ressources de type `BufferGeometry`, puis
reconstruit les faces et les arêtes avec ses propres matériaux. Le chemin
`group` utilise au contraire `ObjectLoader` et les matériaux sérialisés : ces
deux chemins ne sont pas interchangeables pour maintenir un rendu publié.

## Ajouter le rendu statique de secours

Le rendu statique utilise les classes de `src/lib/3d/3dProjectionMathalea2d/`. Elles construisent un solide en coordonnées 3D, puis fournissent sa projection 2D dans `.c2d`.

Exemple de pavé droit avec dimensions et annotations, d'après `src/exercices/3e/3A10DNB1.ts` :

```ts
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { point3d } from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { mathalea2d } from '../../modules/mathalea2d'

const pave = pave3d(
  point3d(0, 0, 0),
  point3d(6, 0, 0),
  point3d(0, 10, 0),
  point3d(0, 0, -2),
)

const hauteur = segment(pointAbstrait(-0.3, 0), pointAbstrait(-0.3, -2))
hauteur.styleExtremites = '<->'

const labelHauteur = latex2d('2\\text{ m}', -1.4, -1, {})
const objets = [pave.c2d, hauteur, labelHauteur]

this.question += mathalea2d(
  Object.assign({ scale: 0.5 }, fixeBordures(objets)),
  objets,
)
```

Pour les solides classiques, chercher d'abord dans `src/lib/3d/3dProjectionMathalea2d/` :

- `PaveEtPaveLPH3dPerspectiveCavaliere.ts` pour les pavés ;
- `Cube3dPerspectiveCavaliere.ts` et `CubeIso.ts` pour les cubes ;
- `Prisme3dPerspectiveCavaliere.ts` pour les prismes ;
- `Pyramide3dPerspectiveCavaliere.ts` et fichiers voisins pour les pyramides ;
- `Cylindre3dPerspectiveCavaliere.ts`, `Cone3dPerspectiveCavaliere.ts` et `Sphere3dPerspectiveCavaliere.ts` pour les solides usuels.

Pour ajuster l'orientation d'une projection, certains exercices modifient `context.anglePerspective` avant de créer les points 3D. Exemple : `src/exercices/CM2/CM2G5B-2.ts` choisit une perspective parmi `[-30, -60, 30, 60]`. Ne pas changer cette valeur globalement sans raison ; la fixer juste avant la construction de la figure concernée.

## Attentes HTML, LaTeX et AMC

En HTML, le canvas dynamique peut être utilisé dans `this.question`, `this.consigne`, `this.listeQuestions[i]` ou `this.listeCorrections[i]`. Choisir une taille raisonnable : `200x200` pour une question courte, `300x300` ou `500x500` pour une scène qui doit être lue précisément.

En LaTeX et PDF, utiliser `mathalea2d()`. Les objets issus de `.c2d` sont rendus en TikZ quand c'est possible, alors qu'un `<canvas-3d>` brut ne produira pas une figure exploitable.

En AMC, éviter que la réponse dépende d'une manipulation du canvas. Si l'exercice est déclaré compatible AMC (`amcReady = true`), l'énoncé AMC doit contenir une figure statique ou une description textuelle suffisante. `can6M3-04` garde `amcReady = true` parce que le rendu dynamique est conditionné par `context.isHtml` et qu'un pavé statique est généré sinon.

## Interactivité

Le canvas 3D est un support visuel, pas un système de réponse. Pour demander une réponse, utiliser les mécanismes interactifs standards :

- `mathLive` ou `ajouteChampTexteMathLive()` pour une valeur numérique ou algébrique ;
  `handleAnswers()` pour déclarer la réponse attendue ;
- `qcm` et `propositionsQcm()` quand la réponse est un choix.

Ne pas exiger que l'élève clique dans la scène 3D pour que la réponse soit vérifiable, sauf si un vrai composant interactif dédié existe et que le même exercice reste compréhensible sans WebGL. Les boutons `canvas3dButton` peuvent piloter une animation ou une aide visuelle, mais ils ne remplacent pas le champ de réponse MathALÉA.

## Prévisualiser localement

1. Lancer le serveur :

```bash
pnpm dev
```

1. Ouvrir l'exercice dans l'interface locale, puis vérifier :

- le mode HTML avec l'option "3D dynamique" cochée si elle existe ;
- le mode HTML avec cette option décochée ;
- une génération avec plusieurs graines pour repérer les cadrages limites ;
- la correction ;
- un export LaTeX/PDF ou AMC si l'exercice annonce cette compatibilité.

1. Pour cibler rapidement un exercice, utiliser sa référence déclarée dans `refs`, par exemple `can6M3-04`, ou son `uuid` si l'interface locale le permet.

## Tests et vérifications

Avant de proposer une modification :

```bash
pnpm check:changed
pnpm prebuild-unit-tests
```

Pour un changement qui touche les exports, ajouter les tests e2e adaptés :

```bash
pnpm test:e2e:latex_compile
pnpm test:e2e:pdfexports
```

Les tests e2e mockent déjà `Canvas3DElement` dans plusieurs suites, notamment `tests/e2e/tests/all_exercises/all_exercises.test.ts`, `tests/e2e/tests/latex_compile/latex_compile.test.ts`, `tests/e2e/tests/latex_breaks/latex_breaks.test.ts` et `tests/e2e/tests/pdfexports/pdfexports.test.ts`. Si un test échoue autour du rendu 3D dynamique, vérifier d'abord que le code ne dépend pas d'un vrai contexte WebGL pendant la génération de l'exercice.

## Performance et accessibilité

Limiter le nombre d'objets Three.js. Un pavé de cubes détaillé est lisible pour quelques dizaines de cubes ; au-delà, préférer une géométrie fusionnée (`bufferGeometry`) ou une projection statique.

Toujours ajouter des lumières explicites (`ambientLight` et au moins une `directionalLight`) dans une scène dynamique. Sans lumière, certains matériaux peuvent apparaître noirs ou peu lisibles.

Ne pas tout miser sur la couleur, la rotation ou le plein écran. L'énoncé et la correction doivent expliquer ce qu'il faut lire dans la figure. Les labels, dimensions et codages importants sont souvent plus fiables dans le rendu statique `mathalea2d()`.

Éviter les canvas trop larges dans une liste de questions : ils gênent les petits écrans et ralentissent la page. Un canvas dynamique peut être cliqué pour passer en plein écran ; le rendu intégré peut donc rester compact.

## Dépannage

Si rien ne s'affiche en HTML :

- vérifier que le code passe bien par `context.isHtml` avant d'appeler `ajouteCanvas3d()` ;
- vérifier que `content.objects` contient au moins un objet visible et une lumière ;
- vérifier que l'attribut `content` reste sérialisable avec `JSON.stringify()` ;
- vérifier que l'`id` du canvas est unique.

Si le solide est coupé ou trop petit :

- ajuster `autoCenterZoomMargin` ;
- fixer `cameraPosition` et `cameraTarget` pour les scènes où le cadrage automatique ne convient pas ;
- côté statique, recalculer les bornes avec `fixeBordures(objets)` et ajuster `scale`.

Si l'export LaTeX ou PDF contient du HTML 3D :

- déplacer `ajouteCanvas3d()` dans une branche `if (context.isHtml)` ;
- fournir une branche `else` avec `mathalea2d()` ou un texte de remplacement ;
- vérifier les chemins AMC si `amcReady = true`.

Si TypeScript refuse `content.objects` :

- typer la liste en `Elements3DDescription[]` ;
- utiliser `as const` sur les littéraux `type` lorsque TypeScript les élargit en `string` ;
- pour une géométrie complexe, passer par `{ type: 'bufferGeometry', geometry: ... }` ou `{ type: 'group', object: group.toJSON() }`.

Si une figure statique a des faces ou arêtes cachées inattendues :

- vérifier l'ordre des points passés au constructeur ;
- tester une autre valeur de `context.anglePerspective` ;
- lire le constructeur du solide dans `src/lib/3d/3dProjectionMathalea2d/`, car certains calculs de visibilité dépendent de l'orientation et du signe des coordonnées.

## Checklist avant validation

- Les données mathématiques et la scène 3D sont séparées.
- Le rendu dynamique est limité à `context.isHtml`.
- Un rendu statique ou textuel existe pour LaTeX, PDF et AMC.
- L'`id` de chaque canvas est unique.
- L'exercice reste résoluble sans manipulation du canvas.
- Les dimensions, labels et couleurs restent lisibles en HTML et en export.
- `pnpm check:changed` et `pnpm prebuild-unit-tests` ont été lancés, ou leur non-exécution est documentée dans la réponse de fin.
