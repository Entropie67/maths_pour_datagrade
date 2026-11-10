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

export const titre = "Placer un point d'abscisse décimale"
export const dateDeModifImportante = '03/05/2024'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
/**
 * Placer un point d'abscisse décimale
 * @author Jean-claude Lhote et Rémi Angot
 * Relecture : Janvier 2022 par EE
 */

export const uuid = 'e528e'

export const refs = {
  'fr-fr': ['6N1G', '5G1autoA'],
  'fr-2016': ['6N30-2'],
  'fr-ch': ['PR-37', '9R1NO2C-6', '9R2NO2C-6', '9R3NO2C-6', 'PRQNO04A-9'],
}

type goodAnswer = { label: string; x: number }[]

class PlacerPointsSurAxe extends Exercice {
  goodAnswers: goodAnswer[] = []
  constructor() {
    super()
    this.consigne = 'Placer trois points sur un axe gradué.'
    this.nbQuestions = 5

    this.sup = 1
    this.exoCustomResultat = true
    this.reponseCourteDisponible = false // La réponse est une construction sur un axe gradué.
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Un chiffre après la virgule\n2 : Deux chiffres après la virgule \n3 : Trois chiffres après la virgule\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    let typesDeQuestions

    if (this.sup > 3) {
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    }

    this.contenu = this.consigne
    for (let i = 0; i < this.nbQuestions; i++) {
      const label1 = lettreDepuisChiffre(i * 3 + 1)
      const label2 = lettreDepuisChiffre(i * 3 + 2)
      const label3 = lettreDepuisChiffre(i * 3 + 3)
      let abs0
      let step, stepBis: number
      let texte = ''
      let texteCorr = ''
      switch (typesDeQuestions[i]) {
        case 1: // Placer un point sur un axe (1 décimale)
          abs0 = this.sup > 4 ? randint(-5, 5) : randint(0, 9)
          step = 1
          stepBis = 10
          break

        case 2: // Placer un point sur un axe (2 décimales)
          abs0 =
            this.sup > 4
              ? arrondi(randint(-50, 50) / 10)
              : arrondi(randint(0, 90) / 10)
          step = 10
          stepBis = 10
          break

        default: // Placer un point sur un axe (3 décimales)
          abs0 =
            this.sup > 4
              ? arrondi(randint(-500, 500) / 100, 4)
              : arrondi(randint(0, 990) / 100, 4)
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
      figure.divFigureAndUserMessage.classList.add(
        ...['overflow-x-auto', 'overflow-y-hidden'],
      )
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
      texte = `Placer les points : $${label1}(${texNombre(abs1, 5)})$ ; $${label2}(${texNombre(abs2, 5)})$ ; $${label3}(${texNombre(abs3, 5)})$.`

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

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
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
    const goodAnswer = this.goodAnswers[i]
    const divFeedback = document.querySelector(
      `#feedback${`Ex${this.numeroExercice}Q${i}`}`,
    )
    for (let j = 0; j < goodAnswer.length; j++) {
      const label = goodAnswer[j].label
      const x = goodAnswer[j].x
      const { isValid, message, points } = figure.checkCoords({
        checkOnlyAbscissa: true,
        label,
        x,
        y: 0,
        precision: 5,
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

export default PlacerPointsSurAxe
