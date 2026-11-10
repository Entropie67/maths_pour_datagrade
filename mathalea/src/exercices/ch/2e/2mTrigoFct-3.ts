import { orangeMathalea } from '../../../lib/colors'
import {
    addTrigoCircleSelection,
    trigoCircleSelectionValue,
} from '../../../lib/customElements/TrigoCircleSelectionElement'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import {
    exactSquaredTrigoValues,
    exactTrigoValues,
    texTrigoFunction,
    TrigoExact,
    type ExactSquaredTrigValueKey,
    type ExactTrigoValueKey,
    type SinCosTrigoFunctionName,
    type TrigoCircleAngle,
} from '../../../lib/mathFonctions/trigo'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Placer les solutions d’une équation trigonométrique sur le cercle'
export const interactifReady = true
export const dateDePublication = '08/05/2026'
export const uuid = 'd9a41'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-3'],
}

type PlacementQuestion =
  | {
      kind: 'direct'
      fn: SinCosTrigoFunctionName
      valueKey: ExactTrigoValueKey
      valueTex: string
      solutions: TrigoCircleAngle[]
    }
  | {
      kind: 'square'
      fn: SinCosTrigoFunctionName
      squaredValueKey: ExactSquaredTrigValueKey
      squaredValueTex: string
      roots: Array<{ key: ExactTrigoValueKey; tex: string }>
      solutions: TrigoCircleAngle[]
    }

type SquaredValueWithKey = {
  key: ExactSquaredTrigValueKey
  tex: string
  roots: Array<{ key: ExactTrigoValueKey; tex: string }>
}

const squaredValues = exactSquaredTrigoValues.filter(
  (value): value is SquaredValueWithKey => value.key != null,
)

const solutionColors = ['#216D9A', '#4D8613', '#8B5CF6', '#D43D0E']

type ColoredSolution = {
  angle: TrigoCircleAngle
  color: string
}

type CorrectionBranch = {
  equation: string
  solutions: ColoredSolution[]
}

function texSolutionList(solutions: TrigoCircleAngle[]) {
  return `\\left\\{${solutions.map((solution) => solution.angleTex).join('\\,;\\,')}\\right\\}`
}

function buildQuestion(type: number): PlacementQuestion {
  const fn = choice(['sin', 'cos'] as const)
  if (type === 2) {
    const value = choice(squaredValues)
    return {
      kind: 'square',
      fn,
      squaredValueKey: value.key,
      squaredValueTex: value.tex,
      roots: value.roots,
      solutions: TrigoExact.solveSquared(fn, value.key),
    }
  }
  const value = choice(exactTrigoValues)
  return {
    kind: 'direct',
    fn,
    valueKey: value.key,
    valueTex: value.tex,
    solutions: TrigoExact.solveExact(fn, value.key),
  }
}

function renderCircleQuestion(exercice: Exercice, questionIndex: number) {
  return addTrigoCircleSelection(exercice, questionIndex, {
    showAngleLabels: true,
    showCoordinateLabels: Boolean(exercice.sup2),
    style: 'display:block; max-width: 46rem;',
    interactivityOn: exercice.interactif,
  })
}

function renderCorrectionCircle(
  exercice: Exercice,
  questionIndex: number,
  branches: CorrectionBranch[],
) {
  return addTrigoCircleSelection(exercice, questionIndex, {
    id: `trigo-circle-selection-correctionEx${exercice.numeroExercice}Q${questionIndex}`,
    showAngleLabels: true,
    showCoordinateLabels: true,
    style: 'display:block; max-width: 46rem;',
    interactivityOn: false,
    markedPoints: branches.flatMap((branch) =>
      branch.solutions.map((solution) => ({
        angle: solution.angle.angleRad,
        color: solution.color,
      })),
    ),
  })
}

function renderFinalAnswerCircle(
  solutions: TrigoCircleAngle[],
  exercice: Exercice,
  questionIndex: number,
) {
  return addTrigoCircleSelection(exercice, questionIndex, {
    id: `trigo-circle-selection-finalEx${exercice.numeroExercice}Q${questionIndex}`,
    showAngleLabels: true,
    showCoordinateLabels: true,
    style: 'display:block; max-width: 46rem;',
    interactivityOn: false,
    markedPoints: solutions.map((solution) => ({
      angle: solution.angleRad,
      color: orangeMathalea,
    })),
  })
}

function texEquation(fn: SinCosTrigoFunctionName, valueTex: string) {
  return `${texTrigoFunction(fn)}(x)=${valueTex}`
}

function colorSolutions(solutions: TrigoCircleAngle[], startIndex = 0) {
  return solutions.map((solution, index) => ({
    angle: solution,
    color: solutionColors[(startIndex + index) % solutionColors.length],
  }))
}

function getCorrectionBranches(
  question: PlacementQuestion,
): CorrectionBranch[] {
  if (question.kind === 'direct') {
    return [
      {
        equation: texEquation(question.fn, question.valueTex),
        solutions: colorSolutions(question.solutions),
      },
    ]
  }
  let colorIndex = 0
  return question.roots.map((root) => {
    const solutions = colorSolutions(
      TrigoExact.solveExact(question.fn, root.key),
      colorIndex,
    )
    colorIndex += solutions.length
    return {
      equation: texEquation(question.fn, root.tex),
      solutions,
    }
  })
}

function renderBranchDetails(branches: CorrectionBranch[]) {
  return branches
    .map((branch) => {
      const plural = branch.solutions.length > 1 ? 'les points' : 'le point'
      const coloredSolutions = branch.solutions
        .map((solution) =>
          miseEnCouleur(`x=${solution.angle.angleTex}`, solution.color),
        )
        .join('\\quad\\text{ou}\\quad ')
      return `Pour $${branch.equation}$, on lit ${plural} du cercle :<br>$${coloredSolutions}$.`
    })
    .join('<br>')
}

function texColoredBranches(branches: CorrectionBranch[]) {
  return branches
    .map((branch) => {
      const colors = [
        ...new Set(branch.solutions.map((solution) => solution.color)),
      ]
      if (colors.length === 1) {
        return `$${miseEnCouleur(branch.equation, colors[0])}$`
      }
      return `$${branch.equation}$`
    })
    .join(' ou ')
}

/**
 * Placement de points sur le cercle trigonométrique pour des équations simples.
 * @author Nathan Scheinmann
 */
export default class PlacerSolutionsEquationTrigoCercle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbCols = 1
    this.nbColsCorr = 1
    this.spacing = 2
    this.sup = '3'
    this.sup2 = false
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Équations $f(x)=a$',
        '2 : Équations $f(x)^2=a$',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      'Afficher les valeurs de cosinus et sinus sur le cercle',
      false,
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Placer sur le cercle trigonométrique les points qui correspondent aux solutions dans $[0;2\\pi[$.'
        : 'Placer sur les cercles trigonométriques les points qui correspondent aux solutions dans $[0;2\\pi[$.'

    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: this.nbQuestions,
      }),
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const question = buildQuestion(Number(types[i]))
      const equation =
        question.kind === 'direct'
          ? `${texTrigoFunction(question.fn)}(x)=${question.valueTex}`
          : `${texTrigoFunction(question.fn)}^2(x)=${question.squaredValueTex}`

      let texte = `Résoudre graphiquement dans $[0;2\\pi[$ l'équation $${equation}$ en plaçant les points correspondants sur le cercle trigonométrique.<br>`

      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: trigoCircleSelectionValue(
              question.solutions.map((solution) => solution.angleRad),
            ),
          },
        },
        { formatInteractif: 'trigo-circle-selection' },
      )
      texte += renderCircleQuestion(this, i)

      const branches = getCorrectionBranches(question)
      let texteCorr = ''
      if (question.kind === 'direct') {
        texteCorr = `On cherche les points du cercle pour lesquels $${branches[0].equation}$.<br>`
      } else {
        texteCorr = `$${texTrigoFunction(question.fn)}^2(x)=${question.squaredValueTex}$ équivaut à `
        texteCorr +=
          branches.length === 1
            ? `$${branches[0].equation}$.<br>`
            : `${texColoredBranches(branches)}.<br>`
      }
      texteCorr += `${renderBranchDetails(branches)}<br>`
      texteCorr += renderCorrectionCircle(this, i, branches)
      texteCorr += `Sur $[0;2\\pi[$, on obtient donc $S=${miseEnEvidence(texSolutionList(question.solutions))}$.<br>`
      texteCorr += renderFinalAnswerCircle(question.solutions, this, i)

      if (this.questionJamaisPosee(i, equation)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
