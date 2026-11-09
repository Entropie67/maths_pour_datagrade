import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
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
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Compléter un tableau de limites à partir d'un graphique"
export const dateDePublication = '04/06/2026'
export const interactifReady = true

export const uuid = '0c3d9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mLimCont-3'],
}

type TableRow = {
  a: string
  fa: LimitValue
  left: LimitValue
  right: LimitValue
  twoSided: LimitValue
  conclusion: string
}

function randomDifferentPair(min = -2, max = 5): [number, number] {
  const first = randint(min, max)
  return [first, randint(min, max, first)]
}

function randomLocalRows(): TableRow[] {
  const holeA = randint(-4, -3)
  const jumpA = randint(holeA + 1, -1)
  const asymptoteA = randint(0, 1)
  const secondJumpA = randint(asymptoteA + 2, 4)
  const holeLimit = randint(1, 4)
  const holeFa = randomPointValue(holeLimit, holeLimit)
  const [jumpLeft, jumpRight] = randomDifferentPair(0, 5)
  const jumpFa = randomPointValue(jumpLeft, jumpRight, -1, 6)
  const leftInf = randint(0, 1) === 0 ? '+\\infty' : '-\\infty'
  const rightInf =
    randint(0, 1) === 0
      ? leftInf
      : leftInf === '+\\infty'
        ? '-\\infty'
        : '+\\infty'
  const [secondLeft, secondRight] = randomDifferentPair(0, 4)
  return [
    {
      a: String(holeA),
      fa: holeFa,
      left: String(holeLimit),
      right: String(holeLimit),
      twoSided: String(holeLimit),
      conclusion:
        holeFa === notExists
          ? "La limite existe mais $f(a)$ n'est pas définie."
          : holeFa === String(holeLimit)
            ? 'La limite existe et elle est égale à $f(a)$.'
            : 'La limite existe mais elle est différente de $f(a)$.',
    },
    {
      a: String(jumpA),
      fa: jumpFa,
      left: String(jumpLeft),
      right: String(jumpRight),
      twoSided: notExists,
      conclusion: 'Les limites à gauche et à droite sont différentes.',
    },
    {
      a: String(asymptoteA),
      fa: randomPointValue(secondLeft, secondRight, -1, 5),
      left: leftInf,
      right: rightInf,
      twoSided: leftInf === rightInf ? leftInf : notExists,
      conclusion: '$x=a$ est une asymptote verticale.',
    },
    {
      a: String(secondJumpA),
      fa: randomPointValue(secondLeft, secondRight, -1, 5),
      left: String(secondLeft),
      right: String(secondRight),
      twoSided: notExists,
      conclusion: 'Les limites à gauche et à droite sont différentes.',
    },
  ]
}

function synthesisGraph(rows: TableRow[]) {
  const r = commonRepere({ xMin: -5, xMax: 5, yMin: -5, yMax: 7 })
  const holeA = Number(rows[0].a)
  const jumpA = Number(rows[1].a)
  const asymptoteA = Number(rows[2].a)
  const secondJumpA = Number(rows[3].a)
  const holeLimit = Number(rows[0].left)
  const jumpLeft = Number(rows[1].left)
  const jumpRight = Number(rows[1].right)
  const leftInfSign = rows[2].left === '+\\infty' ? 1 : -1
  const rightInfSign = rows[2].right === '+\\infty' ? 1 : -1
  const secondLeft = Number(rows[3].left)
  const secondRight = Number(rows[3].right)
  const holeTouchesValue = rows[0].fa === String(holeLimit)
  const jumpTouchesLeft = rows[1].fa === String(jumpLeft)
  const jumpTouchesRight = rows[1].fa === String(jumpRight)
  const secondJumpTouchesLeft = rows[3].fa === String(secondLeft)
  const secondJumpTouchesRight = rows[3].fa === String(secondRight)
  const firstSlope = (jumpLeft - holeLimit) / (jumpA - holeA)
  const firstSlopeGap = horizontalGapForSlope(firstSlope)
  const leftHoleExpression = `${holeLimit}${firstSlope >= 0 ? '+' : ''}${firstSlope}*(${reduireAxPlusB(1, -holeA)})`
  const leftHoleBefore = pgfCurve(
    (x) => holeLimit + firstSlope * (x - holeA),
    r,
    -5,
    holeTouchesValue ? holeA : holeA - firstSlopeGap,
    leftHoleExpression,
  )
  const leftHoleAfter = pgfCurve(
    (x) => holeLimit + firstSlope * (x - holeA),
    r,
    holeTouchesValue ? holeA : holeA + firstSlopeGap,
    jumpTouchesLeft ? jumpA : jumpA - firstSlopeGap,
    leftHoleExpression,
  )
  const jumpMiddleSlopeAtJump = 0.35 + leftInfSign / (asymptoteA - jumpA)
  const jumpMiddleGap = horizontalGapForSlope(jumpMiddleSlopeAtJump)
  const jumpMiddle = pgfCurve(
    (x) =>
      jumpRight +
      0.35 * (x - jumpA) +
      (leftInfSign * (x - jumpA)) / (asymptoteA - x),
    r,
    jumpTouchesRight ? jumpA : jumpA + jumpMiddleGap,
    asymptoteA - 0.1,
    `${jumpRight}+0.35*(${reduireAxPlusB(1, -jumpA)})${leftInfSign === 1 ? '+' : '-'}(${reduireAxPlusB(1, -jumpA)})/(${asymptoteA}-x)`,
  )
  const verticalRightShift =
    secondLeft - rightInfSign / (secondJumpA - asymptoteA)
  const verticalRightSlopeAtSecondJump =
    -rightInfSign / (secondJumpA - asymptoteA) ** 2
  const verticalRightGap = horizontalGapForSlope(verticalRightSlopeAtSecondJump)
  const verticalRight = pgfCurve(
    (x) => rightInfSign / (x - asymptoteA) + verticalRightShift,
    r,
    asymptoteA + 0.1,
    secondJumpTouchesLeft ? secondJumpA : secondJumpA - verticalRightGap,
    `${rightInfSign}/(${reduireAxPlusB(1, -asymptoteA)})${verticalRightShift >= 0 ? '+' : ''}${verticalRightShift}`,
  )
  const secondJump = pgfCurve(
    (x) => 0.5 * (x - secondJumpA) + secondRight,
    r,
    secondJumpTouchesRight
      ? secondJumpA
      : secondJumpA + horizontalGapForSlope(0.5),
    5,
    `0.5*(${reduireAxPlusB(1, -secondJumpA)})+${secondRight}`,
  )
  return renderGraph(
    r,
    [
      leftHoleBefore,
      leftHoleAfter,
      jumpMiddle,
      verticalRight,
      secondJump,
      verticalAsymptote(asymptoteA),
      ...(rows[0].fa === notExists
        ? []
        : [pointMark(holeA, Number(rows[0].fa), true)]),
      ...(rows[0].fa === String(holeLimit)
        ? []
        : [pointMark(holeA, holeLimit, false)]),
      ...(rows[1].fa === notExists
        ? []
        : [pointMark(jumpA, Number(rows[1].fa), true)]),
      ...(rows[1].fa === String(jumpLeft)
        ? []
        : [pointMark(jumpA, jumpLeft, false)]),
      ...(rows[1].fa === String(jumpRight)
        ? []
        : [pointMark(jumpA, jumpRight, false)]),
      ...(rows[2].fa === notExists
        ? []
        : [pointMark(asymptoteA, Number(rows[2].fa), true)]),
      ...(rows[3].fa === notExists
        ? []
        : [pointMark(secondJumpA, Number(rows[3].fa), true)]),
      ...(rows[3].fa === String(secondLeft)
        ? []
        : [pointMark(secondJumpA, secondLeft, false)]),
      ...(rows[3].fa === String(secondRight)
        ? []
        : [pointMark(secondJumpA, secondRight, false)]),
    ],
    0.58,
  )
}

function tableOutput(exercice: Exercice, question: number, rows: TableRow[]) {
  const table = tableauColonneLigne(
    [
      'a',
      'f(a)',
      '\\lim\\limits_{x\\to a^-} f(x)',
      '\\lim\\limits_{x\\to a^+} f(x)',
      '\\lim\\limits_{x\\to a} f(x)',
    ],
    rows.map((row) => row.a),
    rows.flatMap(() => ['', '', '', '']),
    1.35,
    true,
    exercice.numeroExercice ?? 0,
    question,
    exercice.interactif,
    { classes: answerKeyboard },
  )
  const answers: Record<
    string,
    { value: string; options: { texteAvecCasse: true } }
  > = {}
  rows.forEach((row, index) => {
    const line = index + 1
    answers[`L${line}C1`] = {
      value: row.fa,
      options: { texteAvecCasse: true },
    }
    answers[`L${line}C2`] = {
      value: row.left,
      options: { texteAvecCasse: true },
    }
    answers[`L${line}C3`] = {
      value: row.right,
      options: { texteAvecCasse: true },
    }
    answers[`L${line}C4`] = {
      value: row.twoSided,
      options: { texteAvecCasse: true },
    }
  })
  handleAnswers(exercice, question, {
    ...answers,
    bareme: (points: number[]) => {
      const pointsParLigne = rows.map((_, index) => {
        const start = index * 4
        return Math.min(...points.slice(start, start + 4))
      })
      return [
        pointsParLigne.reduce((sum, point) => sum + point, 0),
        rows.length,
      ]
    },
  })
  if (context.isHtml) return table
  return `\\begin{center}
\\arrayrulecolor{black}
${table}
\\arrayrulecolor{couleur_theme}
\\end{center}`
}

function correctionTable(rows: TableRow[]) {
  const answer = (value: LimitValue) => miseEnEvidence(texLimit(value))
  const table = tableauColonneLigne(
    [
      'a',
      'f(a)',
      '\\lim\\limits_{x\\to a^-} f(x)',
      '\\lim\\limits_{x\\to a^+} f(x)',
      '\\lim\\limits_{x\\to a} f(x)',
    ],
    rows.map((row) => row.a),
    rows.flatMap((row) => [
      answer(row.fa),
      answer(row.left),
      answer(row.right),
      answer(row.twoSided),
    ]),
    1.35,
    true,
  )
  const reasoningLines = rows.map(
    (row) => `En $a=${row.a}$ : ${row.conclusion}`,
  )
  if (!context.isHtml) {
    const reasoning = reasoningLines
      .map((line) => line.replace(/\$([^$]+)\$/g, '\\($1\\)'))
      .join('\n\n')
    return `\\begin{center}
\\arrayrulecolor{black}
${table}
\\arrayrulecolor{couleur_theme}
\\end{center}

${reasoning}`
  }
  return `${table}
    <div style="max-width: 44em; margin: 0.5em auto 0;">
      ${reasoningLines.map((line) => `<p>${line}</p>`).join('\n')}
    </div>`
}

/**
 * Compléter un tableau de comportements locaux à partir d'un graphique.
 * @author Nathan Scheinmann
 */
export default class LireLimiteGraphiqueTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      "Utiliser le graphique pour compléter le tableau. Si la fonction n'est pas définie ou si la limite n'existe pas, saisir $\\not\\exists$."
    const paragraphBreak = context.isHtml ? '<br>' : '\n\n'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const rows = randomLocalRows()
      const signature = rows
        .map(
          (row) =>
            `${row.a}/${row.fa}/${row.left}/${row.right}/${row.twoSided}`,
        )
        .join('-')
      const texte =
        `Le graphique ci-dessous représente une fonction $f$. Compléter le tableau avec $f(a)$, les limites à gauche, les limites à droite et les limites en $a$.${paragraphBreak}` +
        synthesisGraph(rows) +
        tableOutput(this, i, rows)
      const texteCorr =
        `On lit les comportements locaux sur le graphique aux abscisses indiquées dans le tableau.${paragraphBreak}` +
        correctionTable(rows)

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
