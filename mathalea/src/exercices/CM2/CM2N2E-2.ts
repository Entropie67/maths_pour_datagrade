import Figure from 'apigeom'
import GraduatedLine from 'apigeom/src/elements/grid/GraduatedLine'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '29/06/2021'
export const dateDeModifImportante = '03/05/2024'
export const titre = "Placer des points d'abscisses fractionnaires"
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Rémi Angot
 */
export const uuid = '2ba53'

export const refs = {
  'fr-fr': ['CM2N2E-2'],
  'fr-2016': ['6N21'],
  'fr-ch': ['9R1NO4B-7', '9R2NO4B-7', '9R3NO4B-7', 'PRQNO04B-2'],
}

type goodAnswer = { label: string; x: number }[]

class PlacerPointsAbscissesFractionnaires extends Exercice {
  goodAnswers!: goodAnswer[]
  constructor() {
    super()

    this.nbQuestions = 5
    this.sup = 1
    this.sup2 = false
    this.sup3 = true
    this.exoCustomResultat = true
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Demis, tiers ou quarts avec zéro placé\n2 : Des cinquièmes aux neuvièmes avec zéro placé \n3 : Toutes les fractions précédentes mais zéro non visible\n4 : Mélange\n5 : Mélange avec des nombres relatifs',
    ] // Niveau de difficulté : 5 cf 2N10-3
    // cf 2N10-3
    this.besoinFormulaire2CaseACocher = ['Utiliser la notation ( )', false]
    this.besoinFormulaire3CaseACocher = ['Correction détaillée', true]
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    this.goodAnswers = []
    let typeDeQuestions
    if (this.sup > 3) {
      typeDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typeDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    }
    const fractionsUtilisees: Array<[number, number]> = [] // Pour s'assurer de ne pas poser 2 fois la même question
    const tableUtilisées: [number[], number[], number[]] = [[], [], []]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let origine, num1, den1: number
      const scale = 2
      switch (typeDeQuestions[i]) {
        case 1: // Placer des demis aux quarts sur un axe
          origine = this.sup > 4 ? randint(-4, 1) : 0
          den1 = randint(2, 4, tableUtilisées[0])
          num1 = origine * den1 + randint(1, den1 * 4)
          if (num1 === 0) num1 += origine + 4 === 0 ? -1 : 1 // ne pas avoir 0 comme premier nombre, pour la correction détaillée
          tableUtilisées[0].push(den1)
          if (tableUtilisées[0].length === 3) tableUtilisées[0] = []
          break
        case 2: // Placer des cinquièmes aux neuvièmes sur un axe
          origine = this.sup > 4 ? randint(-4, 1) : 0
          den1 = randint(5, 9, tableUtilisées[1])
          num1 = origine * den1 + randint(1, den1 * 4)
          if (num1 === 0) num1 += origine + 4 === 0 ? -1 : 1 // ne pas avoir 0 comme premier nombre, pour la correction détaillée
          tableUtilisées[1].push(den1)
          if (tableUtilisées[1].length === 5) tableUtilisées[1] = []
          break
        default: // Placer des demis aux neuvièmes à partir d'un entier >=1 sur un axe
          origine = this.sup > 4 ? randint(-4, 1) : randint(1, 7)
          den1 = randint(2, 9, tableUtilisées[2])
          num1 = randint(origine * den1 + 1, (origine + 4) * den1, den1)
          if (num1 === 0) num1 += origine + 4 === 0 ? -1 : 1 // ne pas avoir 0 comme premier nombre, pour la correction détaillée
          tableUtilisées[2].push(den1)
          if (tableUtilisées[2].length === 8) tableUtilisées[2] = []
      }

      const num2 = randint(origine * den1 + 1, (origine + 4) * den1, [
        num1,
        den1,
      ])
      const num3 = randint(origine * den1 + 1, (origine + 4) * den1, [
        num1,
        num2,
        den1,
      ])

      const label1 = lettreIndiceeDepuisChiffre(i * 3 + 1)
      const label2 = lettreIndiceeDepuisChiffre(i * 3 + 2)
      const label3 = lettreIndiceeDepuisChiffre(i * 3 + 3)

      this.goodAnswers[i] = [
        { label: label1, x: arrondi(num1 / den1, 4) },
        { label: label2, x: arrondi(num2 / den1, 4) },
        { label: label3, x: arrondi(num3 / den1, 4) },
      ]
      if (this.sup2) {
        // const s = fraction(num1, den1).ecritureAlgebrique()
        texte = `Placer les points $${label1}\\left(${fraction(num1, den1).toLatex()}\\right)$, $~${label2}\\left(${fraction(num2, den1).toLatex()}\\right)$ et $~${label3}\\left(${fraction(num3, den1).toLatex()}\\right)$.`
      } else {
        texte = `Placer le point $${label1}$ d'abscisse $${fraction(num1, den1).toLatex()}$, le point $${label2}$ d'abscisse $${fraction(num2, den1).toLatex()}$ et le point $${label3}$ d'abscisse $${fraction(num3, den1).toLatex()}$.`
      }
      const { figure, latex } = apigeomGraduatedLine({
        xMin: origine,
        xMax: origine + 4,
        scale,
        stepBis: 1 / den1,
      })
      figure.options.labelAutomaticBeginsWith = label1
      figure.options.labelAutomaticForPoints = true
      figure.options.pointDescriptionWithCoordinates = false
      this.figuresApiGeom[i] = figure
      const { figure: figureCorr, latex: latexCorr } = apigeomGraduatedLine({
        xMin: origine,
        xMax: origine + 4,
        scale,
        stepBis: arrondi(1 / den1, 6),
        points: this.goodAnswers[i],
      })
      figureCorr.create('Point', {
        label: label1,
        x: arrondi(num1 / den1, 4),
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        shape: 'x',
        labelDxInPixels: 0,
      })
      figureCorr.create('Point', {
        label: label2,
        x: arrondi(num2 / den1, 4),
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
      })
      figureCorr.create('Point', {
        label: label3,
        x: arrondi(num3 / den1, 4),
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
      })
      this.figuresApiGeomCorr[i] = figureCorr

      switch (true) {
        case context.isHtml && this.interactif:
          texte +=
            '<br>' +
            figureApigeom({
              exercice: this as Exercice,
              i,
              idAddendum: refs['fr-fr'][0],
              figure,
              defaultAction: 'POINT',
            })
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
      // correction détaillée
      if (this.sup3) {
        texteCorr += context.isHtml ? '<br>' : ''
        texteCorr += `Dans une unité, il y a $${den1}$ intervalles, donc le pas est de $\\dfrac{1}{${den1}}$.<br>`
        if (typeDeQuestions[i] === 3 && this.sup < 5) {
          texteCorr += `Le point $${label1}$ est entre $${origine}$ et $${origine + 4}$. $${origine}$ correspond à $${fraction(origine * den1, den1).toLatex()}$ car il faut $${den1}$ intervalles pour faire une unité donc pour $${origine}$ unités, il en faut $${origine} \\times ${den1} = ${origine * den1}$ pas.<br>`
          texteCorr += `À partir de la graduation $${origine}$, il faut encore $${num1 - origine * den1}$ pas pour placer le point $${label1}$ car $${origine * den1}$ + $${num1 - origine * den1}$ = $${num1}$ .`
        } else {
          texteCorr += `Le point $${label1}$ a pour abscisse $${fraction(num1, den1).toLatex()}$, il faut donc `
          texteCorr +=
            num1 > 0 ? `avancer de $${num1}$ ` : `reculer de $${-num1}$ `
          texteCorr += `pas à partir de l'origine pour placer le point $${label1}$.`
        }
        texteCorr += `<br>On effectue la même démarche pour les points $${label2}$ et $${label3}$.`
      }

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: 'ici la (ou les) question(s) est(sont) posée(s)',
          enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvantUneFois: false, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
          propositions: [
            {
              type: 'AMCOpen', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: texte,
                  sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (!isArrayInArray(fractionsUtilisees, [num1, den1])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        fractionsUtilisees[i] = [num1, den1]
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    // Sauvegarde de la réponse pour Capytale
    if (this.answers == null) this.answers = {}
    if (this == null) return ['KO']
    this.answers[this.figuresApiGeom[i].id] = figureAnswerJson(
      this.figuresApiGeom[i],
    )
    const result: ('OK' | 'KO')[] = []
    const figure = this.figuresApiGeom[i]
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
      const { isValid, points } = figure.checkCoords({
        checkOnlyAbscissa: true,
        label,
        x,
        y: 0,
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
    }
    if (divFeedback != null) {
      if (result[0] === 'OK' && result[1] === 'OK' && result[2] === 'OK') {
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

/**
 * Vérifie la présence d'un tableau dans un tableau de tableau
 * @param {array} arr
 * @param {array} item
 * @returns {boolean}
 */
function isArrayInArray(arr: Array<[number, number]>, item: [number, number]) {
  const itemAsString = JSON.stringify(item)
  const contains = arr.some(function (ele) {
    return JSON.stringify(ele) === itemAsString
  })
  return contains
}

function apigeomGraduatedLine({
  xMin,
  xMax,
  scale = 1,
  points,
  step = 1,
  stepBis = 0.25,
}: {
  xMin: number
  xMax: number
  scale?: number
  step?: number
  stepBis?: number
  points?: Array<{ x: number; label: string }>
}): { figure: Figure; latex: string } {
  const width = 750
  const height = 80
  const figure = new Figure({
    xMin: xMin - 0.2 / scale,
    yMin: -1.5,
    width,
    height,
    dy: 10,
    dx: stepBis,
    xScale: 3 * scale,
    snapGrid: true,
  })
  figure.setToolbar({ tools: ['POINT', 'DRAG', 'REMOVE'], position: 'top' })

  const d = new GraduatedLine(figure, { min: xMin, max: xMax, step, stepBis })
  d.draw()
  let latex = `\n\\bigskip
  \\begin{tikzpicture}[x=2.5mm]
  \\draw[-{Latex[round]},thick] (0,0) -- (61,0);
  \\foreach \\x in {0,${10 * stepBis},...,60} \\draw[thick] ([yshift=-0.8mm]\\x,0) -- ([yshift=0.8mm]\\x,0);
  \\foreach \\x [count=\\i from 0] in {0,10,...,60} \\draw[ultra thick] ([yshift=-1.5mm]\\x,0) coordinate (a\\i) -- ([yshift=1.5mm]\\x,0);
  \\foreach \\x [count=\\i from 0] in {${xMin},${xMin + 1},${xMin + 2},${xMin + 3},${xMin + 4},${xMin + 5},${xMin + 6}} {
    \\node[below=2mm of a\\i,inner sep=0pt,font=\\small] {$\\num{\\x}$};
  }`
  if (points !== undefined) {
    const xA = arrondi((points[0].x - xMin) * 10)
    const xB = arrondi((points[1].x - xMin) * 10)
    const xC = arrondi((points[2].x - xMin) * 10)
    const labelA = points[0].label
    const labelB = points[1].label
    const labelC = points[2].label
    latex += `\n\\tkzText[above=2mm](${xA},0){${labelA}}
    \n\\tkzText[above=2mm](${xB},0){${labelB}}
    \n\\tkzText[above=2mm](${xC},0){${labelC}}
    \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xA},0)
    \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xB},0)
    \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xC},0)`
  }
  latex += '\n\\end{tikzpicture}'

  return { figure, latex }
}

export default PlacerPointsAbscissesFractionnaires
