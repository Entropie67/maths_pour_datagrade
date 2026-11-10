import { cercleTrigo } from '../../../lib/2d/cercleTrigo'
import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    angleTex,
    baseSolutionsForExactTrigValue,
    exactSquaredTrigoValuesByFunction,
    exactTrigoValuesByFunction,
    sameTrigoAngleSet,
    solutionsForExactTrigRoots,
    solveLinearTrigoEquation,
    texIntegerProductWithExactTrigoValue,
    texLinearTrigoArgument,
    texPiFraction,
    texTrigoFunction,
    uniqueSortedTrigoAngles,
    type ExactTrigoValue,
    type LinearTrigoArgument,
    type TrigoFunctionName,
} from '../../../lib/mathFonctions/trigo'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type FractionEtendue from '../../../modules/FractionEtendue'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre une équation trigonométrique dans $[0;2\\pi[$'
export const interactifReady = true

export const dateDePublication = '08/05/2026'
export const uuid = 'a7c64'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-6'],
}

type ExactValue = ExactTrigoValue

type SquaredExactValue = {
  key?: string
  tex: string
  roots: ExactValue[]
}

type LinearArgument = LinearTrigoArgument

type DirectQuestion = {
  kind: 'direct'
  fn: TrigoFunctionName
  value: ExactValue
  argument: LinearArgument
  solutions: FractionEtendue[]
}

type SquareQuestion = {
  kind: 'square'
  fn: TrigoFunctionName
  squaredValue: SquaredExactValue
  solutions: FractionEtendue[]
}

type ScaledQuestion = {
  kind: 'scaled'
  fn: TrigoFunctionName
  value: ExactValue
  argument: LinearArgument
  coefficient: number
  solutions: FractionEtendue[]
}

type TrigoEquationQuestion = DirectQuestion | SquareQuestion | ScaledQuestion

const zeroPhase = () => fraction(0, 1)
const referenceColors = ['#216D9A', '#4D8613', '#8B5CF6', '#D43D0E']
const keyboardWithPi = KeyboardType.clavierEnsembleAvecPi

const directValuesByFunction = exactTrigoValuesByFunction
const squaredValuesByFunction = exactSquaredTrigoValuesByFunction

const phaseChoices = [
  fraction(1, 6),
  fraction(1, 4),
  fraction(1, 3),
  fraction(1, 2),
  fraction(2, 3),
  fraction(-1, 6),
  fraction(-1, 4),
  fraction(-1, 3),
]

function texLinearArgument(argument: LinearArgument) {
  return texLinearTrigoArgument(argument)
}

function renderCircle(points: FractionEtendue[], color?: string) {
  const usefulPoints = uniqueSortedTrigoAngles(points)
  return mathalea2d(
    {
      xmin: -3.6,
      ymin: -3.7,
      xmax: 3.6,
      ymax: 3.7,
      pixelsParCm: 90,
      scale: 1,
      display: 'block',
    },
    cercleTrigo({
      radius: 2,
      showCoordinates: false,
      showBasePoints: false,
      guideAngles: usefulPoints,
      labelAngles: usefulPoints,
      markedPoints: usefulPoints.map((point, index) => ({
        angle: point,
        color: color ?? referenceColors[index % referenceColors.length],
      })),
    }),
  )
}

function renderFullReferenceCircle(points: FractionEtendue[]) {
  const usefulPoints = uniqueSortedTrigoAngles(points)
  return mathalea2d(
    {
      xmin: -3.6,
      ymin: -3.7,
      xmax: 3.6,
      ymax: 3.7,
      pixelsParCm: 90,
      scale: 1,
      display: 'block',
    },
    cercleTrigo({
      radius: 2,
      showCoordinates: true,
      markedPoints: usefulPoints.map((point, index) => ({
        angle: point,
        color: referenceColors[index % referenceColors.length],
      })),
    }),
  )
}

function renderReferenceCircle(points: FractionEtendue[]) {
  return renderCircle(uniqueSortedTrigoAngles(points))
}

function renderFinalCircle(points: FractionEtendue[]) {
  return renderCircle(uniqueSortedTrigoAngles(points), orangeMathalea)
}

function texPeriodTerm(period: FractionEtendue) {
  const simplified = period.simplifie()
  if (simplified.num === simplified.den) return 'n\\pi'
  if (simplified.den === 1) return `${simplified.num}n\\pi`
  if (simplified.num === 1) return `\\dfrac{n\\pi}{${simplified.den}}`
  return `\\dfrac{${simplified.num}n\\pi}{${simplified.den}}`
}

function texLinearSolutionFormula(
  constant: FractionEtendue,
  period: FractionEtendue,
) {
  const simplifiedConstant = constant.simplifie()
  const periodTerm = texPeriodTerm(period)
  if (simplifiedConstant.num === 0) return periodTerm
  return `${texPiFraction(simplifiedConstant)}+${periodTerm}`
}

function rawSolutionForInteger(
  baseSolution: FractionEtendue,
  argument: LinearArgument,
  n: number,
) {
  const shiftedAngle = baseSolution
    .sommeFraction(fraction(2 * n, 1))
    .differenceFraction(argument.phase)
  return shiftedAngle
    .diviseFraction(fraction(argument.coefficient, 1))
    .simplifie()
}

function isInZeroTwoPiInterval(solution: FractionEtendue) {
  const simplified = solution.simplifie()
  return simplified.num >= 0 && simplified.num < 2 * simplified.den
}

function integersGivingSolutions(
  baseSolution: FractionEtendue,
  argument: LinearArgument,
) {
  const candidates: Array<{ n: number; solution: FractionEtendue }> = []
  for (let n = -2; n <= argument.coefficient + 2; n++) {
    const solution = rawSolutionForInteger(baseSolution, argument, n)
    if (isInZeroTwoPiInterval(solution)) {
      candidates.push({ n, solution })
    }
  }
  return candidates
}

function texIntegerValues(values: number[]) {
  return `$n=${values.join(',')}$`
}

function texLinearSolutionEvaluation(
  constant: FractionEtendue,
  period: FractionEtendue,
  n: number,
) {
  const result = constant.sommeFraction(period.produitFraction(n)).simplifie()
  const nTerm = period.produitFraction(n).simplifie()
  if (n === 0) {
    return `x=${texPiFraction(constant)}+${texPiFraction(period)}\\cdot 0=${angleTex(result)}`
  }
  const termeAjoute =
    nTerm.s < 0
      ? `-${texPiFraction(nTerm.oppose())}`
      : `+${texPiFraction(nTerm)}`
  return `x=${texPiFraction(constant)}+${texPiFraction(period)}\\cdot ${n < 0 ? `(${n})` : n}=${texPiFraction(constant)}${termeAjoute}=${angleTex(result)}`
}

function baseSolutionsForValue(fn: TrigoFunctionName, value: ExactValue) {
  return baseSolutionsForExactTrigValue(fn, value)
}

function solutionsForValue(
  fn: TrigoFunctionName,
  value: ExactValue,
  argument: LinearArgument,
) {
  return solveLinearTrigoEquation(fn, value, argument)
}

function solutionsForRoots(fn: TrigoFunctionName, roots: ExactValue[]) {
  return solutionsForExactTrigRoots(fn, roots)
}

function texSolutionSet(solutions: FractionEtendue[]) {
  return `\\{${solutions.map((solution) => angleTex(solution)).join(';')}\\}`
}

function texSolutionList(solutions: FractionEtendue[]) {
  return solutions.map((solution) => angleTex(solution)).join('\\,;\\,')
}

function detailedLinearResolution(
  fn: TrigoFunctionName,
  value: ExactValue,
  argument: LinearArgument,
) {
  const argumentTex = texLinearArgument(argument)
  const baseSolutions = baseSolutionsForValue(fn, value)
  const period = fraction(2, argument.coefficient).simplifie()

  return baseSolutions
    .map((baseSolution, index) => {
      const constant = baseSolution
        .differenceFraction(argument.phase)
        .diviseFraction(fraction(argument.coefficient, 1))
        .simplifie()
      const integerCandidates = integersGivingSolutions(baseSolution, argument)
      const integerDetails = integerCandidates
        .map(
          ({ n, solution }) =>
            `$n=${n}$ : $${texLinearSolutionEvaluation(constant, period, n)}$`,
        )
        .join('<br>')

      return [
        `<strong>Cas $${index + 1}$</strong> : $X=${angleTex(baseSolution)}+2n\\pi$, avec $n\\in\\mathbb{Z}$.`,
        `Donc $${argumentTex}=${angleTex(baseSolution)}+2n\\pi$, d'où $x=${texLinearSolutionFormula(constant, period)}$.`,
        `Comme $x$ doit appartenir à $[0;2\\pi[$, les seules valeurs utiles ici sont ${texIntegerValues(integerCandidates.map(({ n }) => n))}.`,
        `Dans $[0;2\\pi[$ :<br>${integerDetails}.`,
      ].join('<br>')
    })
    .join('<br><br>')
}

function chooseFunction(functionType: number): TrigoFunctionName {
  if (functionType === 1) return 'sin'
  if (functionType === 2) return 'cos'
  if (functionType === 3) return 'tan'
  return choice(['sin', 'cos', 'tan'] as const)
}

function buildQuestion(
  type: number,
  functionType: number,
): TrigoEquationQuestion {
  const fn = chooseFunction(functionType)

  if (type === 2) {
    const squaredValue = choice(squaredValuesByFunction[fn])
    return {
      kind: 'square',
      fn,
      squaredValue,
      solutions: solutionsForRoots(fn, squaredValue.roots),
    }
  }

  const value = choice(directValuesByFunction[fn])

  if (type === 3) {
    const argument = {
      coefficient: choice([2, 3, 4]),
      phase: zeroPhase(),
    }
    return {
      kind: 'direct',
      fn,
      value,
      argument,
      solutions: solutionsForValue(fn, value, argument),
    }
  }

  if (type === 4) {
    const argument = {
      coefficient: choice([1, 2, 3]),
      phase: zeroPhase(),
    }
    return {
      kind: 'scaled',
      fn,
      value,
      argument,
      coefficient: choice([2, 3, 4]),
      solutions: solutionsForValue(fn, value, argument),
    }
  }

  if (type === 5) {
    const argument = {
      coefficient: choice([1, 2, 3]),
      phase: choice(phaseChoices),
    }
    return {
      kind: 'scaled',
      fn,
      value,
      argument,
      coefficient: choice([2, 3, 4]),
      solutions: solutionsForValue(fn, value, argument),
    }
  }

  const argument = {
    coefficient: 1,
    phase: zeroPhase(),
  }
  return {
    kind: 'direct',
    fn,
    value,
    argument,
    solutions: solutionsForValue(fn, value, argument),
  }
}

function texReducedEquation(question: DirectQuestion | ScaledQuestion) {
  return `${texTrigoFunction(question.fn)}(${texLinearArgument(question.argument)})=${question.value.tex}`
}

function texEquation(question: TrigoEquationQuestion) {
  if (question.kind === 'square') {
    return `${texTrigoFunction(question.fn)}^2(x)=${question.squaredValue.tex}`
  }

  const reducedEquation = texReducedEquation(question)
  if (question.kind === 'direct') return reducedEquation

  return `${question.coefficient}${texTrigoFunction(question.fn)}(${texLinearArgument(question.argument)})=${texIntegerProductWithExactTrigoValue(question.coefficient, question.value)}`
}

function correctionDetails(question: TrigoEquationQuestion) {
  if (question.kind === 'square') {
    const referenceSolutions = solutionsForRoots(
      question.fn,
      question.squaredValue.roots,
    )
    const finalCircleStep = sameTrigoAngleSet(
      referenceSolutions,
      question.solutions,
    )
      ? []
      : [
          'Le cercle suivant donne les solutions finales en orange.',
          renderFinalCircle(question.solutions),
        ]
    const rootEquations = question.squaredValue.roots
      .map((root) => `$${texTrigoFunction(question.fn)}(x)=${root.tex}$`)
      .join(' ou ')
    const details = question.squaredValue.roots
      .map((root) => {
        const solutions = baseSolutionsForValue(question.fn, root)
        return [
          `Dans $[0;2\\pi[$, pour $${texTrigoFunction(question.fn)}(x)=${root.tex}$, on lit sur le cercle :`,
          `$x=${texSolutionList(solutions)}$.`,
        ].join('<br>')
      })
      .join('<br>')

    return [
      `$${texEquation(question)}$ équivaut à ${rootEquations}.`,
      'On lit sur le cercle trigonométrique complet les angles qui vérifient ces équations.',
      renderFullReferenceCircle(referenceSolutions),
      details,
      'On garde ensuite seulement les angles utiles.',
      renderReferenceCircle(referenceSolutions),
      `On regroupe toutes les solutions obtenues dans $[0;2\\pi[$.`,
      ...finalCircleStep,
      '',
    ].join('<br>')
  }

  const lines: string[] = []
  if (question.kind === 'scaled') {
    lines.push(
      `On divise les deux membres par $${question.coefficient}$ : $${texReducedEquation(question)}$.`,
    )
  }

  const argumentTex = texLinearArgument(question.argument)
  const baseSolutionAngles = baseSolutionsForValue(question.fn, question.value)
  const baseSolutions = texSolutionList(baseSolutionAngles)
  lines.push(
    `Dans $[0;2\\pi[$, on lit sur le cercle trigonométrique que les angles $X$ tels que $${texTrigoFunction(question.fn)}(X)=${question.value.tex}$ sont $X=${baseSolutions}$.`,
  )
  lines.push('On lit ces angles sur le cercle trigonométrique complet.')
  lines.push(renderFullReferenceCircle(baseSolutionAngles))
  lines.push('On garde ensuite seulement les angles utiles.')
  lines.push(renderReferenceCircle(baseSolutionAngles))

  if (
    question.argument.coefficient === 1 &&
    question.argument.phase.num === 0
  ) {
    lines.push(
      `Sur le cercle trigonométrique, on lit directement $x=${texSolutionList(question.solutions)}$ dans $[0;2\\pi[$.`,
    )
  } else {
    lines.push(
      `On résout donc $${argumentTex}=X+2n\\pi$, avec $n\\in\\mathbb{Z}$.`,
    )
    lines.push(
      detailedLinearResolution(question.fn, question.value, question.argument),
    )
    lines.push(
      `On rassemble les valeurs retenues : $x=${texSolutionList(question.solutions)}$.`,
    )
  }
  if (!sameTrigoAngleSet(baseSolutionAngles, question.solutions)) {
    lines.push('<br>')
    lines.push('Le cercle suivant donne les solutions finales en orange.')
    lines.push(renderFinalCircle(question.solutions))
  }

  return `${lines.join('<br>')}<br>`
}

/**
 * Résoudre une équation trigonométrique dans $[0;2\pi[$.
 * @author Nathan Scheinmann
 */
export default class ResoudreEquationTrigoDansIntervalle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbCols = 1
    this.nbColsCorr = 1
    this.spacing = 2
    this.sup = '6'
    this.sup2 = true
    this.sup3 = '4'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Équations $f(x)=a$',
        '2 : Équations $f(x)^2=a$',
        '3 : Équations $f(kx)=a$',
        '4 : Équations $m f(ax)=m\\cdot c$',
        '5 : Équations $m f(ax+b)=m\\cdot c$',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      'Proposer la forme de réponse $S=\\{\\ldots\\}$',
      true,
    ]
    this.besoinFormulaire3Texte = [
      'Fonction trigonométrique',
      [
        'Nombres séparés par des tirets :',
        '1 : sinus',
        '2 : cosinus',
        '3 : tangente',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre l'équation suivante dans $[0;2\\pi[$."
        : 'Résoudre les équations suivantes dans $[0;2\\pi[$.'
    this.consigne += this.sup2
      ? ' Donner la réponse sous la forme $S=\\{\\ldots\\}$.'
      : " Donner l'ensemble des solutions."

    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 5,
        melange: 6,
        defaut: 6,
        nbQuestions: this.nbQuestions,
      }),
      this.nbQuestions,
    )
    const functionTypes = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup3,
        min: 1,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
      }),
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const question = buildQuestion(Number(types[i]), Number(functionTypes[i]))
      const equation = texEquation(question)
      const expectedAnswer = texSolutionSet(question.solutions)
      let texte = `$${equation}$`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, keyboardWithPi, {
          texteAvant: '<br>$S=$ ',
        })
        handleAnswers(this, i, {
          reponse: {
            value: expectedAnswer,
            options: { ensembleDeNombres: true },
          },
        })
      }

      const texteCorr =
        correctionDetails(question) +
        `L'ensemble des solutions est donc $S=${miseEnEvidence(expectedAnswer)}$.`

      if (this.questionJamaisPosee(i, equation, this.sup2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
