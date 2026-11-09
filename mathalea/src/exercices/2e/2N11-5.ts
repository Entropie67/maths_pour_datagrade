import type Figure from 'apigeom/src/Figure'
import { apigeomGraduatedLine } from '../../lib/apigeom/apigeomGraduatedLine'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

export const titre =
  "Placer un point sur une droite graduée dont l'abscisse est un nombre relatif"
export const dateDeModifImportante = '03/05/2024'

/**
 * Clone de 5R11-2 avec une seule question.
 * @author Stéphane Guyon 
 */
export const uuid = 'a9120'

export const refs = {
  'fr-fr': ['2N11-5'],
  'fr-ch': ['9R1NO3A-4', '9R2NO3A-4', '9R3NO3A-4'],
}

type goodAnswer = { label: string; x: number }[]

class PlacerPointsSurAxeRelatifs extends Exercice {
  goodAnswers: goodAnswer[] = []
  precisions: number[] = []
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = false
  }

  nouvelleVersion() {
    this.figuresApiGeom = []

    this.contenu = this.consigne
    for (let i = 0; i < this.nbQuestions; i++) {
      let abs0: number, step: number
      let texte = ''
      let texteCorr = ''
      const label1 = lettreDepuisChiffre(i * 3 + 1)
      const precision = randint(2, 3)
      if (precision === 2) {
        // Placement au centième.
        abs0 = randint(-4, -2) / 10
        step = 10
      } else {
        // Placement au millième.
        abs0 = randint(-10, -2) / 100
        step = 100
      }
      const stepBis = 10
      const x1 = randint(0, 6)
      const x11 = x1 === 6 ? randint(1, 3) : randint(1, 9)
      const abs1 = arrondi(abs0 + x1 / step + x11 / step / stepBis, precision)

      this.goodAnswers[i] = [{ label: label1, x: arrondi(abs1, 4) }]
      this.precisions[i] = precision

      if (context.isAmc) {
        this.autoCorrection[i] = {
          enonce: texte,
          propositions: [{ texte: texteCorr, statut: 0, feedback: '' }],
        }
      }

      const xMin = abs0 - 1 / (stepBis * stepBis * stepBis * stepBis)
      const xMax = abs0 + 7 / step + 1 / (stepBis * stepBis * stepBis)
      const { figure, latex } = apigeomGraduatedLine({
        xMin,
        xMax,
        scale: step,
      })
      figure.options.labelAutomaticBeginsWith = label1
      figure.options.labelAutomaticForPoints = true
      figure.options.pointDescriptionWithCoordinates = false
      figure.options.distanceWithoutNewPoint = 0.00001
      this.figuresApiGeom[i] = figure

      const { figure: figureCorr, latex: latexCorr } = apigeomGraduatedLine({
        xMin,
        xMax,
        scale: step,
      })
      figureCorr.create('Point', {
        label: label1,
        x: abs1,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        shape: 'x',
        labelDxInPixels: 0,
      })
      texte = `Placer le point $${label1}(${texNombre(abs1, 5)})$.`

      switch (true) {
        case context.isHtml && this.interactif:
          texte +=
            '<br>' +
            figureApigeom({ exercice: this, i, figure, defaultAction: 'POINT' })
          texteCorr += wrapperApigeomToMathalea(figureCorr)
          break
        case context.isHtml:
          texte += '<br>' + wrapperApigeomToMathalea(figure)
          texteCorr += wrapperApigeomToMathalea(figureCorr)
          break
        default: {
          const xA = arrondi((abs1 - xMin) * step * 10)
          const latexCorrWithPoint = latexCorr.replace(
            '\\end{tikzpicture}',
            `\\tkzText[above=2mm](${xA},0){${label1}}
      \\tkzDrawPoint[shape=cross out, size=5pt, thick](${xA},0)
\\end{tikzpicture}`,
          )
          texte += '\n\n' + latex
          texteCorr += '\\;\n' + latexCorrWithPoint
          break
        }
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: this.consigne + '<br>' + texte + '<br>',
          propositions: [{ statut: 3, sanscadre: true }],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }

    this.exoCustomResultat = true
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    const result: ('OK' | 'KO')[] = []
    const figure = this.figuresApiGeom[i] as Figure
    if (this.answers === undefined) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const goodAnswer = this.goodAnswers[i]
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    for (let j = 0; j < goodAnswer.length; j++) {
      const label = goodAnswer[j].label
      const x = goodAnswer[j].x
      const { isValid, message, points } = figure.checkCoords({
        checkOnlyAbscissa: true,
        label,
        x,
        y: 0,
        precision: this.precisions[i] + 1,
      })
      const point = points[0]
      if (isValid) {
        result.push('OK')
        point.color = 'green'
        point.colorLabel = 'green'
        point.thickness = 3
      } else {
        result.push('KO')
        if (point !== undefined) {
          point.color = 'red'
          point.colorLabel = 'red'
          point.color = 'red'
          point.thickness = 3
        }
      }
      if (divFeedback != null && message.length > 0) {
        const p = document.createElement('p')
        p.innerText = message
        divFeedback.appendChild(p)
      }
    }
    if (divFeedback != null) {
      if (divFeedback?.innerHTML === '') {
        divFeedback.innerHTML = '😎'
      } else {
        const p = document.createElement('p')
        p.innerText = '☹️'
        divFeedback.insertBefore(p, divFeedback.firstChild)
      }
    }
    return result
  }
}

export default PlacerPointsSurAxeRelatifs
