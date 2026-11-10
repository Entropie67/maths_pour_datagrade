import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import type { LimitValue } from '../../../lib/mathFonctions/lectureLimitesGraphiques'
import {
    answerKeyboard,
    commonRepere,
    horizontalGapForSlope,
    notExists,
    pgfCurve,
    pointMark,
    randomPointValue,
    renderGraph,
    texLimit,
    verticalAsymptote,
} from '../../../lib/mathFonctions/lectureLimitesGraphiques'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Lire une limite à partir d'un graphique"
export const dateDePublication = '04/06/2026'
export const interactifReady = true

export const uuid = '34de8'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mLimCont-2'],
}

type QuestionType = 'limitesFinies' | 'limiteInfinie'

type GraphQuestion = {
  graph: string
  a: number
  fa: LimitValue
  left: LimitValue
  right: LimitValue
  twoSided: LimitValue
}

function finiteOrNot(left: number, right: number): LimitValue {
  return left === right ? String(left) : notExists
}

function randomFiniteGraph(): GraphQuestion {
  const a = randint(-1, 2)
  const isJump = randint(0, 1) === 1
  const leftLimit = randint(0, 5)
  const rightLimit = isJump ? randint(0, 5, leftLimit) : leftLimit
  const fa = randomPointValue(leftLimit, rightLimit, -1, 6)
  const leftSlope = leftLimit === 0 ? randint(-1, 1, 0) : randint(-1, 1)
  const rightSlope = rightLimit === 0 ? randint(-1, 1, 0) : randint(-1, 1)
  const yValues = [
    leftLimit,
    rightLimit,
    fa === notExists ? leftLimit : Number(fa),
  ]
  const yMin = Math.min(-1, ...yValues) - 1
  const yMax = Math.max(5, ...yValues) + 1
  const r = commonRepere({ xMin: a - 3, xMax: a + 3, yMin, yMax })
  const leftTouchesValue = fa === String(leftLimit)
  const rightTouchesValue = fa === String(rightLimit)
  const leftGap = horizontalGapForSlope(leftSlope)
  const rightGap = horizontalGapForSlope(rightSlope)
  const left = pgfCurve(
    (x) => leftLimit + leftSlope * (x - a),
    r,
    a - 3,
    leftTouchesValue ? a : a - leftGap,
    reduireAxPlusB(leftSlope, leftLimit - leftSlope * a),
  )
  const right = pgfCurve(
    (x) => rightLimit + rightSlope * (x - a),
    r,
    rightTouchesValue ? a : a + rightGap,
    a + 3,
    reduireAxPlusB(rightSlope, rightLimit - rightSlope * a),
  )
  const marks = []
  if (fa !== String(leftLimit)) marks.push(pointMark(a, leftLimit, false))
  if (rightLimit !== leftLimit && fa !== String(rightLimit)) {
    marks.push(pointMark(a, rightLimit, false))
  }
  if (fa !== notExists) marks.push(pointMark(a, Number(fa), true))
  return {
    graph: renderGraph(r, [left, right, ...marks]),
    a,
    fa,
    left: String(leftLimit),
    right: String(rightLimit),
    twoSided: finiteOrNot(leftLimit, rightLimit),
  }
}

function infiniteBranchLatex(a: number, sign: 1 | -1, side: 'left' | 'right') {
  if (side === 'left') {
    return sign === 1 ? `1/(${a}-x)` : `-1/(${a}-x)`
  }
  return sign === 1 ? `1/(x-${a})` : `-1/(x-${a})`
}

function randomInfiniteGraph(): GraphQuestion {
  const a = randint(0, 3)
  const leftSign: 1 | -1 = randint(0, 1) === 0 ? 1 : -1
  const sameSign = randint(0, 1) === 1
  const rightSign: 1 | -1 = sameSign ? leftSign : leftSign === 1 ? -1 : 1
  const r = commonRepere({ xMin: a - 3, xMax: a + 3, yMin: -6, yMax: 6 })
  const left = pgfCurve(
    (x) => leftSign / (a - x),
    r,
    a - 3,
    a - 0.12,
    infiniteBranchLatex(a, leftSign, 'left'),
  )
  const right = pgfCurve(
    (x) => rightSign / (x - a),
    r,
    a + 0.12,
    a + 3,
    infiniteBranchLatex(a, rightSign, 'right'),
  )
  const leftLimit = leftSign === 1 ? '+\\infty' : '-\\infty'
  const rightLimit = rightSign === 1 ? '+\\infty' : '-\\infty'
  return {
    graph: renderGraph(r, [left, right, verticalAsymptote(a)]),
    a,
    fa: notExists,
    left: leftLimit,
    right: rightLimit,
    twoSided: leftLimit === rightLimit ? leftLimit : notExists,
  }
}

function localBehaviorFields(
  exercice: Exercice,
  question: number,
  data: GraphQuestion,
) {
  handleAnswers(exercice, question, {
    champ1: { value: data.fa, options: { texteAvecCasse: true } },
    champ2: { value: data.left, options: { texteAvecCasse: true } },
    champ3: { value: data.right, options: { texteAvecCasse: true } },
    champ4: { value: data.twoSided, options: { texteAvecCasse: true } },
  })
  return remplisLesBlancs(
    exercice,
    question,
    `f(${data.a})=%{champ1}\\quad ;\\quad \\lim\\limits_{x\\to ${data.a}^-} f(x)=%{champ2}\\quad ;\\quad \\lim\\limits_{x\\to ${data.a}^+} f(x)=%{champ3}\\quad ;\\quad \\lim\\limits_{x\\to ${data.a}} f(x)=%{champ4}`,
    answerKeyboard,
  )
}

/**
 * Lire des limites finies ou infinies à partir d'un graphique.
 * @author Nathan Scheinmann
 */
export default class LireLimiteGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Limites finies à gauche et à droite',
        '2 : Limite infinie',
        '3 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    this.consigne =
      "Utiliser le graphique pour lire les informations demandées. Si la fonction n'est pas définie ou si la limite n'existe pas, saisir $\\not\\exists$."

    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['limitesFinies', 'limiteInfinie'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }) as QuestionType[]
    const listeTypes = combinaisonListes(types, this.nbQuestions)
    const paragraphBreak = context.isHtml ? '<br>' : '\n\n'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = listeTypes[i]
      let texte = ''
      let texteCorr = ''
      let signature: string = type

      if (type === 'limitesFinies') {
        const data = randomFiniteGraph()
        signature = `${type}-${data.a}-${data.fa}-${data.left}-${data.right}-${data.twoSided}`
        texte =
          `Le graphique ci-dessous représente une fonction $f$. Déterminer $f(${data.a})$, $\\lim\\limits_{x\\to ${data.a}^-} f(x)$, $\\lim\\limits_{x\\to ${data.a}^+} f(x)$ puis $\\lim\\limits_{x\\to ${data.a}} f(x)$.${paragraphBreak}` +
          data.graph +
          `${paragraphBreak}${localBehaviorFields(this, i, data)}`
        texteCorr =
          `On lit sur le graphique : $f(${data.a})=${miseEnEvidence(texLimit(data.fa))}$, ` +
          `$\\lim\\limits_{x\\to ${data.a}^-} f(x)=${miseEnEvidence(texLimit(data.left))}$ et ` +
          `$\\lim\\limits_{x\\to ${data.a}^+} f(x)=${miseEnEvidence(texLimit(data.right))}$.${paragraphBreak}` +
          (data.twoSided === notExists
            ? `Les deux limites à gauche et à droite sont différentes, donc $\\lim\\limits_{x\\to ${data.a}} f(x)=${miseEnEvidence('\\not\\exists')}$.`
            : `Les deux limites à gauche et à droite sont égales, donc $\\lim\\limits_{x\\to ${data.a}} f(x)=${miseEnEvidence(texLimit(data.twoSided))}$.`)
      } else {
        const data = randomInfiniteGraph()
        signature = `${type}-${data.a}-${data.left}-${data.right}-${data.twoSided}`
        texte =
          `Le graphique ci-dessous représente une fonction $f$. Déterminer $f(${data.a})$, $\\lim\\limits_{x\\to ${data.a}^-} f(x)$, $\\lim\\limits_{x\\to ${data.a}^+} f(x)$ puis $\\lim\\limits_{x\\to ${data.a}} f(x)$.${paragraphBreak}` +
          data.graph +
          `${paragraphBreak}${localBehaviorFields(this, i, data)}`
        texteCorr =
          `La droite $x=${data.a}$ est une asymptote verticale. On lit ` +
          `$\\lim\\limits_{x\\to ${data.a}^-} f(x)=${miseEnEvidence(texLimit(data.left))}$ et ` +
          `$\\lim\\limits_{x\\to ${data.a}^+} f(x)=${miseEnEvidence(texLimit(data.right))}$.${paragraphBreak}` +
          (data.twoSided === notExists
            ? `Les deux comportements infinis sont différents, donc $\\lim\\limits_{x\\to ${data.a}} f(x)=${miseEnEvidence('\\not\\exists')}$.`
            : `Ils sont identiques, donc $\\lim\\limits_{x\\to ${data.a}} f(x)=${miseEnEvidence(texLimit(data.twoSided))}$.`)
      }

      if (this.questionJamaisPosee(i, signature)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
