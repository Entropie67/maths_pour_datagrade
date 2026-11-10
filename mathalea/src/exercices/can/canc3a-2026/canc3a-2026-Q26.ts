import Figure from 'apigeom'
import Segment from 'apigeom/src/elements/lines/Segment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { wrapperApigeomToMathalea } from '../../../lib/apigeom/apigeomZoom'
import figureApigeom from '../../../lib/figureApigeom'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
import { bleuMathalea } from '../../../lib/colors'
import { figureAnswerJson } from '../../../lib/apigeom/figureAnswer'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = 'Tracer un segment de longueur fractionnaire'
export const interactifReady = true
export const uuid = '775b7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Rémi Angot

*/
export default class Can2026CM2Q26 extends ExerciceCan {
  figure!: Figure
  nbCarreaux: number = 0
  numAffiche: number = 0
  denAffiche: number = 0

  constructor() {
    super()
    this.formatChampTexte = 'none'
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'meta-custom'
  }

  enonce(num?: number, den?: number) {
    if (num == null || den == null) {
      ;[num, den] = choice([
        [1, 2],
        [1, 5],
        [7, 10],
        [3, 10],
      ])
    }
    this.numAffiche = num
    this.denAffiche = den
    const unite = 10
    this.nbCarreaux = (num / den) * unite
    this.reponse = this.nbCarreaux
    this.question = `Trace un segment de longueur $\\dfrac{${num}}{${den}}~\\text{u.l}$. `
    this.correction = `L'unité a une longueur de $${unite}~\\text{carreaux}$ donc $\\dfrac{${num}}{${den}}~\\text{u.l}=${miseEnEvidence(this.nbCarreaux)}~\\text{carreaux}$.`
    this.correction += `<br><br>Il suffit donc de tracer un segment de longueur $${this.nbCarreaux}~\\text{carreaux}$.`
    this.canEnonce = ''

    const figure = new Figure({
      xMin: 0,
      yMin: 0,
      width: 360,
      height: 160,
    })
    this.figure = figure
    this.figure.setToolbar({
      tools: ['SEGMENT', 'REMOVE'],
      position: 'top',
    })
    figure.divUserMessage.style.display = 'none'
    figure.create('Grid', {
      axeX: false,
      axeY: false,
      labelX: false,
      labelY: false,
    })
    figure.options.color = bleuMathalea
    figure.options.gridWithTwoPointsOnSamePosition = false
    figure.options.thickness = 2
    figure.snapGrid = true
    const ptA = figure.create('Point', { x: 1, y: 5, isVisible: false })
    const ptB = figure.create('Point', {
      x: unite + 1,
      y: 5,
      isVisible: false,
    })
    figure.create('Segment', {
      point1: ptA,
      point2: ptB,
      shape: '|-|',
      thickness: 3,
      isSelectable: false,
    })
    figure.create('TextByPosition', {
      x: unite / 2 + 1,
      y: 4,
      text: '$1~\\text{u.l}$',
      isDeletable: false,
    })
    const figureCorr = new Figure({
      xMin: 0,
      yMin: 0,
      width: 360,
      height: 160,
    })
    figureCorr.options.color = bleuMathalea
    figureCorr.options.thickness = 2
    figureCorr.create('Grid', {
      axeX: false,
      axeY: false,
      labelX: false,
      labelY: false,
    })
    const ptACorr = figureCorr.create('Point', { x: 1, y: 5, isVisible: false })
    const ptBCorr = figureCorr.create('Point', {
      x: unite + 1,
      y: 5,
      isVisible: false,
    })
    figureCorr.create('Segment', {
      point1: ptACorr,
      point2: ptBCorr,
      shape: '|-|',
      thickness: 3,
    })
    const ptCCorr = figureCorr.create('Point', { x: 1, y: 3, isVisible: false })
    const ptDCorr = figureCorr.create('Point', {
      x: this.nbCarreaux + 1,
      y: 3,
      isVisible: false,
    })
    figureCorr.create('Segment', {
      point1: ptCCorr,
      point2: ptDCorr,
      shape: '|-|',
      thickness: 3,
    })
    figureCorr.create('TextByPosition', {
      x: unite / 2 + 1,
      y: 4.5,
      text: '$1~\\text{u.l}$',
    })
    figureCorr.create('TextByPosition', {
      x: this.nbCarreaux / 2 + 1,
      y: 2,
      text: `$\\dfrac{${this.numAffiche}}{${this.denAffiche}}~\\text{u.l}$`,
    })

    const emplacementPourFigure = figureApigeom({
      exercice: this,
      // L'index de la question dans un méta-exercice est appliqué par
      // `figureApigeom()` à partir de `indexQuestionHote`.
      i: 0,
      figure,
      defaultAction: 'SEGMENT',
    })
    if (context.isHtml) {
      if (this.interactif) {
        this.question += emplacementPourFigure
      } else {
        this.question += wrapperApigeomToMathalea(figure)
      }
    } else {
      const g = grille(0, 0, unite + 2, 5, 'gray', 0.5, 1)
      const s = segment(1, 5, unite + 1, 5, bleuMathalea)
      s.epaisseur = 2
      s.styleExtremites = '|-|'
      s.tailleExtremites = 2
      const ul = latex2d('1~\\text{u.l}', unite / 2 + 1, 4.5, {
        letterSize: 'scriptsize',
      })
      const objets = [g, s, ul]
      const fig = mathalea2d(
        Object.assign({ scale: 0.35 }, fixeBordures(objets)),
        objets,
      )

      this.canReponseACompleter = fig
    }
    this.correction += '\n\n<br><br>\n'
    if (context.isHtml) {
      this.correction += wrapperApigeomToMathalea(figureCorr)
    } else {
      this.correction += '<br>' + figureCorr.tikz()
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(1, 2)
    else this.enonce()
  }

  correctionInteractive = (i: number) => {
    const figure = this.figure
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'

    if (this.answers == null) this.answers = {}
    this.answers[figure.id] = figureAnswerJson(figure)

    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const segments = [...figure.elements.values()].filter((e) =>
      e.type.includes('Segment'),
    )
    let distance = Number.POSITIVE_INFINITY
    if (segments.length === 2) {
      if (!(segments[1] instanceof Segment)) throw new Error()
      const point1 = segments[1].point1
      const point2 = segments[1].point2
      distance = Math.hypot(point1.x - point2.x, point1.y - point2.y)
    }

    const isValid = distance === this.reponse
    let result: 'OK' | 'KO' = 'KO'

    if (divFeedback != null) {
      if (isValid) {
        divFeedback.innerHTML = '😎'
        result = 'OK'
      } else {
        const p = document.createElement('p')
        p.innerText = '☹️'
        divFeedback.insertBefore(p, divFeedback.firstChild)
      }
    }
    return result
  }
}
