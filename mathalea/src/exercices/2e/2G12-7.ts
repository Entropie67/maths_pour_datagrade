import Figure from 'apigeom'
import type PointApigeom from 'apigeom/src/elements/points/Point'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { similitude } from '../../lib/2d/transformations'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { Matrice } from '../../lib/mathFonctions/Matrice'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const uuid = 'df171'
export const titre =
  'Placer un point dans un repère orthogonal, normé ou quelconque'
export const refs = {
  'fr-fr': ['2G12-7', '2A-G2-3'],
  'fr-ch': ['3G90-2'],
}

/**
 * @title Repérage 2e bis
 * @author Jean-claude Lhote
 * On se propose de placer des points aux coordonnées données dans un repère orthogonal, normé ou quelconque.
 */
export default class BetaReperage2e extends Exercice {
  labelsPoints: string[][]
  X: number[][]
  Y: number[][]

  constructor() {
    super()
    this.nbQuestions = 1
    this.labelsPoints = []
    this.reponseCourteDisponible = false // La réponse est une construction : placer des points dans un repère.
    this.X = []
    this.Y = []
    this.exoCustomResultat = true

    this.besoinFormulaireTexte = [
      'Type de repère',
      [
        'Nombres séparés par des tirets  :',
        '1 : Orthogonal',
        '2 : Normé',
        '3 : Quelconque',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1'
    this.besoinFormulaire2CaseACocher = [
      'Présence de coordonnées fractionnaires',
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3Numerique = ['Nombre de points à trouver/placer', 3]
    this.sup3 = 3
    this.comment = `Il y a trois types de repères, le premier est orthogonal mais pas normé, le deuxième est normé mais pas orthonormal, le troisième n'est ni normé ni orthogonal.<br>
    Les points à placer sont choisis aléatoirement à coordonnées entières. On peut choisir le nombre de points à placer de 1 à 3.`
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    this.labelsPoints = []
    this.X = []
    this.Y = []
    const listeTypeDeReperes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      nbQuestions: this.nbQuestions,
      defaut: 4,
    })
    const x: FractionEtendue[][] = []
    const y: FractionEtendue[][] = []
    const points: PointApigeom[][] = []

    for (let i = 0; i < this.nbQuestions;) {
      const options = {}
      x[i] = []
      y[i] = []
      this.X[i] = []
      this.Y[i] = []
      points[i] = []
      let coordsI: [number, number]
      let coordsK: [number, number]
      let matrice: Matrice
      let matriceInverse: Matrice | undefined
      const listeNoms = choisitLettresDifferentes(3 + this.sup3)
      const [labelI, labelK, labelO] = listeNoms.slice(0, 3)
      this.labelsPoints[i] = listeNoms.slice(3)

      do {
        switch (listeTypeDeReperes[i]) {
          case 1:
            {
              const ratio = choice([
                [3, 2],
                [2, 3],
                [2.5, 2],
                [2, 2.5],
              ])
              coordsI = [ratio[0], 0] // [choice([1.5, 2.5]), 0]
              coordsK = [0, ratio[1]] // [0, choice([1, 2])]
            }
            break
          case 2:
            {
              const o = pointAbstrait(0, 0)
              const I = similitude(
                pointAbstrait(randint(6, 8) * 0.2, 0),
                o,
                randint(-20, 20),
                1.5,
              )
              coordsI = [I.x, I.y]
              const K = similitude(
                pointAbstrait(...coordsI),
                o,
                randint(60, 80),
                1,
              )
              coordsK = [K.x, K.y]
            }
            break
          case 3:
          default:
            {
              const o = pointAbstrait(0, 0)
              coordsI = [2, randint(-4, 4, [0]) * 0.2]
              const K = similitude(
                pointAbstrait(...coordsI),
                o,
                randint(60, 80),
                choice([1.25, 1.3, 1.4]),
              )
              coordsK = [K.x, K.y]
            }
            break
        }

        matrice = new Matrice([
          [coordsI[0], coordsK[0]],
          [coordsI[1], coordsK[1]],
        ])
        matriceInverse = matrice.inverse()
      } while (matriceInverse == null)

      // génération des points de l'exercice
      let denX: number = 1
      let denY: number = 1
      if (this.sup2) {
        denX = choice([1, 2, 3])
        denY = choice([1, 2, 3], [denX])
      }

      for (let k = 0; k < this.sup3; k++) {
        do {
          x[i][k] = fraction(randint(-3 * denX, 3 * denX, [0]), denX)
          y[i][k] = fraction(randint(-2 * denY, 2 * denY, [0]), denY)
        } while (
          x[i]
            .slice(0, k)
            .map((el) => el.num)
            .includes(x[i][k].num) &&
          y[i]
            .slice(0, k)
            .map((el) => el.num)
            .includes(y[i][k].num)
        )
        const [mdx, mdy] = matrice.multiply([
          x[i][k].valeurDecimale,
          y[i][k].valeurDecimale,
        ]) as [number, number]
        this.X[i][k] = mdx
        this.Y[i][k] = mdy
      }
      const yMin = -3 * coordsK[1]
      const yMax = 3 * coordsK[1]
      const xMin = -4 * coordsI[0]
      const xMax = 4 * coordsI[0]

      this.figuresApiGeom[i] = new Figure(
        Object.assign(options, {
          xMin,
          yMin,
          width: 30 * (xMax - xMin),
          height: 30 * (yMax - yMin),
          scale: 1,
        }),
      )
      this.figuresApiGeom[i].options.latexHeight = 10
      this.figuresApiGeom[i].options.labelDxInPixels = 10
      this.figuresApiGeom[i].options.labelDyInPixels = 10
      this.figuresApiGeom[i].options.labelPointAfterCreation = true

      this.figuresApiGeom[i].setToolbar({
        tools: ['POINT_INTERSECTION', 'DRAG', 'UNDO', 'REDO', 'REMOVE'],
        position: 'top',
      })

      const fig = this.figuresApiGeom[i]
      fig.create('Point', {
        x: 0,
        y: 0,
        label: labelO,
        labelDxInPixels: -10,
        labelDyInPixels: -10,
        color: 'black',
        shape: 'o',
        sizeInPixels: 2,
        isSelectable: false,
      })
      const pointI = fig.create('Point', {
        x: coordsI[0],
        y: coordsI[1],
        label: labelI,
        labelDxInPixels: 0,
        labelDyInPixels: -10,
        shape: 'o',
        color: 'black',
        sizeInPixels: 2,
        isSelectable: false,
      })
      const pointK = fig.create('Point', {
        x: coordsK[0],
        y: coordsK[1],
        label: labelK,
        labelDxInPixels: -10,
        labelDyInPixels: 0,
        shape: 'o',
        color: 'black',
        sizeInPixels: 2,
        isSelectable: false,
      })
      const IPrime = fig.create('Point', {
        x: pointI.x * 4,
        y: pointI.y * 4,
        isVisible: false,
        isSelectable: false,
      })
      const KPrime = fig.create('Point', {
        x: pointK.x * 3,
        y: pointK.y * 3,
        isVisible: false,
        isSelectable: false,
      })
      const INeg = fig.create('Point', {
        x: -IPrime.x,
        y: -IPrime.y,
        isVisible: false,
        isSelectable: false,
      })
      const KNeg = fig.create('Point', {
        x: -KPrime.x,
        y: -KPrime.y,
        isVisible: false,
        isSelectable: false,
      })

      fig.create('Segment', {
        point1: INeg,
        point2: IPrime,
        shape: '->',
        color: 'black',
        thickness: 2,
      })
      fig.create('Segment', {
        point1: KNeg,
        point2: KPrime,
        shape: '->',
        color: 'black',
        thickness: 2,
      })

      /*
      Construire la grille
      */

      for (let xx = -4; xx < 4 + 1 / denX; xx += 1 / denX) {
        const coordL = matrice.multiply([xx, -3]) as [number, number]
        const coordH = matrice.multiply([xx, 3]) as [number, number]
        const pointL = fig.create('Point', {
          x: coordL[0],
          y: coordL[1],
          label: '',
          isSelectable: false,
          isVisible: false,
        })
        const pointH = fig.create('Point', {
          x: coordH[0],
          y: coordH[1],
          label: '',
          isSelectable: false,
          isVisible: false,
        })
        if (Math.abs(xx) > 0.1)
          fig.create('Segment', {
            point1: pointL,
            point2: pointH,
            color: 'gray',
            thickness: 0.5,
            opacity: 0.5,
          })
        for (let yy = -3; yy < 3 + 1 / denY; yy += 1 / denY) {
          if (xx === -4) {
            const coordsL = matrice.multiply([-4, yy]) as [number, number]
            const coordsR = matrice.multiply([4, yy]) as [number, number]
            const pointL = fig.create('Point', {
              x: coordsL[0],
              y: coordsL[1],
              label: '',
              isSelectable: false,
              isVisible: false,
            })
            const pointR = fig.create('Point', {
              x: coordsR[0],
              y: coordsR[1],
              label: '',
              isSelectable: false,
              isVisible: false,
            })
            if (Math.abs(yy) > 0.1)
              fig.create('Segment', {
                point1: pointL,
                point2: pointR,
                color: 'gray',
                thickness: 0.5,
                opacity: 0.5,
              })
          }
        }
      }

      const figureCorrection = new Figure(
        Object.assign(options, {
          xMin,
          yMin,
          width: 30 * (xMax - xMin),
          height: 30 * (yMax - yMin),
          scale: 1,
        }),
      )
      figureCorrection.options.latexHeight = 10
      figureCorrection.options.labelDxInPixels = 10
      figureCorrection.options.labelDyInPixels = 10
      figureCorrection.loadJson(JSON.parse(this.figuresApiGeom[i].json))
      for (let k = 0; k < this.sup3; k++) {
        figureCorrection.create('Point', {
          x: this.X[i][k],
          y: this.Y[i][k],
          label: listeNoms[3 + k],
          labelDxInPixels: x[i][k].valeurDecimale < 0 ? -10 : 10,
          labelDyInPixels: y[i][k].valeurDecimale < 0 ? -10 : 10,
        })
      }
      this.figuresApiGeomCorr[i] = figureCorrection
      let question: string = ''
      if (context.isHtml) {
        if (this.interactif) {
          question = `Placer les points $${this.labelsPoints[i].map((el, k) => `${el}(${x[i][k].texFractionSimplifiee}\\,;\\,${y[i][k].texFractionSimplifiee})`).join('$, $')}$ dans le repère $(${labelO},~${labelI},~${labelK})$.<br>`
          question += figureApigeom({
            exercice: this,
            figure: this.figuresApiGeom[i],
            i,
            isDynamic: true,
            defaultAction: 'POINT_INTERSECTION',
          })
        } else {
          question = `Placer les points $${this.labelsPoints[i].map((el, k) => `${el}(${x[i][k].texFractionSimplifiee}\\,;\\,${y[i][k].texFractionSimplifiee})`).join('$, $')}$ dans le repère $(${labelO},~${labelI},~${labelK})$.<br>`
          question += wrapperApigeomToMathalea(this.figuresApiGeom[i])
        }
      } else {
        question = `Placer les points $${this.labelsPoints[i].map((el, k) => `${el}(${x[i][k].texFractionSimplifiee}\\,;\\,${y[i][k].texFractionSimplifiee})`).join('$, $')}$ dans le repère $(${labelO},~${labelI},~${labelK})$.\\\\`
        question += this.figuresApiGeom[i].tikz()
      }
      let reponse = `Les points $${this.labelsPoints[i].map((el, k) => `${el}(${x[i][k].texFractionSimplifiee}\\,;\\,${y[i][k].texFractionSimplifiee})`).join('$, $')}$ dans le repère $(${labelO},~${labelI},~${labelK})$ :<br>`

      reponse += context.isHtml
        ? figureApigeom({
            exercice: this,
            figure: figureCorrection,
            i,
            idAddendum: 'correction',
            isDynamic: false,
          })
        : figureCorrection.tikz()
      if (
        this.questionJamaisPosee(i, ...x[i], ...y[i], ...coordsI, ...coordsK)
      ) {
        this.listeQuestions[i] = question
        this.listeCorrections[i] = reponse
        i++
      }
    }
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']

    const result: ('OK' | 'KO')[] = []
    const figure = this.figuresApiGeom[i]
    // Sauvegarde de la réponse pour Capytale
    if (this.answers === undefined) this.answers = {}
    this.answers[figure.id] = figureAnswerJson(figure)
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const divFeedback = document.querySelector(
      `#feedback${`Ex${this.numeroExercice}Q${i}`}`,
    )
    let allPointsAreGood = true
    for (let j = 0; j < this.labelsPoints[i].length; j++) {
      const label = this.labelsPoints[i][j]
      const { isValid, points } = figure.checkCoords({
        checkOnlyAbscissa: false,
        label,
        x: this.X[i][j],
        y: this.Y[i][j],
      })
      const point = points[0]
      if (isValid) {
        result.push('OK')
        point.color = 'green'
        point.colorLabel = 'green'
        point.thickness = 3
      } else {
        allPointsAreGood = false
        result.push('KO')
        if (point !== undefined) {
          point.color = 'red'
          point.colorLabel = 'red'
          point.thickness = 3
        }
      }
    }
    if (divFeedback != null) {
      if (allPointsAreGood) {
        divFeedback.innerHTML = '😎'
      } else {
        divFeedback.innerHTML = '☹️'
      }
    }
    return result
  }
}
