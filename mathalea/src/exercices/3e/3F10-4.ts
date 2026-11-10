import { fixeBordures } from '../../lib/2d/fixeBordures'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { Tableau } from '../../lib/2d/tableau'
import figureApigeom from '../../lib/figureApigeom'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  AddTabPropMathlive,
  type Icell,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { Spline, noeudsSplineAleatoire } from '../../lib/mathFonctions/Spline'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

import Figure from 'apigeom'
import { lectureImage } from '../../lib/2d/LectureImage'
import { bleuMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = "Lire graphiquement l'image d'un nombre par une fonction"
export const dateDePublication = '29/10/2023'
export const interactifReady = true

/**
 * Lire une image sur une Spline
 * @author Jean-claude Lhote (sur le modèle de 5R12-1 de Rémi Angot)

 */
export const uuid = '6c6b3'

export const refs = {
  'fr-fr': ['3F10-4', '2F12-1', 'BP2AutoO5'],
  'fr-ch': ['1mF1-2', '10LCFA3B-2', '10LSFA3B-2', '11CTFA2A-2', 'PRQPF01B-3'],
}

class LireImageParApiGeom extends Exercice {
  nbImages: number
  X: number[]
  Y: number[]
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = 'none' // Pour un exercice de type simple qui n'utilise pas le champ de réponse

    this.besoinFormulaireNumerique = ["Nombre d'images à trouver (de 1 à 5)", 5]
    this.besoinFormulaire2CaseACocher = ['Utiliser des valeurs entières', false]
    this.sup = 3
    this.sup2 = false
    this.nbImages = 3
    this.X = []
    this.Y = []
    this.exoCustomResultat = true
    this.answers = {}
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    // on va chercher une spline aléatoire
    const noeuds = this.sup2
      ? noeudsSplineAleatoire(12, false, -6, 2, 1)
      : noeudsSplineAleatoire(12, false, -6, 2)
    const spline = new Spline(noeuds)
    this.nbImages = this.sup
    const figure = new Figure({
      xMin: -6.3,
      yMin: -6.3,
      width: 378,
      height: 378,
    })
    figure.create('Grid')
    figure.options.limitNumberOfElement.Point = 1

    this.listeCorrections = ['']

    // De -6.3 à 6.3 donc width = 12.6 * 30 = 378
    const mesPoints = spline.pointsOfSpline(figure)
    const polyline = figure.create('Polyline', { points: mesPoints })

    if (context.isHtml) {
      const pointMobile = figure.create('PointOnPolyline', {
        polyline,
        x: 1,
        dx: 0.1,
        abscissa: true,
        ordinate: true,
        isVisible: true,
        label: 'M',
        shape: 'x',
        color: bleuMathalea,
        size: 3,
        thickness: 3,
      })
      pointMobile.createSegmentToAxeX()
      pointMobile.createSegmentToAxeY()
      const textX = figure.create('DynamicX', { point: pointMobile })
      const textY = figure.create('DynamicY', { point: pointMobile })
      textX.dynamicText.maximumFractionDigits = 1
      textY.dynamicText.maximumFractionDigits = 1
      this.figuresApiGeom[0] = figure
    }

    let enonce =
      'Par lecture graphique sur la courbe de la fonction $f$ tracée ci-dessus, compléter le tableau de valeurs ci-dessous :<br>'
    this.X = []
    this.Y = []
    for (let i = 0; i < this.nbImages; i++) {
      do {
        if (!this.sup2 && spline.x && spline.n) {
          this.X[i] =
            Math.round(
              (spline.x[0] +
                Math.random() * (spline.x[spline.n - 1] - spline.x[0])) *
                10,
            ) / 10
        } else {
          this.X[i] = randint(-6, 6, this.X)
        }
        // je sais que i n'est pas modifié, mais la condition sur this.x[i] l'est et c'est ça qui compte !
      } while (
        this.X.slice(0, i).indexOf(this.X[i]) !== -1 ||
        !(this.X[i] < -1 || this.X[i] > 1)
      )
    }
    // on ordonne les X dans l'ordre croissant
    let index = 0
    while (index < this.nbImages) {
      let j = index + 1
      while (j < this.nbImages) {
        if (this.X[index] > this.X[j]) {
          const x = this.X[index]
          const y = this.Y[index]
          this.X[index] = this.X[j]
          this.Y[index] = this.Y[j]
          this.X[j] = x
          this.Y[j] = y
        }
        j++
      }
      index++
    }
    for (let i = 0; i < this.nbImages; i++) {
      const image = spline.fonction(this.X[i])
      this.Y[i] = Math.round(10 * Number(image)) / 10
    }

    const ligne1: Icell[] = [
      { texte: 'x', gras: true, color: 'black', latex: true },
    ].concat(
      this.X.map((el) =>
        Object.assign(
          {},
          { texte: texNombre(el, 1), gras: false, color: 'black', latex: true },
        ),
      ),
    )
    const ligne2: Icell[] = [
      { texte: 'f(x)', gras: true, color: 'black', latex: true },
    ].concat(
      this.Y.map((el) =>
        Object.assign(
          {},
          {
            texte: miseEnEvidence(texNombre(el, 1)),
            gras: false,
            color: 'black',
            latex: true,
          },
        ),
      ),
    )
    const ligne2bis: Icell[] = [
      { texte: 'f(x)', gras: true, color: 'black', latex: true },
    ].concat(
      this.Y.map(() =>
        Object.assign(
          {},
          { texte: '', gras: false, color: 'black', latex: true },
        ),
      ),
    )
    const nbColonnes = this.nbImages
    const yGrecs: string[] = this.Y.map((el) => texNombre(el, 1))
    const xs = this.X.map((el) => texNombre(el, 1))

    if (context.isHtml) {
      const tabMathlive = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        0,
        { ligne1, ligne2: ligne2bis, nbColonnes },
        'clavierDeBase',
        this.interactif,
        {},
      )
      enonce += '<br>' + tabMathlive.output
    } else {
      const tableauVideForLatex = new Tableau({
        ligne1: ['x']
          .concat(xs)
          .map((el) => Object.assign({}, { texte: el, latex: true })),
        ligne2: ['f(x)', '', '', ''].map((el) =>
          el === ''
            ? Object.assign({}, { texte: el })
            : Object.assign({}, { texte: el, latex: true }),
        ),
        largeurTitre: 1,
        nbColonnes: 4,
        hauteur: 1,
        largeur: 1,
      })
      const tabVideTex = mathalea2d(
        Object.assign({}, fixeBordures([tableauVideForLatex])),
        tableauVideForLatex,
      )
      enonce += tabVideTex
    }
    const tableauValeur = AddTabPropMathlive.create(
      this.numeroExercice ?? 0,
      0,
      { ligne1, ligne2, nbColonnes },
      'clavierDeBase',
      false,
      {},
    )

    // const tabValeurTex = tableauColonneLigne(['x'].concat(xs), ['f(x)'], yGrecs, 1, true, this.numeroExercice, 0)
    // contenu des cellules { texte: string, gras?: boolean, math?: boolean, latex?: boolean, color?: string }
    const tableauValeursForLatex = new Tableau({
      ligne1: ['x']
        .concat(xs)
        .map((el) => Object.assign({}, { texte: el, latex: true })),
      ligne2: ['f(x)', ...yGrecs].map((el) =>
        el === ''
          ? Object.assign({}, { texte: el })
          : Object.assign({}, { texte: el, latex: true }),
      ),
      largeurTitre: 1,
      nbColonnes: 4,
      hauteur: 1,
      largeur: 1,
    })
    const tabValeurTex = mathalea2d(
      Object.assign({}, fixeBordures([tableauValeursForLatex])),
      tableauValeursForLatex,
    )

    figure.setToolbar({ tools: ['DRAG'], position: 'top' })
    if (figure.ui) figure.ui.send({ type: 'DRAG' })
    // Il est impératif de choisir les boutons avant d'utiliser figureApigeom
    const emplacementPourFigure = figureApigeom({
      exercice: this,
      i: 0,
      figure: this.figuresApiGeom[0],
    })
    figure.isDynamic = true
    figure.divButtons.style.display = 'flex'
    const repere = new RepereBuilder({
      xMin: -6.3,
      yMin: -6.3,
      xMax: 6.3,
      yMax: 6.3,
    })
      .setThickX({ xMax: 6, xMin: -6, dx: 1 })
      .setThickY({ yMax: 6, yMin: -6, dy: 1 })
      .setGrille({
        grilleX: {
          dx: 1,
          xMin: -6,
          xMax: 6,
        },
        grilleY: {
          dy: 1,
          yMin: -6,
          yMax: 6,
        },
      })
      .setGrilleSecondaire({
        grilleX: {
          dx: 0.2,
          xMin: -6,
          xMax: 6,
        },
        grilleY: { dy: 0.2, yMin: -6, yMax: 6 },
      })
      .setLabelX({ dx: 1, xMin: -6, xMax: 6 })
      .buildStandard()

    const objs = []
    const colors = ['red', bleuMathalea, 'green', 'purple', 'orange']
    for (let i = 0; i < this.nbImages; i++) {
      objs.push(lectureImage(this.X[i], this.Y[i], 1, 1, colors[i % 5]))
    }
    const figureCorrection = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures([repere])),
      [repere, spline.courbe(), objs],
    )
    if (context.isHtml) {
      this.listeCorrections[0] =
        'Les images sont tolérées à $0,1$ près :' +
        tableauValeur.output +
        figureCorrection

      this.listeQuestions = [emplacementPourFigure + enonce]
      const reponses = []
      for (let i = 0; i < nbColonnes; i++) {
        reponses.push([
          `L1C${i + 1}`,
          {
            value: this.Y[i],
            options: { approximatelyCompare: true, tolerance: 0.11 },
          },
        ])
      }
      reponses.push(['bareme', toutAUnPoint])
      handleAnswers(this, 0, Object.fromEntries(reponses))
    } else {
      this.listeCorrections[0] =
        figureCorrection +
        'Les images sont tolérées à $0,1$ près :' +
        '\\\\' +
        tabValeurTex
      this.listeQuestions = [
        mathalea2d(Object.assign({ scale: 0.8 }, fixeBordures([repere])), [
          repere,
          spline.courbe(),
        ]) + enonce,
      ]
    }
  }
}

export default LireImageParApiGeom
