import Figure from 'apigeom'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Calculer des longueurs et des aires dans des assemblages de polygones'
export const interactifReady = true

export const dateDePublication = '25/07/2026'

/**
 * Déterminer une aire ou une longueur dans une figure complexe
 * @author Rémi Angot
 */

export const uuid = '6ca92'

export const refs = {
  'fr-fr': ['6M2B-2'],
  'fr-ch': ['9R1GM2E-1', '9R2GM2E-1', '9R3GM2E-1', 'PRQMG01C-13'],
}

/**
 * Jeux de valeurs possibles pour la configuration 'aireTriangleQuatreCarres'.
 *
 * La figure est un assemblage de quatre carrés de côté `cote` empilés, de deux
 * rectangles et de deux triangles rectangles dont les hypoténuses sont alignées.
 * Les deux triangles sont donc semblables : si le grand a pour côtés de l'angle
 * droit `2 × cote` et `base`, le petit a pour côtés `hauteurPetit` et `basePetit`
 * proportionnels aux premiers. On ne garde que les valeurs entières.
 */
const configurationsDisponibles = [
  'aireTriangle',
  'aireGrandCarre',
  'aireTriangleQuatreCarres',
]

const casQuatreCarres: {
  base: number
  basePetit: number
  cote: number
  hauteurPetit: number
  hauteurRectangle: number
  largeur: number
}[] = []
for (const cote of [3, 4]) {
  for (let base = 3; base <= 12; base++) {
    if (base === cote) continue // sinon l'aire cherchée est égale à celle du carré
    const diviseur = pgcd(2 * cote, base)
    for (let rapport = 1; rapport < diviseur; rapport++) {
      const hauteurPetit = (rapport * 2 * cote) / diviseur
      const basePetit = (rapport * base) / diviseur
      const hauteurRectangle = 2 * cote - hauteurPetit
      const largeur = cote + base + basePetit
      if (
        hauteurRectangle >= 2 &&
        basePetit >= 2 &&
        (hauteurPetit * basePetit) % 2 === 0 && // aire du petit triangle entière
        largeur >= 9 &&
        largeur <= 16
      ) {
        casQuatreCarres.push({
          base,
          basePetit,
          cote,
          hauteurPetit,
          hauteurRectangle,
          largeur,
        })
      }
    }
  }
}

export default class AireAssemblageCarreRectangleTriangle extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Configuration',
      'Nombres séparés par des tirets :\n0 : Mélange\n1 : Aire du triangle\n2 : Aire du grand carré\n3 : Aire du triangle (quatre carrés)',
    ]
    this.sup = 0 // Mélange des 3 configurations par défaut
  }

  nouvelleVersion() {
    const configuration = this.fromQuestionPlan(
      'configuration',
      (nbQuestions) =>
        gestionnaireFormulaireTexte({
          saisie: this.sup,
          min: 1,
          max: 3,
          defaut: 0,
          listeOfCase: configurationsDisponibles,
          nbQuestions,
          melange: 0,
        }),
    )
    if (configuration === 'aireTriangle') {
      this.optionsChampTexte = {
        texteApres: ' $\\text{cm}^2$',
        texteAvant: 'Aire du triangle : ',
      }
      const a = randint(2, 4) // côté du carré
      const b = randint(a + 1, 12 - a) // côté du rectangle
      const c = randint(2, 5) // côté du triangle
      const aireTriangle = arrondi((c * (a + b)) / 2)

      const figure = new Figure({
        xMin: -2,
        yMin: -2,
        width: (a + c + 4) * 30,
        height: (a + b + 4) * 30,
      })
      this.figuresApiGeom = [figure]

      const A = figure.create('Point', { x: 0, y: 0, isVisible: false })
      const B = figure.create('Point', { x: a, y: 0, isVisible: false })
      const C = figure.create('Point', { x: a + c, y: 0, isVisible: false })
      const D = figure.create('Point', { x: 0, y: a, isVisible: false })
      const E = figure.create('Point', { x: a, y: a, isVisible: false })
      const F = figure.create('Point', { x: 0, y: a + b, isVisible: false })
      const G = figure.create('Point', { x: a, y: a + b, isVisible: false })

      figure.create('Polygon', {
        // Carré
        points: [A, B, E, D],
      })

      figure.create('Polygon', {
        // Rectangle
        points: [D, E, G, F],
      })

      figure.create('Polygon', {
        // Triangle
        points: [G, B, C],
      })

      figure.create('MeasureSegment', {
        point1: D,
        point2: F,
        label: `${b}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figure.create('MeasureSegment', {
        point1: A,
        point2: C,
        label: `${a + c}~\\text{cm}`,
        offset: 1,
        side: 'below',
        fenceDash: 'dotted',
      })

      figure.create('TextByPosition', {
        x: a / 2,
        y: a + b / 2,
        text: `$${a * b}~\\text{cm}^2$`,
      })

      figure.create('MarkRightAngle', { point: A, directionPoint: D })
      figure.create('MarkRightAngle', { point: B, directionPoint: A })
      figure.create('MarkRightAngle', { point: D, directionPoint: E })
      figure.create('MarkRightAngle', { point: E, directionPoint: B })
      figure.create('MarkRightAngle', { point: F, directionPoint: G })
      figure.create('MarkRightAngle', { point: G, directionPoint: B })
      figure.create('MarkBetweenPoints', { point1: A, point2: B })
      figure.create('MarkBetweenPoints', { point1: B, point2: E })
      figure.create('MarkBetweenPoints', { point1: E, point2: D })
      figure.create('MarkBetweenPoints', { point1: D, point2: A })

      const figureHtml = context.isTypst
        ? apigeomFigureToSvg(figure)
        : context.isHtml
          ? figure.getStaticHtml()
          : figure.tikz()

      this.reponse = texNombre(aireTriangle)
      this.question = `Calculer l'aire du triangle représenté ci-dessous.<br>${figureHtml}`
      this.correction = `Le rectangle a une aire de $${a * b}~\\text{cm}^2$.`
      this.correction += `<br>Or $${a * b}~\\text{cm}^ 2 = ${a}~\\text{cm} \\times ${b}~\\text{cm}$.`
      this.correction += `<br>Donc la largeur du rectangle et le côté du carré font $${a}~\\text{cm}$.`
      this.correction += `<br>Le triangle a donc pour côtés de l'angle droit $${c}~\\text{cm}$ et $${a + b}~\\text{cm}$.`
      this.correction += `<br>L'aire du triangle est donc : $${c}~\\text{cm} \\times ${a + b}~\\text{cm} \\div 2 = ${miseEnEvidence(this.reponse)}~\\text{cm}^2$.`

      const figureCorrection = figure.copy()
      figureCorrection.xMin = -2
      figureCorrection.yMin = -3
      figureCorrection.width = (a + c + 4) * 30
      figureCorrection.height = (a + b + 4) * 30
      figureCorrection.create('MeasureSegment', {
        point1: A,
        point2: D,
        label: `${a}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: B,
        point2: C,
        label: `${c}~\\text{cm}`,
        offset: 2,
        side: 'below',
        fenceDash: 'dotted',
      })

      const figureCorrectionHtml = context.isTypst
        ? apigeomFigureToSvg(figureCorrection)
        : context.isHtml
          ? figureCorrection.getStaticHtml()
          : figureCorrection.tikz()

      this.correction += '<br>'
      this.correction += figureCorrectionHtml
    } else if (configuration === 'aireGrandCarre') {
      this.optionsChampTexte = {
        texteApres: ' $\\text{cm}^2$',
        texteAvant: 'Aire du grand carré : ',
      }
      const a = randint(2, 5) // côté du petit carré
      const b = randint(a, 11 - a) // côté du triangle
      const aireGrandCarre = (a + b) ** 2

      const figure = new Figure({
        xMin: -2,
        yMin: -2,
        width: (a + b + a + 4) * 30,
        height: (a + b + a + 4) * 30,
      })
      this.figuresApiGeom = [figure]

      const A = figure.create('Point', { x: 0, y: 0, isVisible: false })
      const B = figure.create('Point', { x: a + b, y: 0, isVisible: false })
      const C = figure.create('Point', { x: a + b, y: a + b, isVisible: false })
      const D = figure.create('Point', { x: 0, y: a + b, isVisible: false })
      const E = figure.create('Point', { x: a, y: a + b, isVisible: false })
      const F = figure.create('Point', { x: a, y: a + b + a, isVisible: false })
      const G = figure.create('Point', { x: 0, y: a + b + a, isVisible: false })

      figure.create('Polygon', {
        // Grand carré
        points: [A, B, C, D],
      })

      figure.create('Polygon', {
        // Petit carré
        points: [D, E, F, G],
      })

      figure.create('Polygon', {
        // Triangle
        points: [E, C, F],
      })

      figure.create('TextByPosition', {
        x: a / 2,
        y: a + b + a / 2,
        text: `$${a * a}~\\text{cm}^2$`,
      })

      figure.create('TextByPosition', {
        x: a + 1.8,
        y: a + b + a / 3,
        text: `$${texNombre((a * b) / 2)}~\\text{cm}^2$`,
      })

      figure.create('MarkRightAngle', { point: A, directionPoint: D })
      figure.create('MarkRightAngle', { point: B, directionPoint: A })
      figure.create('MarkRightAngle', { point: C, directionPoint: B })
      figure.create('MarkRightAngle', { point: D, directionPoint: G })
      figure.create('MarkRightAngle', { point: E, directionPoint: D })
      figure.create('MarkRightAngle', { point: G, directionPoint: F })
      figure.create('MarkRightAngle', { point: F, directionPoint: E })
      figure.create('MarkBetweenPoints', { point1: D, point2: G, text: '|||' })
      figure.create('MarkBetweenPoints', { point1: G, point2: F, text: '|||' })
      figure.create('MarkBetweenPoints', { point1: F, point2: E, text: '|||' })
      figure.create('MarkBetweenPoints', { point1: E, point2: D, text: '|||' })
      figure.create('MarkBetweenPoints', { point1: D, point2: C, text: 'o' })
      figure.create('MarkBetweenPoints', { point1: C, point2: B, text: 'o' })
      figure.create('MarkBetweenPoints', { point1: B, point2: A, text: 'o' })
      figure.create('MarkBetweenPoints', { point1: A, point2: D, text: 'o' })

      const figureHtml = context.isTypst
        ? apigeomFigureToSvg(figure)
        : context.isHtml
          ? figure.getStaticHtml()
          : figure.tikz()

      this.reponse = texNombre(aireGrandCarre)
      this.question = `Calculer l'aire du grand carré représenté ci-dessous.<br>${figureHtml}`
      this.correction = `Le petit carré a une aire de $${a * a}~\\text{cm}^2$ et $${a} \\times ${a} = ${a * a}$.`
      this.correction += `<br>Donc le côté du petit carré mesure $${a}~\\text{cm}$.`
      this.correction += `<br>Le triangle a un côté de l'angle droit commun avec le petit carré : ce côté mesure donc $${a}~\\text{cm}$.`
      this.correction += `<br>L'aire du triangle est de $${texNombre((a * b) / 2)}~\\text{cm}^2$, donc son autre côté de l'angle droit mesure $2 \\times ${texNombre((a * b) / 2)}~\\text{cm}^2 \\div ${a}~\\text{cm} = ${b}~\\text{cm}$.`
      this.correction += `<br>Le côté du grand carré est formé du côté du petit carré et de ce côté du triangle : il mesure $${a}~\\text{cm} + ${b}~\\text{cm} = ${a + b}~\\text{cm}$.`
      this.correction += `<br>L'aire du grand carré est donc : $${a + b}~\\text{cm} \\times ${a + b}~\\text{cm} = ${miseEnEvidence(this.reponse)}~\\text{cm}^2$.`

      const figureCorrection = figure.copy()
      figureCorrection.xMin = -2
      figureCorrection.yMin = -3
      figureCorrection.width = (a + b + a + 4) * 30
      figureCorrection.height = (a + b + a + 4) * 30
      figureCorrection.create('MeasureSegment', {
        point1: D,
        point2: G,
        label: `${a}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: E,
        point2: C,
        label: `${texNombre(b)}~\\text{cm}`,
        offset: 2,
        side: 'below',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: A,
        point2: B,
        label: `${a + b}~\\text{cm}`,
        offset: 1,
        side: 'below',
        fenceDash: 'dotted',
      })

      const figureCorrectionHtml = context.isTypst
        ? apigeomFigureToSvg(figureCorrection)
        : context.isHtml
          ? figureCorrection.getStaticHtml()
          : figureCorrection.tikz()

      this.correction += '<br>'
      this.correction += figureCorrectionHtml
    } else if (configuration === 'aireTriangleQuatreCarres') {
      this.optionsChampTexte = {
        texteApres: ' $\\text{cm}^2$',
        texteAvant: 'Aire du triangle : ',
      }
      const {
        base, // base du triangle cherché
        basePetit, // base du petit triangle
        cote, // côté des quatre carrés
        hauteurPetit, // hauteur du petit triangle
        hauteurRectangle, // hauteur du rectangle du bas
        largeur, // largeur totale de la figure
      } = choice(casQuatreCarres)
      const hauteur = 2 * cote // hauteur du triangle cherché : deux carrés
      const airePetit = arrondi((hauteurPetit * basePetit) / 2)
      const aireCherchee = arrondi((base * hauteur) / 2)

      const figure = new Figure({
        xMin: -2,
        yMin: -2,
        width: (largeur + 4) * 30,
        height: (4 * cote + 4) * 30,
      })
      this.figuresApiGeom = [figure]

      // Les deux colonnes de sommets des carrés empilés, de bas en haut
      const gauche = []
      const droite = []
      for (let i = 0; i <= 4; i++) {
        gauche.push(
          figure.create('Point', { x: 0, y: i * cote, isVisible: false }),
        )
        droite.push(
          figure.create('Point', { x: cote, y: i * cote, isVisible: false }),
        )
      }
      const basDroite = figure.create('Point', {
        x: largeur,
        y: 0,
        isVisible: false,
      })
      const hautDroite = figure.create('Point', {
        x: largeur,
        y: hauteurRectangle,
        isVisible: false,
      })
      const rectangleBasGauche = figure.create('Point', {
        x: cote,
        y: hauteurRectangle,
        isVisible: false,
      })
      const angleDroitPetit = figure.create('Point', {
        x: cote + base,
        y: hauteurRectangle,
        isVisible: false,
      })
      const sommetCommun = figure.create('Point', {
        x: cote + base,
        y: hauteur,
        isVisible: false,
      })

      for (let i = 0; i < 4; i++) {
        figure.create('Polygon', {
          // Les quatre carrés empilés
          points: [gauche[i], droite[i], droite[i + 1], gauche[i + 1]],
        })
      }

      figure.create('Polygon', {
        // Rectangle du bas
        points: [droite[0], basDroite, hautDroite, rectangleBasGauche],
      })

      figure.create('Polygon', {
        // Rectangle du milieu
        points: [rectangleBasGauche, angleDroitPetit, sommetCommun, droite[2]],
      })

      figure.create('Polygon', {
        // Petit triangle
        points: [angleDroitPetit, hautDroite, sommetCommun],
      })

      figure.create('Polygon', {
        // Triangle cherché
        points: [droite[2], sommetCommun, droite[4]],
      })

      figure.create('MeasureSegment', {
        point1: gauche[0],
        point2: basDroite,
        label: `${largeur}~\\text{cm}`,
        offset: 1,
        side: 'below',
        fenceDash: 'dotted',
      })

      figure.create('MeasureSegment', {
        point1: basDroite,
        point2: hautDroite,
        label: `${hauteurRectangle}~\\text{cm}`,
        offset: 1,
        side: 'below',
        fenceDash: 'dotted',
      })

      figure.create('TextByPosition', {
        x: cote / 2,
        y: cote / 2,
        text: `$${cote * cote}~\\text{cm}^2$`,
      })

      figure.create('TextByPosition', {
        // Assez bas dans le petit triangle pour que le texte reste sous l'hypoténuse
        x: cote + base + basePetit / 2,
        y: hauteurRectangle + hauteurPetit / 4,
        text: `$${texNombre(airePetit)}~\\text{cm}^2$`,
      })

      figure.create('TextByPosition', {
        x: cote + base / 3,
        y: (8 * cote) / 3,
        text: '$?$',
      })

      figure.create('MarkRightAngle', {
        point: droite[2],
        directionPoint: droite[4],
      })
      figure.create('MarkRightAngle', {
        point: angleDroitPetit,
        directionPoint: sommetCommun,
      })
      figure.create('MarkRightAngle', {
        point: gauche[0],
        directionPoint: gauche[1],
      })
      figure.create('MarkRightAngle', {
        point: basDroite,
        directionPoint: droite[0],
      })
      figure.create('MarkRightAngle', {
        point: gauche[4],
        directionPoint: droite[4],
      })
      figure.create('MarkRightAngle', {
        point: droite[4],
        directionPoint: droite[3],
      })
      for (let i = 0; i < 4; i++) {
        // Codage des quatre carrés identiques
        figure.create('MarkBetweenPoints', {
          point1: gauche[i],
          point2: gauche[i + 1],
        })
        figure.create('MarkBetweenPoints', {
          point1: droite[i],
          point2: droite[i + 1],
        })
      }
      for (let i = 0; i <= 4; i++) {
        figure.create('MarkBetweenPoints', {
          point1: gauche[i],
          point2: droite[i],
        })
      }

      const figureHtml = context.isTypst
        ? apigeomFigureToSvg(figure)
        : context.isHtml
          ? figure.getStaticHtml()
          : figure.tikz()

      this.reponse = texNombre(aireCherchee)
      this.question = `La figure ci-dessous est un assemblage de quatre carrés identiques, de deux rectangles et de deux triangles rectangles.<br>Calculer l'aire du triangle marqué d'un point d'interrogation.<br>${figureHtml}`
      this.correction = `Le carré du bas a une aire de $${cote * cote}~\\text{cm}^2$ et $${cote} \\times ${cote} = ${cote * cote}$.`
      this.correction += `<br>Donc chaque carré a un côté de $${cote}~\\text{cm}$.`
      this.correction += `<br>Le haut du rectangle du milieu est au niveau du haut du deuxième carré, soit à $2 \\times ${cote}~\\text{cm} = ${hauteur}~\\text{cm}$ du bas de la figure.`
      this.correction += `<br>Le côté vertical du petit triangle mesure donc $${hauteur}~\\text{cm} - ${hauteurRectangle}~\\text{cm} = ${hauteurPetit}~\\text{cm}$.`
      this.correction += `<br>Son aire est de $${texNombre(airePetit)}~\\text{cm}^2$, donc son côté horizontal mesure $2 \\times ${texNombre(airePetit)}~\\text{cm}^2 \\div ${hauteurPetit}~\\text{cm} = ${basePetit}~\\text{cm}$.`
      this.correction += `<br>La base du triangle cherché mesure alors $${largeur}~\\text{cm} - ${cote}~\\text{cm} - ${basePetit}~\\text{cm} = ${base}~\\text{cm}$ et sa hauteur est celle de deux carrés, soit $${hauteur}~\\text{cm}$.`
      this.correction += `<br>L'aire du triangle cherché est donc : $${base}~\\text{cm} \\times ${hauteur}~\\text{cm} \\div 2 = ${miseEnEvidence(this.reponse)}~\\text{cm}^2$.`

      const figureCorrection = figure.copy()
      figureCorrection.xMin = -2
      figureCorrection.yMin = -4
      figureCorrection.width = (largeur + 4) * 30
      figureCorrection.height = (4 * cote + 6) * 30

      const piedTriangle = figureCorrection.create('Point', {
        x: cote + base,
        y: 0,
        isVisible: false,
      })

      figureCorrection.create('MeasureSegment', {
        point1: gauche[0],
        point2: gauche[1],
        label: `${cote}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: gauche[2],
        point2: gauche[4],
        label: `${hauteur}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: angleDroitPetit,
        point2: sommetCommun,
        label: `${hauteurPetit}~\\text{cm}`,
        offset: 1,
        side: 'above',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: droite[0],
        point2: piedTriangle,
        label: `${base}~\\text{cm}`,
        offset: 2,
        side: 'below',
        fenceDash: 'dotted',
      })

      figureCorrection.create('MeasureSegment', {
        point1: piedTriangle,
        point2: basDroite,
        label: `${basePetit}~\\text{cm}`,
        offset: 2,
        side: 'below',
        fenceDash: 'dotted',
      })

      const figureCorrectionHtml = context.isTypst
        ? apigeomFigureToSvg(figureCorrection)
        : context.isHtml
          ? figureCorrection.getStaticHtml()
          : figureCorrection.tikz()

      this.correction += '<br>'
      this.correction += figureCorrectionHtml
    }
  }
}
