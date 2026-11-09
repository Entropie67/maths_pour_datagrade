import { amcConvert } from '../../lib/amc/amcBuilders'
import { apigeomGraduatedLine } from '../../lib/apigeom/apigeomGraduatedLine'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

export const titre =
  "Placer un point sur une droite graduée dont l'abscisse est un nombre relatif"
export const dateDeModifImportante = '03/05/2024'

/**
 * Placer un point d'abscisse un nombre relatif
 * @author Jean-claude Lhote et Rémi Angot
 */
export const uuid = '6d576'

export const refs = {
  'fr-fr': ['5G1A-1', '5N2E-1'],
  'fr-2016': ['5R11-2'],
  'fr-ch': ['9R1NO3A-2', '9R2NO3A-2', '9R3NO3A-2', 'PRQNO04A-2', 'PRQNO05A-2'],
}

type goodAnswer = { label: string; x: number }[]

class PlacerPointsSurAxeRelatifs extends Exercice {
  goodAnswers: goodAnswer[] = []
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Nombre relatif à une décimale\n2 : Nombre relatif à deux décimales\n3 : Nombre relatif à trois décimales\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    let typesDeQuestions

    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    if (this.sup === 4) {
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes(
        [parseInt(this.sup)],
        this.nbQuestions,
      )
    }

    this.contenu = this.consigne
    for (let i = 0; i < this.nbQuestions; i++) {
      let abs0, step, stepBis: number
      let texte = ''
      let texteCorr = ''
      const label1 = lettreDepuisChiffre(i * 3 + 1)
      const label2 = lettreDepuisChiffre(i * 3 + 2)
      const label3 = lettreDepuisChiffre(i * 3 + 3)
      switch (typesDeQuestions[i]) {
        case 1: // 1 décimale
          abs0 = randint(-7, -3)
          step = 1
          stepBis = 10
          break

        case 2: // 2 décimales
          abs0 = randint(-4, -2) / 10
          step = 10
          stepBis = 10
          break

        default: // 3 décimales
          abs0 = randint(-10, -2) / 100
          step = 100
          stepBis = 10
          break
      }
      const x1 = randint(0, 2)
      const x2 = randint(3, 4)
      const x3 = randint(5, 6)
      const x11 = randint(1, 9)
      const x22 = randint(1, 9)
      const x33 = randint(1, 3)
      const abs1 = arrondi(
        abs0 + x1 / step + x11 / step / stepBis,
        typesDeQuestions[i],
      ) // le type de questions est égal au nombre de décimales.
      const abs2 = arrondi(
        abs0 + x2 / step + x22 / step / stepBis,
        typesDeQuestions[i],
      )
      const abs3 = arrondi(
        abs0 + x3 / step + x33 / step / stepBis,
        typesDeQuestions[i],
      )

      this.goodAnswers[i] = [
        { label: label1, x: arrondi(abs1, 4) },
        { label: label2, x: arrondi(abs2, 4) },
        { label: label3, x: arrondi(abs3, 4) },
      ]

      if (context.isAmc) {
        this.autoCorrection[i] = {
          enonce: texte,
          propositions: [{ texte: texteCorr, statut: 0, feedback: '' }],
        }
      }

      const { figure, latex } = apigeomGraduatedLine({
        xMin: abs0 - 1 / (stepBis * stepBis * stepBis * stepBis),
        xMax: abs0 + 7 / step + 1 / (stepBis * stepBis * stepBis),
        scale: step,
      })
      figure.options.labelAutomaticForPoints = true
      figure.options.labelAutomaticBeginsWith = label1
      figure.options.pointDescriptionWithCoordinates = false
      figure.options.distanceWithoutNewPoint = 0.00001
      this.figuresApiGeom[i] = figure

      const { figure: figureCorr, latex: latexCorr } = apigeomGraduatedLine({
        xMin: abs0 - 1 / (stepBis * stepBis * stepBis * stepBis),
        xMax: abs0 + 7 / step + 1 / (stepBis * stepBis * stepBis),
        scale: step,
        points: this.goodAnswers[i],
      })
      figureCorr.create('Point', {
        label: label1,
        x: abs1,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        shape: 'x',
        labelDxInPixels: 0,
      })
      figureCorr.create('Point', {
        label: label2,
        x: abs2,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
      })
      figureCorr.create('Point', {
        label: label3,
        x: abs3,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
      })
      this.figuresApiGeomCorr[i] = figureCorr
      texte = `Placer les points : $${label1}(${texNombre(abs1, 5)}), ${label2}(${texNombre(abs2, 5)}), ${label3}(${texNombre(abs3, 5)})$.`

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
        default:
          texte += '\n\n' + latex
          texteCorr += '\\;\n' + latexCorr
          break
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
    const figure = this.figuresApiGeom![i]
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
        precision: this.sup + 1,
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
