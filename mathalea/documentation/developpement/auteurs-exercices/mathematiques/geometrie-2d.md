# Géométrie 2D

Ce guide explique comment construire une figure avec MathALEA2D, la styler, l'intégrer dans un exercice et vérifier son rendu HTML comme LaTeX/TikZ. Il complète les références du code : les helpers vivent surtout dans `src/lib/2d/` et le moteur de rendu dans `src/modules/mathalea2d.ts`.

## Parcours minimal

Dans un exercice, une figure MathALEA2D se construit toujours dans cet ordre :

1. Créer les objets de calcul : points, droites de construction, milieux, intersections.
2. Créer les objets graphiques à afficher : segments, traces de points, polygones, labels, repères.
3. Placer seulement les objets graphiques dans un tableau `objets`.
4. Appeler `mathalea2d(options, objets)` et ajouter la chaîne produite à l'énoncé ou à la correction.

Exemple complet :

```ts
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { mathalea2d } from '../../modules/mathalea2d'

let texte = ''
const A = pointAbstrait(0, 0, 'A', 'below left')
const B = pointAbstrait(5, 0, 'B', 'below right')
const C = pointAbstrait(2, 3, 'C', 'above')
const M = milieu(A, B, 'M', 'below')

const [triangle, nomsSommets] = polygoneAvecNom(A, B, C)
triangle.color = colorToLatexOrHTML('#1f77b4')
triangle.epaisseur = 2

const base = segment(A, B, '#d62728')
base.epaisseur = 2
const traceM = tracePoint(M, '#d62728')
traceM.taille = 4

const labelM = latex2d('M', M.x, M.y - 0.35, {
  color: '#d62728',
  backgroundColor: '',
  letterSize: 'scriptsize',
})

const objets = [triangle, nomsSommets, base, traceM, labelM]
texte += mathalea2d(
  Object.assign({ pixelsParCm: 25, scale: 0.75 }, fixeBordures(objets)),
  objets,
)
```

Les points `A`, `B`, `C` et `M` servent aux calculs. Ils ne s'affichent pas tout seuls. Pour voir un point, il faut ajouter un objet graphique comme `tracePoint(A)` ou un label comme `polygoneAvecNom(...)`.

## Choisir Les Objets

Commencer par chercher si le helper existe déjà dans `src/lib/2d/` avec `rg "export function nomDuBesoin" src/lib/2d`. Les familles les plus utilisées sont :

| Besoin | Helpers courants | Imports |
| --- | --- | --- |
| Point de construction | `pointAbstrait`, `point` | `../../lib/2d/PointAbstrait` |
| Segment, vecteur visuel | `segment`, puis `styleExtremites = '->'` | `../../lib/2d/segmentsVecteurs` |
| Droite | `droite`, `droiteParPointEtParallele`, `droiteParPointEtPerpendiculaire` | `../../lib/2d/droites` |
| Cercle ou disque | `cercle`, `cercleCentrePoint` | `../../lib/2d/cercle` |
| Polygone | `polygone`, `polygoneAvecNom` | `../../lib/2d/polygones` |
| Tracer un point | `tracePoint` | `../../lib/2d/TracePoint` |
| Texte simple | `texteParPosition`, `texteParPoint` | `../../lib/2d/textes` |
| Formule LaTeX | `latex2d`, `latexParPoint` | `../../lib/2d/textes` |
| Mesures et codages | `afficheLongueurSegment`, `afficheCoteSegment`, `codageAngleDroit`, `codageSegment`, `codageSegments` | fichiers dédiés dans `src/lib/2d/` |
| Calculs géométriques | `milieu`, `pointSurSegment`, `pointSurCercle`, `pointIntersectionDD` | `../../lib/2d/utilitairesPoint` |
| Repère | `repere` ou `RepereBuilder` | `../../lib/2d/reperes`, `../../lib/2d/RepereBuilder` |
| Courbe | `new Courbe(f, { repere, ... })` | `../../lib/2d/Courbe` |

Préférer `pointAbstrait` pour les nouveaux exercices. `point` existe encore, mais il est marqué comme déprécié dans le code.

## Créer Une Figure Pas À Pas

### 1. Définir les points

Les points sont des primitives de calcul.

```ts
const A = pointAbstrait(0, 0, 'A', 'below left')
const B = pointAbstrait(4, 1, 'B', 'right')
const C = pointAbstrait(1, 3, 'C', 'above')
```

Les positions de label usuelles sont `left`, `right`, `below`, `above`, `above right`, `above left`, `below right`, `below left`.

### 2. Créer les objets visibles

```ts
const [abc, noms] = polygoneAvecNom(A, B, C)
const AB = segment(A, B, 'black')
const points = tracePoint(A, B, C, 'black')
```

`polygoneAvecNom(A, B, C)` retourne un couple `[polygone, nomsDesSommets]`. Il faut ajouter les deux au rendu si l'on veut voir le contour et les noms.

### 3. Ajouter les constructions utiles

```ts
const M = milieu(A, B, 'M', 'below')
const traceM = tracePoint(M, 'red')
const AM = segment(A, M, 'red')
AM.pointilles = 5
```

Ne pas ajouter `M` au tableau `objets` : ajouter `traceM`, `AM` ou un label.

### 4. Rendre dans l'exercice

```ts
const objets = [abc, noms, points, traceM, AM]
texte += mathalea2d(
  Object.assign({ pixelsParCm: 20, scale: 0.7 }, fixeBordures(objets)),
  objets,
)
```

`mathalea2d` retourne du SVG en contexte HTML et du TikZ en contexte LaTeX. Le même appel peut donc être utilisé dans `this.listeQuestions[i]` ou `this.listeCorrections[i]`.

Dans un nouvel exercice, chaque figure porte l'option `description` ou `decorative` : voir [Accessibilité](../rediger-un-exercice.md#accessibilité).

## Styles, Couleurs Et Tailles

Les objets MathALEA2D héritent de propriétés communes : `color`, `epaisseur`, `opacite`, `pointilles`, `style`, `id`, `bordures`.

### Couleurs

Le plus simple est de passer la couleur au helper :

```ts
const AB = segment(A, B, 'red')
const c = cercle(A, 2, '#f15929', 'none')
```

Quand il faut modifier la couleur après création, utiliser `colorToLatexOrHTML` :

```ts
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'

AB.color = colorToLatexOrHTML('#f15929')
```

Ne pas faire `AB.color = 'red'` : plusieurs objets attendent le couple `[couleurSvg, couleurTikz]`, pas une chaîne.

### Épaisseur, opacité et pointillés

```ts
AB.epaisseur = 2
AB.opacite = 0.7
AB.pointilles = 5
```

Les valeurs de `pointilles` sont des codes internes. Sur les segments, par exemple, `4` donne un rendu pointillé et `5` un rendu en tirets. Toujours vérifier en HTML et en LaTeX, car les styles SVG et TikZ ne sont pas strictement identiques.

### Extrémités et vecteurs

Un segment devient une flèche en réglant `styleExtremites` :

```ts
const vecteurAB = segment(A, B, 'blue')
vecteurAB.styleExtremites = '->'
vecteurAB.tailleExtremites = 4
```

Les styles les plus courants sont `->`, `<-`, `<->`, `|-|`. Le rendu TikZ utilise des pointes adaptées.

### Taille des traces et labels

```ts
const traceA = tracePoint(A, 'red')
traceA.taille = 4
traceA.epaisseur = 2

const label = latex2d('\\widehat{ABC}=60^\\circ', 2, 1.5, {
  color: 'black',
  backgroundColor: 'white',
  letterSize: 'scriptsize',
})
```

Pour un texte sans formule, utiliser `texteParPosition('O', -0.3, -0.3)`. Pour une formule, préférer `latex2d` ou `latexParPoint`. Ne pas mettre les délimiteurs `$...$` dans `latex2d`.

## Fenêtre Et Dimensions

`mathalea2d` reçoit une fenêtre en coordonnées mathématiques : `xmin`, `ymin`, `xmax`, `ymax`. Deux approches sont possibles.

Pour une figure fixe :

```ts
texte += mathalea2d(
  { xmin: -1, ymin: -1, xmax: 6, ymax: 4, pixelsParCm: 25, scale: 0.7 },
  objets,
)
```

Pour une figure aléatoire, préférer `fixeBordures(objets)` :

```ts
const params = Object.assign(
  { pixelsParCm: 25, scale: 0.65 },
  fixeBordures(objets, { rxmin: -0.8, rymin: -0.8, rxmax: 0.8, rymax: 0.8 }),
)
texte += mathalea2d(params, objets)
```

Les marges de `fixeBordures` sont relatives aux coordonnées de la figure. Les valeurs par défaut ajoutent déjà une marge de `0.5` à droite et en haut, et `-0.5` à gauche et en bas.

Attention avec les droites : une `Droite` est représentée par un segment très long pour simuler une droite infinie. Si vous passez une droite à `fixeBordures`, la fenêtre peut devenir énorme. Dans ce cas, fixer manuellement `xmin`, `ymin`, `xmax`, `ymax`, ou calculer les bordures à partir des autres objets.

## Repères

Pour un repère simple, `repere({...})` reste direct :

```ts
import { repere } from '../../lib/2d/reperes'

const r = repere({
  xMin: -5,
  xMax: 5,
  yMin: -3,
  yMax: 3,
  xUnite: 1,
  yUnite: 1,
  thickHauteur: 0.1,
  axeXStyle: '->',
  axeYStyle: '->',
})
```

Pour un repère configurable, utiliser `RepereBuilder` :

```ts
import RepereBuilder from '../../lib/2d/RepereBuilder'

const r = new RepereBuilder({ xMin: -5, xMax: 5, yMin: -3, yMax: 3 })
  .setUniteX(1)
  .setUniteY(1)
  .setThickX({ xMin: -5, xMax: 5, dx: 1 })
  .setThickY({ yMin: -3, yMax: 3, dy: 1 })
  .setGrille({
    grilleX: { xMin: -5, xMax: 5, dx: 1, style: 'pointilles' },
    grilleY: { yMin: -3, yMax: 3, dy: 1, style: 'pointilles' },
  })
  .setLabelX({ xMin: -5, xMax: 5, dx: 1 })
  .setLabelY({ yMin: -3, yMax: 3, dy: 1 })
  .buildStandard()
```

Un `Repere` est un objet composite : `mathalea2d` sait développer sa propriété `objets`. Il peut donc être ajouté directement dans `objets`.

```ts
const objets = [r, courbe, pointsRemarquables]
texte += mathalea2d({ xmin: -5, ymin: -3, xmax: 5, ymax: 3, scale: 0.65 }, objets)
```

Pour les courbes, construire le repère avant la courbe :

```ts
import { Courbe } from '../../lib/2d/Courbe'

const f = (x: number) => x * x - 2
const courbe = new Courbe(f, {
  repere: r,
  color: 'blue',
  epaisseur: 2,
  step: 0.1,
})
```

Réduire `step` rend la courbe plus lisse mais augmente le coût de calcul. Tester le rendu si le domaine est large.

## LaTeX Et TikZ

`mathalea2d` produit automatiquement le TikZ quand `context.isHtml` est faux. Les options utiles :

```ts
mathalea2d(
  {
    xmin: -1,
    ymin: -1,
    xmax: 6,
    ymax: 4,
    scale: 0.7,
    centerLatex: true,
    optionsTikz: 'baseline={([yshift={-\\ht\\strutbox}]current bounding box.north)}',
  },
  objets,
)
```

À connaître :

- `pixelsParCm` règle la taille HTML.
- `scale` règle la taille LaTeX/TikZ.
- `display: 'inline' | 'inline-block' | 'block'` règle le conteneur HTML.
- `center: true` centre le conteneur HTML.
- `centerLatex: true` ajoute un centrage côté LaTeX.
- `mainlevee: true` active les sorties à main levée quand l'objet les implémente.
- `optionsTikz` ajoute des options à `\begin{tikzpicture}`.

Pour les courbes de fonctions exportées via `pgfplots`, activer `usePgfplots` dans `mathalea2d` et dans la courbe, puis fournir `fLatex` :

```ts
const courbe = new Courbe(f, {
  repere: r,
  color: 'blue',
  usePgfplots: true,
  fLatex: 'x^2-2',
})

texte += mathalea2d(
  { xmin: -5, ymin: -3, xmax: 5, ymax: 6, scale: 0.7, usePgfplots: true },
  r,
  courbe,
)
```

Avec `usePgfplots`, le repère est ignoré côté TikZ par le rendu pgfplots, mais il reste utile côté HTML et pour les bornes.

## Lecture Graphique Animée

Pour une correction HTML où l'on veut montrer la lecture de l'image d'un nombre,
utiliser `lectureImageAnimee()` avec une figure `mathalea2d` qui possède un
`id`. Le helper injecte un bouton `Revoir`, affiche l'antécédent sous l'axe des
abscisses, trace le segment vertical puis le segment horizontal, et place l'image
sur l'axe des ordonnées.

```ts
import { lectureImage, lectureImageAnimee } from '../../lib/2d/LectureImage'

const figureId = `lectureImageEx${this.numeroExercice}Q${i}`

texteCorr += context.isHtml && !context.isTypst
  ? mathalea2d({ ...optionsFigure, id: figureId }, objetsEnonce) +
    lectureImageAnimee({
      figureId,
      x: antecedent,
      y: image,
      pixelsParCm: optionsFigure.pixelsParCm,
    })
  : mathalea2d(optionsFigure, [...objetsEnonce, lectureImage(antecedent, image)])
```

La figure animée est réservée au HTML. Pour LaTeX et Typst, garder une figure
MathALEA2D statique avec `lectureImage()` afin que l'export reste autonome.

## Intégration Dans Une Question

Dans `nouvelleVersion()`, le schéma classique est :

```ts
let texte = ''
let texteCorr = ''
const objetsEnonce = []
const objetsCorrection = []

// Construire les objets...
objetsEnonce.push(figureEnonce, labelsEnonce)
objetsCorrection.push(figureCorrection, labelsCorrection, aides)

texte += mathalea2d(
  Object.assign({ pixelsParCm: 20, scale: 0.65 }, fixeBordures(objetsEnonce)),
  objetsEnonce,
)

texteCorr += mathalea2d(
  Object.assign({ pixelsParCm: 20, scale: 0.65 }, fixeBordures(objetsCorrection)),
  objetsCorrection,
)

this.listeQuestions[i] = texte
this.listeCorrections[i] = texteCorr
```

Quand la figure dépend d'un tirage aléatoire, inclure dans `questionJamaisPosee` les paramètres qui changent réellement la figure.

## Prévisualiser Et Tester

Avant de considérer un exercice terminé :

1. Lancer l'exercice dans l'interface locale et vérifier que la figure n'est pas coupée.
2. Activer la correction si la figure n'apparaît que dans `texteCorr`.
3. Tester une version LaTeX/PDF si l'exercice est exportable.
4. Vérifier les cas extrêmes des tirages aléatoires : points proches, points alignés, valeurs négatives, grand repère.
5. Exécuter les commandes demandées par le projet avant commit : `pnpm prebuild-unit-tests` et `pnpm check:changed`.

Pour trouver des exemples existants :

```sh
rg "mathalea2d\\(" src/exercices
rg "new RepereBuilder|repere\\(" src/exercices src/lib
rg "tracePoint\\(|polygoneAvecNom|afficheLongueurSegment" src/exercices
```

## Notations Propres Au Référentiel Suisse

Le parallélisme de deux droites s'écrit `(AB)//(CD)` en France et `(AB)\parallel(CD)` en Suisse. Ne jamais écrire `//` en dur dans un énoncé ou une correction : utiliser `symboleParallele()` de `src/lib/outils/notationsGeometrie.ts`. Il renvoie `//` ou `\parallel ` selon `getLang()` (valeur `'fr-CH'` pour le référentiel suisse).

```ts
import { symboleParallele } from '../../lib/outils/notationsGeometrie'

texte = `$(${A.nom + B.nom})${symboleParallele()}(${C.nom + D.nom})$`
```

À appeler dans `nouvelleVersion()` (pas dans le constructeur), jamais dans un `codageSegments('//')` : ce sont les marques de segments de même longueur sur une figure, sans rapport avec le parallélisme.

## Erreurs Fréquentes

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| Le point n'apparaît pas | Un `PointAbstrait` a été créé mais aucun objet visible ne le trace | Ajouter `tracePoint(A)` ou un label |
| Les noms des sommets manquent | Seul le polygone a été ajouté | Avec `polygoneAvecNom`, ajouter le polygone et l'objet de noms |
| La figure est coupée | Fenêtre `xmin/ymin/xmax/ymax` trop petite | Utiliser `fixeBordures(objets)` ou augmenter les marges |
| La figure est minuscule | Une droite a été passée à `fixeBordures` | Fixer la fenêtre manuellement ou exclure la droite du calcul des bordures |
| Couleur correcte en HTML mais cassée en LaTeX | Couleur modifiée avec une chaîne brute | Utiliser le paramètre couleur du helper ou `colorToLatexOrHTML` |
| Texte mathématique mal rendu | `$...$` passé à `latex2d` | Passer seulement le contenu LaTeX, sans `$` |
| Rendu HTML correct mais export LaTeX trop grand | `pixelsParCm` ajusté, mais pas `scale` | Régler `scale` pour LaTeX |
| Labels décalés dans un repère | Unités `xUnite/yUnite` ou écarts de labels incohérents | Vérifier `setUniteX`, `setUniteY`, `xLabelEcart`, `yLabelEcart` |
| Courbe lente ou saccadée | `step` trop petit ou domaine trop large | Augmenter `step`, réduire le domaine ou simplifier la fonction |

## Dépannage

Si un objet ne s'affiche pas, vérifier d'abord que l'objet ajouté à `mathalea2d` possède bien une sortie graphique. Les points de construction, nombres, tableaux de coordonnées ou objets de calcul seuls ne produisent rien.

Si `fixeBordures` signale des bordures invalides, isoler les objets :

```ts
const objets = [objet1, objet2, objet3]
console.log(objets.map((objet) => [objet.constructor.name, objet.bordures]))
```

Si un label est masqué, ajouter un fond blanc transparent ou déplacer le point d'ancrage :

```ts
const etiquette = latex2d('A_1', A.x + 0.25, A.y + 0.25, {
  color: 'black',
  backgroundColor: 'white',
  letterSize: 'scriptsize',
})
```

Si une construction dépend d'une intersection, traiter les cas dégénérés avant de tracer : deux droites parallèles, segment de longueur nulle, points confondus, cercle de rayon nul. Les helpers préviennent parfois via `window.notify`, mais un exercice doit éviter de générer ces cas dans ses tirages.

Si le rendu LaTeX ne correspond pas au HTML, réduire l'exemple au minimum : un repère, un segment, un label. Ajouter ensuite les objets un par un. Les différences viennent souvent de `scale`, `optionsTikz`, des couleurs ou d'un objet composite.

## Sources Vérifiées

Cette page reprend les anciennes notes de `old-documentation/2.-Documentation-Technique/2.4-Gestion-des-Mathématiques/2.4.2-Géométrie/` et les vérifie contre les fichiers actuels suivants :

- `src/modules/mathalea2d.ts`
- `src/lib/2d/PointAbstrait.ts`
- `src/lib/2d/segmentsVecteurs.ts`
- `src/lib/2d/reperes.ts`
- `src/lib/2d/RepereBuilder.ts`
- `src/lib/2d/fixeBordures.ts`
- `src/lib/2d/textes.ts`
- `src/lib/2d/polygones.ts`
- `src/lib/2d/Courbe.ts`
- `src/lib/outils/notationsGeometrie.ts`
