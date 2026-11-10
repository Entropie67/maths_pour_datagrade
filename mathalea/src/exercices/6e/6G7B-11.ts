import Figure from 'apigeom'
import checkCircle from 'apigeom/src/check/checkCircleRadius'
import checkCoords from 'apigeom/src/check/checkCoords'
import checkLine from 'apigeom/src/check/checkLine'
import checkPolygon from 'apigeom/src/check/checkPolygon'
import checkRay from 'apigeom/src/check/checkRay'
import checkSegment from 'apigeom/src/check/checkSegment'
import {
  orthogonalProjectionCoord,
  reflectOverLineCoord,
} from 'apigeom/src/elements/calculus/Coords'
import type Line from 'apigeom/src/elements/lines/Line'
import Point from 'apigeom/src/elements/points/Point'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { elementVivant } from '../../lib/apigeom/elementVivant'
import figureApigeom from '../../lib/figureApigeom'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Construire des symétriques de figures par rapport à une droite'
export const dateDePublication = '10/10/2026'
export const interactifReady = true
export const uuid = '4114e'
export const refs = {
  'fr-fr': ['6G7B-11'],
  'fr-ch': ['9R1ES4B-9', '9R2ES4B-9', '9R3ES4B-9'],
}

type FigureType = 'segment' | 'droite' | 'demidroite' | 'cercle' | 'triangle'
type Coordinates = { x: number; y: number }

/** Passer des coordonnées suivant l'axe et sa normale au repère du dessin. */
function axisCoordinates(u: number, v: number, axisType: number): Coordinates {
  switch (axisType) {
    case 1:
      return { x: u, y: v }
    case 2:
      return { x: v, y: u }
    case 3:
      return { x: u + v, y: u - v }
    default:
      return { x: u + v, y: v - u }
  }
}

/** Garder des longueurs suffisantes, les cercles dans le cadre et les triangles non aplatis. */
function suitablePoints(points: Coordinates[], type: FigureType) {
  const [a, b, c] = points
  if (Math.hypot(a.x - b.x, a.y - b.y) < 3) return false
  if (type === 'triangle') {
    return (
      Math.hypot(a.x - c.x, a.y - c.y) >= 3 &&
      Math.hypot(b.x - c.x, b.y - c.y) >= 3 &&
      Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) >= 6
    )
  }
  if (type === 'cercle') {
    const radius = Math.hypot(b.x - a.x, b.y - a.y)
    return (
      radius >= 3 &&
      radius <= 4.5 &&
      Math.abs(a.x) + radius <= 8.5 &&
      Math.abs(a.y) + radius <= 8.5
    )
  }
  return true
}

function drawObject(
  figure: Figure,
  points: Point[],
  type: FigureType,
  color = 'black',
) {
  switch (type) {
    case 'segment':
      return figure.create('Segment', {
        point1: points[0],
        point2: points[1],
        color,
      })
    case 'droite':
      return figure.create('Line', {
        point1: points[0],
        point2: points[1],
        color,
      })
    case 'demidroite':
      return figure.create('Ray', {
        point1: points[0],
        point2: points[1],
        color,
      })
    case 'cercle':
      return figure.create('CircleCenterPoint', {
        center: points[0],
        point: points[1],
        color,
      })
    case 'triangle':
      return figure.create('Polygon', { points, color })
  }
}

export default class ConstructionsSymetrieAxialeFigures extends Exercice {
  figuresApiGeom: Figure[] = []
  antecedents: Point[][] = []
  axes: Line[] = []
  questionTypes: FigureType[] = []
  exoCustomResultat = true

  constructor() {
    super()
    this.nbQuestions = 6
    this.spacing = this.spacingCorr = context.isHtml ? 1 : 0.1
    this.sup = 1
    this.sup2 = '6'
    this.sup3 = '1'
    this.sup4 = 5
    this.besoinFormulaireNumerique = [
      "Type d'aide",
      4,
      '1 : Quadrillage\n2 : Perpendiculaires en pointillés\n3 : Marques de compas\n4 : Aucune',
    ]
    this.besoinFormulaire2Texte = [
      'Type de figures',
      '1 : Segment\n2 : Droite\n3 : Demi-droite\n4 : Cercle\n5 : Triangle\n6 : Mélange',
    ]
    this.besoinFormulaire3Texte = [
      'Formulation des questions',
      "1 : Construire l'image par la symétrie d'axe (d)\n2 : Construire le symétrique par rapport à la droite (d)",
    ]
    this.besoinFormulaire4Numerique = [
      "Type d'axes",
      5,
      '1 : Axe horizontal\n2 : Axe vertical\n3 : Axe oblique /\n4 : Axe oblique \\\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom.forEach((figure) => figure.destroy())
    this.figuresApiGeom = []
    this.antecedents = []
    this.axes = []
    this.answers = {}
    this.questionTypes = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      listeOfCase: ['segment', 'droite', 'demidroite', 'cercle', 'triangle'],
    }) as FigureType[]
    const formulations = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      shuffle: false,
    })
    const axisTypes = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: String(this.sup4),
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    })

    for (let i = 0; i < this.nbQuestions; i++) {
      const type = this.questionTypes[i]
      const axisType = Number(axisTypes[i])
      const count = type === 'triangle' ? 3 : 2
      // Le repli garantit une génération bornée, y compris pour les cercles.
      let coordinates = [
        axisCoordinates(0, 2, axisType),
        axisCoordinates(3, 2, axisType),
        axisCoordinates(-3, 4, axisType),
      ]
      for (let attempt = 0; attempt < 100; attempt++) {
        const candidate = Array.from({ length: 3 }, () =>
          axisCoordinates(randint(-3, 3), randint(2, 4), axisType),
        )
        // Éviter une droite perpendiculaire à l'axe, qui serait sa propre image.
        const perpendicular =
          axisType === 1
            ? candidate[0].x === candidate[1].x
            : axisType === 2
              ? candidate[0].y === candidate[1].y
              : axisType === 3
                ? candidate[0].x + candidate[0].y ===
                  candidate[1].x + candidate[1].y
                : candidate[0].x - candidate[0].y ===
                  candidate[1].x - candidate[1].y
        if (
          suitablePoints(candidate, type) &&
          (type !== 'droite' || !perpendicular)
        ) {
          coordinates = candidate
          break
        }
      }
      const labels = Array.from(choisitLettresDifferentes(count, 'Q', true))
      const objects = {
        segment: `du segment $[${labels[0]}${labels[1]}]$`,
        droite: `de la droite $(${labels[0]}${labels[1]})$`,
        demidroite: `de la demi-droite $[${labels[0]}${labels[1]})$`,
        cercle: `du cercle de centre $${labels[0]}$ passant par $${labels[1]}$`,
        triangle: `du triangle $${labels.join('')}$`,
      }
      const statement =
        formulations[i] === 1
          ? `Construire l'image ${objects[type]} par la symétrie d'axe $(d)$.`
          : `Construire le symétrique ${objects[type]} par rapport à la droite $(d)$.`
      const options = {
        xMin: -10,
        yMin: -10,
        width: 600,
        height: 600,
        scale: context.isTypst ? 0.85 : 0.5,
        snapGrid: Number(this.sup) === 1,
        dx: 1,
        dy: 1,
      }
      const figure = new Figure(options)
      figure.options.latexHeight = 20
      figure.options.autoPositionLabels = true
      figure.setToolbar({
        tools: [
          'DRAG',
          'POINT',
          'NAME_POINT',
          'POINT_ON',
          'POINT_INTERSECTION',
          'LINE_PERPENDICULAR',
          'CIRCLE_CENTER_POINT',
          'RAY',
          'LINE',
          'SEGMENT',
          'POLYGON',
          'UNDO',
          'REDO',
          'REMOVE',
        ],
        position: 'top',
      })
      const correction = new Figure({ ...options, isDynamic: false })
      correction.options.latexHeight = 20
      correction.options.autoPositionLabels = true
      const createAxis = (target: Figure) => {
        const origin = target.create('Point', {
          x: 0,
          y: 0,
          isVisible: false,
          isFree: false,
        })
        const direction = axisCoordinates(7, 0, axisType)
        const end = target.create('Point', {
          ...direction,
          shape: '',
          label: '(d)',
          isSelectable: false,
          isFree: false,
        })
        const axis = target.create('Line', {
          point1: origin,
          point2: end,
          color: 'blue',
          thickness: 2,
        })
        return axis
      }
      const axis = createAxis(figure)
      const correctionAxis = createAxis(correction)
      const originals = coordinates
        .slice(0, count)
        .map((point, k) =>
          figure.create('Point', { ...point, label: labels[k], isFree: false }),
        )
      const copies = coordinates.slice(0, count).map((point, k) =>
        correction.create('Point', {
          ...point,
          label: labels[k],
          isFree: false,
        }),
      )
      drawObject(figure, originals, type)
      drawObject(correction, copies, type)
      const images = copies.map((point) =>
        correction.create('Point', {
          ...reflectOverLineCoord(point, correctionAxis),
          label: point.label + "'",
          color: 'orange',
          isFree: false,
        }),
      )
      drawObject(correction, images, type, 'orange')

      for (const target of [figure, correction]) {
        if (Number(this.sup) === 1)
          target.create('Grid', {
            xMin: -10,
            yMin: -10,
            xMax: 10,
            yMax: 10,
            stepX: 1,
            stepY: 1,
            color: 'gray',
            axeX: false,
            axeY: false,
            labelX: false,
            labelY: false,
          })
        const targetPoints = target === figure ? originals : copies
        const targetAxis = target === figure ? axis : correctionAxis
        targetPoints.forEach((point, k) => {
          const projection = target.create('Point', {
            ...orthogonalProjectionCoord(point, targetAxis),
            isVisible: false,
            isFree: false,
          })
          if (Number(this.sup) === 2)
            target.create('LinePerpendicular', {
              point,
              line: targetAxis,
              isDashed: true,
              color: 'gray',
            })
          if (Number(this.sup) === 3)
            target.create('CircleCenterPoint', {
              center: projection,
              point,
              isDashed: true,
              color: 'gray',
            })
          if (target === correction) {
            target.create('Segment', {
              point1: point,
              point2: images[k],
              isDashed: true,
              color: 'gray',
            })
            target.create('MarkRightAngle', {
              point: projection,
              directionPoint: point,
              color: 'gray',
            })
            for (const endpoint of [point, images[k]])
              target.create('MarkBetweenPoints', {
                point1: projection,
                point2: endpoint,
                text: ['//', 'o', '|||'][k],
                color: 'gray',
              })
          }
        })
      }
      figure.optimizeLabels()
      correction.optimizeLabels()
      // Les points de l'énoncé sont fixes (`isFree` est conservé par le JSON).
      const fixedPointIds = new Set([
        axis.point1.id,
        axis.point2.id,
        ...originals.map((point) => point.id),
      ])
      figure.ui.subscribe((state) => {
        // DRAG ne filtre pas les points fixes dans cette version d'apiGeom.
        if (state.matches('DRAG')) {
          figure.optimizeLabels()
          figure.filter = (element) =>
            element instanceof Point
              ? element.isFree && !fixedPointIds.has(element.id)
              : element.type === 'TextTemplate'
        }
      })
      this.figuresApiGeom[i] = figure
      this.antecedents[i] = originals
      this.axes[i] = axis
      const rendered =
        context.isHtml && this.interactif && !context.isTypst
          ? figureApigeom({ exercice: this, figure, i, defaultAction: 'POINT' })
          : context.isHtml
            ? wrapperApigeomToMathalea(figure)
            : figure.tikz()
      this.listeQuestions[i] = statement + '<br>' + rendered
      const explanation =
        type === 'cercle'
          ? `Construire le symétrique du centre $${labels[0]}$, construire le symétrique du point $${labels[1]}$, puis tracer le cercle passant par ce point image.<br>`
          : 'Construire les symétriques des points nommés, puis tracer la figure correspondante.<br>'
      const result = `La figure symétrique est représentée en orange, avec les points $${miseEnEvidence(labels.map((label) => label + "'").join(', '))}$.<br>`
      this.listeCorrections[i] =
        explanation +
        'L’axe $(d)$ est la médiatrice de chaque segment joignant un point à son symétrique.<br>' +
        result +
        (context.isHtml
          ? wrapperApigeomToMathalea(correction)
          : correction.tikz())
    }
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApiGeom[i]
    this.answers ??= {}
    this.answers[figure.id] = figureAnswerJson(figure)
    // Éléments lus dans la figure : elle a pu être rechargée (Annuler, copie Capytale)
    const antecedents = this.antecedents[i].map((point) =>
      elementVivant(figure, point),
    )
    const axe = elementVivant(figure, this.axes[i])
    const points = antecedents.map((point) => {
      const { x, y } = reflectOverLineCoord(point, axe)
      // Les quatre axes donnent des images sur la grille : éliminer le bruit flottant.
      return { x: Math.round(x * 1e9) / 1e9, y: Math.round(y * 1e9) / 1e9 }
    })
    let objectValid: boolean
    switch (this.questionTypes[i]) {
      case 'segment':
        objectValid = checkSegment({
          figure,
          point1: points[0],
          point2: points[1],
        }).isValid
        break
      case 'droite':
        objectValid = checkLine({
          figure,
          point1: points[0],
          point2: points[1],
        }).isValid
        break
      case 'demidroite':
        objectValid = checkRay({
          figure,
          point1: points[0],
          point2: points[1],
        }).isValid
        break
      case 'cercle':
        objectValid = checkCircle({
          figure,
          center: points[0],
          radius: Math.hypot(
            points[1].x - points[0].x,
            points[1].y - points[0].y,
          ),
        }).isValid
        break
      case 'triangle':
        // Le polygone initial ne doit pas empêcher de reconnaître trois segments.
        objectValid =
          checkPolygon({ figure, points }).isValid ||
          points.every(
            (point, k) =>
              checkSegment({
                figure,
                point1: point,
                point2: points[(k + 1) % points.length],
              }).isValid,
          )
        break
    }
    const feedbacks: string[] = []
    const pointsValid = points
      .map((point, k) => {
        const valid = checkCoords({
          figure,
          ...point,
          checkOnlyAbscissa: false,
        }).isValid
        if (!valid)
          feedbacks.push(
            `Construire le symétrique du point $${antecedents[k].label}$.`,
          )
        return valid
      })
      .every(Boolean)
    if (!objectValid) feedbacks.push('Tracer la figure symétrique demandée.')
    // Deux points fixes : un pour la figure, un pour l'ensemble des points.
    const results = [objectValid ? 'OK' : 'KO', pointsValid ? 'OK' : 'KO']
    const feedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (feedback)
      feedback.innerHTML = [
        ...feedbacks,
        `${results.filter((result) => result === 'OK').length}/2`,
      ].join('<br>')
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    return results
  }
}
