# Géométrie dynamique avec apiGeom

[apiGeom](https://forge.apps.education.fr/coopmaths/apiGeom) est la
bibliothèque de géométrie dynamique de l'association. Sa classe `Figure`
affiche une figure statique ou interactive, propose une barre d'outils à
l'élève et fournit des méthodes pour vérifier sa construction.

Modèle : `src/exercices/modèlesExos/20_exercice_classique_apigeom.ts`.
Exemples : les exercices de `src/exercices/geodyn/` et, par exemple,
`src/exercices/5e/5G1B-3.ts` (`rg "from 'apigeom'" src/exercices` les liste
tous).

Vidéos de présentation (anciennes API : `testAngle` est devenu `checkAngle`) :
[rectangle 1](https://podeduc.apps.education.fr/video/27470-programmer-un-exercice-de-geometrie-dynamique-le-rectangle-1/),
[rectangle 2](https://podeduc.apps.education.fr/video/27471-programmer-un-exercice-de-geometrie-dynamique-le-rectangle-2/),
[animation en correction](https://podeduc.apps.education.fr/video/27522-programmer-un-exercice-de-geometrie-dynamique-ajout-dune-animation-en-correction/).

## Créer et afficher une figure

```ts
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'

// dans la boucle de nouvelleVersion()
this.figuresApiGeom[i] = new Figure({ xMin: -5.5, yMin: -5.5, width: 330, height: 330 })
const figure = this.figuresApiGeom[i]

const A = figure.create('Point', { x: 0, y: 0, label: 'A', shape: 'o' })
const B = figure.create('Point', { x: 7, y: 2, label: 'B', color: 'blue' })
const AB = figure.create('Line', { point1: A, point2: B })
const C = figure.create('Point', { x: 3, y: 5, label: 'C' })
figure.create('LineParallel', { line: AB, point: C, color: 'blue', thickness: 2 })

figure.setToolbar({ tools: ['POINT', 'LINE', 'DRAG', 'REMOVE'], position: 'top' })

texte += figureApigeom({ exercice: this, i, figure, defaultAction: 'POINT' })
```

- Initialiser `this.figuresApiGeom = []` au début de `nouvelleVersion()` et
  ranger la figure de la question `i` dans `this.figuresApiGeom[i]`.
- `setToolbar()` choisit les outils proposés (`tools`) et la position de la
  barre (`'left'`, `'top'` ou `'none'`). La liste des outils est le type
  `availableButtons` de `apigeom/src/userInterface/availableButtons.ts`.
- `figureApigeom()` (`src/lib/figureApigeom.ts`) insère la figure dans
  l'énoncé. Options : `defaultAction` (outil actif au démarrage, qui doit être
  dans la barre), `idAddendum` (pour distinguer une deuxième figure dans la
  question ou celle de la correction), `isDynamic: false` (figure figée même en
  interactif), `animation`, `hasFeedback`.
- `figureApigeom()` ne produit rien hors HTML : prévoir une figure
  MathALÉA 2D, `figure.tikz()` ou un texte pour la sortie LaTeX. En Typst,
  `context.isHtml` reste vrai et `context.isTypst` est activé :
  `figureApigeom()` et `wrapperApigeomToMathalea()` exportent un SVG autonome
  avec les textes intégrés.
- Utiliser des couleurs simples (`'blue'`) plutôt que les constantes
  `bleuMathalea`… dans les options apiGeom.

### Dimensions des constructions sur papier

Avec apiGeom, `width` et `height` sont les dimensions à l'échelle 1 et
`scale` agrandit ou réduit ensemble le dessin et son cadre. Par exemple,
`width: 600, height: 600, scale: 0.7` donne un SVG de 420 × 420 pixels,
avec le même cadrage que `scale: 0.5` (300 × 300 pixels).

En Typst, les dimensions du SVG apiGeom sont converties à 96 dpi : une
longueur de `r` unités mesure `r × pixelsPerUnit × scale × 2,54 / 96` cm
avant une éventuelle réduction à la largeur disponible ou un zoom manuel.
Pour une construction au compas, vérifier que le plus petit rayon imprimé
reste manipulable. Dans `5G3A-4`, un rayon minimal de 4 unités avec
`pixelsPerUnit: 30` et `scale: 0.7` mesure environ 2,2 cm.

Adapter l'échelle avec `context.isTypst`, à l'identique pour l'énoncé et
la correction, permet d'agrandir la construction papier sans modifier les
coordonnées ni les appels aléatoires des liens partagés. La mise en page
peut encore réduire la figure dans des colonnes étroites.

## Nommer les points dans la figure interactive

Une lettre saisie au clavier nomme le premier point sans nom, ou renomme le
dernier point si tous sont déjà nommés. Une apostrophe complète le nom qui
vient d'être saisi : taper `C` puis `'` donne `C'`, même si d'autres points
attendent un nom. Un clic dans la figure ou la perte du focus termine cette
saisie. Supprimer uniquement le label efface le nom et permet de nommer à
nouveau le point, sans supprimer ses constructions.

## Vérifier la construction de l'élève

La correction se fait dans `correctionInteractive(i)`, en indexant tout par `i`
(figure, zone de feedback). Le squelette complet, la sauvegarde de la figure
pour Capytale (`figureAnswerJson()`) et les règles d'indexation sont décrits
dans [Correction maison](formats-interactifs.md#correction-maison-custom).

Chaque méthode `check…` renvoie au moins `{ isValid, message }` ; `message`
peut être affiché tel quel à l'élève.

| Méthode | Vérifie |
| --- | --- |
| `checkPoint({ label?, x, y, color? })` | un point aux coordonnées données |
| `checkCoords({ label?, x, y?, checkOnlyAbscissa?, precision?, color? })` | les coordonnées d'un point ; renvoie aussi `points`, les points trouvés |
| `checkDistance({ distance, label1, label2 })` | la distance entre deux points nommés |
| `checkSameDistance({ label1: 'AB', label2: 'CD' })` | deux longueurs égales |
| `checkAngle({ angle, label1, label2, label3 })` | la mesure de l'angle `label1 label2 label3`, au centième près |
| `checkCircleRadius({ center, radius, labelCenter? })` | un cercle de centre et de rayon donnés |
| `checkLine({ point1, point2, color? })` | une droite passant par deux points (coordonnées) |
| `checkSegment({ point1, point2, color? })` | un segment |
| `checkRay({ point1, point2, color? })` | une demi-droite |
| `checkVector({ x, y, xOrigin?, yOrigin?, labelOrigin?, labelPoint2?, color? })` | un vecteur |
| `checkParallel({ label1: 'AB', label2: 'CD' })` | deux droites parallèles |
| `checkPerpendicularBisector({ label1, label2, color? })` | la médiatrice d'un segment |
| `checkPolygon({ points, acceptSegments?, color? })` | un polygone de sommets donnés |
| `checkPolygonByLabels({ labels, color? })` | un polygone par les noms de ses sommets |
| `checkPointOnLine({ labelPt, nameLine })` | un point sur une ligne dont le nom contient `nameLine` |
| `checkPointOnIntersectionLL({ labelPt, nameLine1, nameLine2 })` | un point à l'intersection de deux lignes |
| `checkPointBetween2Points({ labelPt, labelPt1, labelPt2 })` | un point sur le segment `[labelPt1 labelPt2]` |

Pour `nameLine`, une chaîne (`'CD'`) accepte tout segment, demi-droite ou
droite dont le nom la contient ; un tableau (`['(CD)', '(DC)']`) restreint aux
noms listés.

Les signatures font foi dans `apigeom/src/Figure.ts` et
`apigeom/src/check/`. Le dépôt apiGeom contient aussi sa propre documentation
(`docs/`).

## Figure rechargée : relire les éléments dans la figure

La figure de l'élève est rechargée depuis son JSON (`loadJson()`) quand il
clique sur « Annuler » ou « Rétablir », et quand Capytale recharge sa copie
pour la reprendre ou la relire. Tous les éléments sont alors **recréés**, avec
les mêmes id : un point gardé pendant `nouvelleVersion()` (`this.lesPoints`,
`this.antecedents`…) est détruit. Son nom est vide et ses coordonnées ne
suivent plus la figure, ce qui fausse la note et le feedback.

Dans `correctionInteractive(i)`, ne jamais lire directement un élément de la
figure élève gardé par l'exercice :

- passer par `elementVivant(figure, element)`
  (`src/lib/apigeom/elementVivant.ts`), qui renvoie l'élément recréé ;
- ou garder des valeurs plutôt que des objets (noms, coordonnées), comme
  `nomSeg1` et `nomSeg2` dans `6G3B`.

Les éléments de la figure de correction ne sont pas concernés : elle n'est
jamais rechargée. Elle ne doit pas non plus être construite sur des points de
la figure élève.

`tests/unit/apigeomRechargement.test.ts` recharge la figure de chaque
exercice apiGeom interactif et échoue si la vérification lit un élément
détruit. Ce test ne connaît pas la bonne réponse : il ne couvre que le chemin
suivi par une figure non modifiée. Ajouter à ce fichier un scénario de
construction juste après rechargement pour un exercice dont la vérification
lit les points seulement quand l'élève a répondu.

## Tester une version locale d'apiGeom

Pour modifier apiGeom et voir l'effet dans MathALÉA, voir
[Tester une version locale d'une dépendance](../../maintenance-moteur/contribution/depannage.md#tester-une-version-locale-dune-dépendance).
