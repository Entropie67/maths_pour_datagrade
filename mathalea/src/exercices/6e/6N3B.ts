import Figure from 'apigeom'
import { distance } from 'apigeom/src/elements/calculus/Coords'
import GraduatedLine from 'apigeom/src/elements/grid/GraduatedLine'
import type { MathfieldElement } from 'mathlive'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import {
  lettreIndiceeDepuisChiffre,
  numAlpha,
} from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const dateDePublication = '08/07/2025'
export const titre = "Donner du sens à la définition d'un quotient"
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'

/** Donner du sens à la définition d'un quotient
 * @author Éric Elter
 */
export const uuid = '42fbx'

export const refs = {
  'fr-fr': ['6N3B'],
  'fr-2016': ['6N23-5a'],
  'fr-ch': ['9R1NO4C-1', '9R2NO4C-1', '9R3NO4C-1'],
}

type GoodAnswerItem = { label: string; x: number }

export default class DonnerSensDefinitionQuotient extends Exercice {
  goodAnswerQa!: [GoodAnswerItem, GoodAnswerItem][]
  goodAnswerQb!: number[]
  goodAnswerQc!: number[]

  constructor() {
    super()

    this.nbQuestions = 2
    this.exoCustomResultat = true
    this.besoinFormulaireNumerique = [
      'Solution finale',
      3,
      '1 : Phrase\n2 : Égalité mathématique\n3 : Les deux',
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.goodAnswerQa = []
    this.goodAnswerQb = []
    this.goodAnswerQc = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const den = randint(2, 7)
      const num = randint(2, den * 2 - 1, [den])

      const label1 = lettreIndiceeDepuisChiffre(i * 3 + 1)
      const label2 = lettreIndiceeDepuisChiffre(i * 3 + 2)

      this.goodAnswerQa[i] = [
        { label: label1, x: arrondi(num / den, 4) },
        { label: label2, x: num },
      ]
      this.goodAnswerQb[i] = den
      this.goodAnswerQc[i] = num

      const fractionUtile = new FractionEtendue(num, den).texFraction
      const xMax = num + randint(0, 2)
      const { figure, latex } = apigeomGraduatedLine({
        xMin: 0,
        xMax,
        scale: xMax < 9 ? 1 : 0.5,
        stepBis: 1 / den,
        snapGrid: true,
      })
      figure.options.labelAutomaticForPoints = true
      figure.options.labelAutomaticBeginsWith = label1
      figure.options.pointDescriptionWithCoordinates = false
      this.figuresApiGeom[i] = figure
      const { figure: figureCorr, latex: latexCorr } = apigeomGraduatedLine({
        xMin: 0,
        xMax,
        scale: xMax < 9 ? 1 : 0.5,
        stepBis: 1 / den,
        points: this.goodAnswerQa[i],
        snapGrid: false,
      })
      figureCorr.create('Point', {
        label: label1,
        x: arrondi(num / den, 4),
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        shape: 'x',
        labelDxInPixels: 0,
      })
      figureCorr.create('Point', {
        label: `{\\boldsymbol{${fractionUtile}}}`,
        x: arrondi(num / den, 4),
        y: -1.35,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
        shape: '',
      })

      let A, B, C, longueurAC
      const { figure: figureCorr2, latex: latexCorr2 } = apigeomGraduatedLine({
        xMin: 0,
        xMax,
        scale: xMax < 9 ? 1 : 0.5,
        stepBis: 1 / den,
        snapGrid: false,
        height: 160,
      })
      figureCorr2.create('Point', {
        label: label1,
        x: arrondi(num / den, 4),
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        shape: 'x',
        labelDxInPixels: 0,
      })
      figureCorr2.create('Point', {
        label: label2,
        x: num,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
      })
      figureCorr2.create('Point', {
        label: `{\\boldsymbol{${fractionUtile}}}`,
        x: arrondi(num / den, 4),
        y: -1.35,
        color: orangeMathalea,
        colorLabel: orangeMathalea,
        labelDxInPixels: 0,
        shape: '',
      })
      for (let bond = 0; bond < den; bond++) {
        A = figureCorr2.create('Point', {
          isVisible: false,
          label: 'A',
          x: ((bond + 1) * num) / den,
          y: 1,
          color: orangeMathalea,
          colorLabel: orangeMathalea,
          labelDxInPixels: 0,
        })
        B = figureCorr2.create('Point', {
          isVisible: false,
          label: 'B',
          x: (bond * num) / den,
          y: 1,
          color: orangeMathalea,
          colorLabel: orangeMathalea,
          labelDxInPixels: 0,
        })
        C = figureCorr2.create('Point', {
          isVisible: false,
          label: 'C',
          x: (bond * num) / den + num / (2 * den),
          y: 0.5,
          color: orangeMathalea,
          colorLabel: orangeMathalea,
          labelDxInPixels: 0,
        })
        // longueurAC = figureCorr2.create('Distance', { point1: A, point2: C }).value
        longueurAC = distance(A, C)
        // longueurAC = Math.sqrt((C.x - A.x) ^ 2 + (C.y - A.y) ^ 2)
        figureCorr2.create('ArcBy3PointsAndRadius', {
          center: C,
          start: A,
          end: B,
          radius: longueurAC,
          addBorders: false,
          color: orangeMathalea,
        })
        figureCorr2.create('Point', {
          label: `{\\boldsymbol{${bond + 1}}}`,
          x: C.x,
          y: C.y + longueurAC,
          labelDxInPixels: 0,
          shape: '',
          color: orangeMathalea,
          colorLabel: orangeMathalea,
        })
        if (bond !== 0)
          figureCorr2.create('Point', {
            label: '',
            x: (bond * num) / den,
            y: 0,
            color: orangeMathalea,
            labelDxInPixels: 0,
          })
      }

      const texteCorr1 = this.correctionDetaillee
        ? `Entre $0$ et $1$, il y a $${den}$ intervalles de taille identique. Le point $${label1}$, repéré par $${fractionUtile}$ est donc placé après le $${num}^{e}$ intervalle.<br>`
        : ''
      const texteCorr2 = this.correctionDetaillee
        ? `Pour placer le point $${label2}$, il suffit de reporter $${den}$ fois la longueur entre $0$ et $${label1}$ à partir de $0$.<br>`
        : ''
      switch (true) {
        case context.isHtml && this.interactif:
          texte = figureApigeom({
            exercice: this as Exercice,
            i,
            idAddendum: refs['fr-fr'][0],
            figure,
            defaultAction: 'POINT',
          })
          texteCorr +=
            numAlpha(0) +
            texteCorr1 +
            wrapperApigeomToMathalea(figureCorr) +
            numAlpha(1) +
            texteCorr2 +
            wrapperApigeomToMathalea(figureCorr2)
          break
        case context.isHtml:
          texte = wrapperApigeomToMathalea(figure)
          texteCorr +=
            numAlpha(0) +
            texteCorr1 +
            wrapperApigeomToMathalea(figureCorr) +
            numAlpha(1) +
            texteCorr2 +
            wrapperApigeomToMathalea(figureCorr2)
          break
        default:
          texte = latex
          texteCorr +=
            numAlpha(0) +
            texteCorr1 +
            latexCorr +
            numAlpha(1) +
            texteCorr2 +
            latexCorr2
          break
      }

      texte +=
        '<br>' +
        numAlpha(0) +
        `Placer le point $${label1}$, sur cette droite graduée, repéré par le nombre $${fractionUtile}$.<br>`
      texte +=
        numAlpha(1) +
        `Reporter, sur cette même droite graduée, $${den}$ fois le nombre $${fractionUtile}$ et y placer le point $${label2}$.<br>`
      texte += numAlpha(2) + 'Compléter alors la phrase suivante : <br>'
      texte += `On constate que le quotient $${fractionUtile}$  est le nombre qui, multiplié par`
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            2 * i + 100,
            KeyboardType.clavierNumbers,
          )
        : '$\\ldots$'
      texte += ' donne '
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            2 * i + 100 + 1,
            KeyboardType.clavierNumbers,
          ) + '.'
        : '$\\ldots$'

      texteCorr +=
        this.sup !== 2
          ? numAlpha(2) +
            `On constate que le quotient $${fractionUtile}$  est le nombre qui, multiplié par $${miseEnEvidence(den)}$ donne  $${miseEnEvidence(num)}$`
          : numAlpha(2) +
            `On constate que  $${fractionUtile}\\times${miseEnEvidence(den)}=${miseEnEvidence(num)}$`

      if (this.sup !== 1 && this.sup !== 2) {
        texteCorr += ` et donc que $${fractionUtile}\\times${miseEnEvidence(den)}=${miseEnEvidence(num)}$`
      }

      texteCorr += '.'

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
      if (this.questionJamaisPosee(i, num, den)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined) return ['KO']
    // Sauvegarde de la réponse pour Capytale
    if (this.answers == null) this.answers = {}
    if (this == null) return ['KO']
    if (this.figuresApiGeom == null) return ['KO']
    const result: ('OK' | 'KO')[] = []

    this.answers[this.figuresApiGeom[i].id] = figureAnswerJson(this.figuresApiGeom[i])
    const figure = this.figuresApiGeom[i]
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const goodAnswerQa = this.goodAnswerQa[i]
    const goodAnswerQb = this.goodAnswerQb[i]
    const goodAnswerQc = this.goodAnswerQc[i]

    for (let j = 0; j < goodAnswerQa.length; j++) {
      const label = goodAnswerQa[j].label
      const x = goodAnswerQa[j].x
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

    // Champ réponse : Son nom est en dur, ne rien changer
    let mf = document.querySelector(
      `math-field#champTexteEx${this.numeroExercice}Q${2 * i + 100}`,
    ) as MathfieldElement

    // Sauvegarde de la réponse pour Capytale
    this.answers[`Ex${this.numeroExercice}Q${2 * i + 100}`] = mf.getValue()

    // Saisie fournie par l'utilisateur qu'on va comparer éventuellement avec la réponse attendue.
    const saisie1 = mf.value

    result.push(
      fonctionComparaison(saisie1, goodAnswerQb.toString()).isOk ? 'OK' : 'KO',
    )
    // Champ réponse : Son nom est en dur, ne rien changer
    mf = document.querySelector(
      `math-field#champTexteEx${this.numeroExercice}Q${2 * i + 100 + 1}`,
    ) as MathfieldElement

    // Sauvegarde de la réponse pour Capytale
    this.answers[`Ex${this.numeroExercice}Q${2 * i + 100 + 1}`] = mf.getValue()

    // Saisie fournie par l'utilisateur qu'on va comparer éventuellement avec la réponse attendue.
    const saisie2 = mf.value

    result.push(
      fonctionComparaison(saisie2, goodAnswerQc.toString()).isOk ? 'OK' : 'KO',
    )

    const divFeedback1 = document.querySelector(
      `#feedback${`Ex${this.numeroExercice}Q${i}`}`,
    )

    if (divFeedback1 != null) {
      if (result[0] === 'OK' && result[1] === 'OK') {
        divFeedback1.innerHTML = '😎'
      } else {
        const p = document.createElement('p')
        p.innerText = '☹️'
        divFeedback1.insertBefore(p, divFeedback1.firstChild)
      }
    }

    const spanResultat2 = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${2 * i + 100}`,
    )
    if (spanResultat2 != null) {
      if (result[2] === 'OK') {
        spanResultat2.innerHTML = '😎'
      } else {
        spanResultat2.innerHTML = '☹️'
      }
    }

    const spanResultat3 = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${2 * i + 100 + 1}`,
    )
    if (spanResultat3 != null) {
      if (result[3] === 'OK') {
        spanResultat3.innerHTML = '😎'
      } else {
        spanResultat3.innerHTML = '☹️'
      }
    }

    return result
  }
}

function apigeomGraduatedLine({
  xMin,
  xMax,
  scale = 1,
  points,
  step = 1,
  stepBis = 0.25,
  snapGrid = true,
  height = 80,
}: {
  xMin: number
  xMax: number
  scale?: number
  step?: number
  stepBis?: number
  snapGrid?: boolean
  height?: number
  points?: Array<{ x: number; label: string }>
}): { figure: Figure; latex: string } {
  const width = 750
  const figure = new Figure({
    xMin: xMin - 0.2 / scale,
    yMin: -1.5,
    width,
    height,
    dy: 10,
    dx: stepBis,
    xScale: 3 * scale,
    snapGrid,
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
    const labelA = points[0].label
    const labelB = points[1].label
    latex += `\n\\tkzText[above=2mm](${xA},0){${labelA}}
    \n\\tkzText[above=2mm](${xB},0){${labelB}}
    \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xA},0)
    \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xB},0)`
  }
  latex += '\n\\end{tikzpicture}'

  return { figure, latex }
}
