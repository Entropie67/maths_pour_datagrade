import type { MathfieldElement } from 'mathlive'
import { fonctionComparaison } from '../../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../../lib/interactif/tableaux/AjouteTableauMathlive'
import { combinaisonListes, shuffleLettres } from '../../../lib/outils/arrayOutils'
import {
    miseEnEvidence,
    texteEnCouleurEtGras,
    texteGras,
    texteItalique,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import type { AnswerType, IExercice } from '../../../lib/types'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résolution de triangles (cas ambigu CCA)'
export const dateDePublication = '16/03/2026'
export const interactifReady = true

export const uuid = 'b7e2d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoTri-6'],
}

function texDeg(value: string) {
  return `${value}^\\circ`
}

function texResult(value: number) {
  return texNombre(arrondi(value, 2), 2, true)
}

/**
 * Résolution de triangles — cas ambigu CCA (côté-côté-angle opposé)
 * 0, 1 ou 2 solutions possibles
 * @author Nathan Scheinmann
 */
export default class ResolutionTrianglesCCA extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de cas',
      [
        'Nombres séparés par des tirets :',
        '1 : 0 solution',
        '2 : 1 solution',
        '3 : 2 solutions',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypes = combinaisonListes(typesDisponibles, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeDeNomsDePolygones = ['QD']
      const nom = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom)
      const precisionInstruction = texteItalique(
        "Lorsqu'il y en a, donner les réponses arrondies au centième.",
      )

      // Side naming: lowercase of opposite vertex
      //   sa = lowercase(nom[0]) = side opposite nom[0] = segment nom[1]nom[2]
      //   sb = lowercase(nom[1]) = side opposite nom[1] = segment nom[0]nom[2]
      //   sc = lowercase(nom[2]) = side opposite nom[2] = segment nom[0]nom[1]
      const sa = nom[0].toLowerCase()
      const sb = nom[1].toLowerCase()
      const sc = nom[2].toLowerCase()
      // 3-letter angle names (vertex in middle)
      const angA = `${nom[1]}${nom[0]}${nom[2]}`
      const angB = `${nom[0]}${nom[1]}${nom[2]}`
      const angC = `${nom[0]}${nom[2]}${nom[1]}`

      const typeQ = listeTypes[i]
      let texte = ''
      let texteCorr = ''

      // CCA setup: given angleA (at nom[0]), sideA (opposite nom[0] = nom[1]nom[2]),
      // sideC (= nom[0]nom[1])
      // Law of sines: sinC = sideC × sin(angleA) / sideA

      if (typeQ === 1) {
        // ======== 0 solutions (sinC > 1) ========
        let angleA: number, sideA: number, sideC: number, sinC: number
        let cptDo = 0
        do {
          cptDo++
          angleA = randint(15, 165) + randint(1, 9) / 10
          sideC = randint(5, 15) + randint(0, 99) / 100
          const h = sideC * Math.sin((angleA * Math.PI) / 180)
          sideA = arrondi(h * (randint(30, 85) / 100), 2)
          sinC = (sideC * Math.sin((angleA * Math.PI) / 180)) / sideA
        } while (
          (sinC < 1.05 || sideA < 1 || Math.abs(angleA - 90) < 3) &&
          cptDo < 50
        )

        // Statement
        texte = `Résoudre le triangle $${nom}$ sachant que $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$, $${sa} = ${nom[1]}${nom[2]} = ${texNombre(sideA, 2)}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        texte += `<br>${precisionInstruction}`

        handleAnswers(this, i, buildAmbiguousCaseAnswers([], angB, angC, sb), {
          formatInteractif: 'tableauMathlive',
        })
        if (this.interactif) {
          texte +=
            '<br>' +
            buildAmbiguousCaseTable(this.numeroExercice ?? 0, i, angB, angC, sb)
          texte += `<br>${texteItalique('Compléter les solutions éventuelles et laisser vides les lignes inutiles.')}`
        }

        // Correction
        texteCorr = `On est dans le cas ${texteGras('C-C-A')} (côté-côté-angle opposé), c'est un cas ambigu.<br><br>`

        texteCorr += `${texteGras(`Recherche de $\\widehat{${angC}}$ par le théorème du sinus :`)}<br>
$\\dfrac{\\sin(\\widehat{${angC}})}{${sc}} = \\dfrac{\\sin(\\widehat{${angA}})}{${sa}}$<br><br>
$\\sin(\\widehat{${angC}}) = \\dfrac{${sc} \\times \\sin(\\widehat{${angA}})}{${sa}} = \\dfrac{${texNombre(sideC, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{${texNombre(sideA, 2)}} \\approx ${texNombre(arrondi(sinC, 4), 4)}$<br><br>`

        texteCorr += `Comme $\\sin(\\widehat{${angC}}) \\approx ${texNombre(arrondi(sinC, 4), 4)} > 1$, aucun triangle ne satisfait ces données.<br><br>`
        texteCorr += `Il n'y a ${texteEnCouleurEtGras('aucune solution')}.`
      } else if (typeQ === 2) {
        // ======== 1 solution ========
        let angleA: number, sideA: number, sideC: number, sinC: number
        let angleC1: number, angleC2: number, angleB: number, sideB: number
        let cptDo = 0
        do {
          cptDo++
          if (Math.random() < 0.5) {
            // Obtuse angle, sideA > sideC
            angleA = randint(95, 160) + randint(1, 9) / 10
            sideC = randint(3, 12) + randint(0, 99) / 100
            sideA = sideC + randint(1, 5) + randint(0, 99) / 100
          } else {
            // Acute angle, sideA > sideC
            angleA = randint(15, 80) + randint(1, 9) / 10
            sideC = randint(3, 12) + randint(0, 99) / 100
            sideA = sideC + randint(0, 5) + randint(1, 99) / 100
          }
          sinC = (sideC * Math.sin((angleA * Math.PI) / 180)) / sideA
          angleC1 = sinC > 0 && sinC < 1 ? (Math.asin(sinC) * 180) / Math.PI : 0
          angleC2 = 180 - angleC1
          angleB = 180 - angleA - angleC1
          sideB =
            (sideA * Math.sin((angleB * Math.PI) / 180)) /
            Math.sin((angleA * Math.PI) / 180)
        } while (
          (sinC >= 1 ||
            sinC < 0.1 ||
            angleC1 < 10 ||
            angleB < 10 ||
            angleC1 > 170 ||
            angleB > 170 ||
            Math.abs(angleC1 - 90) < 3 ||
            Math.abs(angleB - 90) < 3 ||
            angleA + angleC2 < 180 ||
            sideB < 1 ||
            isNaN(sideB)) &&
          cptDo < 50
        )

        // Statement
        texte = `Résoudre le triangle $${nom}$ sachant que $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$, $${sa} = ${nom[1]}${nom[2]} = ${texNombre(sideA, 2)}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        texte += `<br>${precisionInstruction}`

        handleAnswers(
          this,
          i,
          buildAmbiguousCaseAnswers(
            [[texResult(angleC1), texResult(angleB), texResult(sideB)]],
            angB,
            angC,
            sb,
          ),
          { formatInteractif: 'tableauMathlive' },
        )
        if (this.interactif) {
          texte +=
            '<br>' +
            buildAmbiguousCaseTable(this.numeroExercice ?? 0, i, angB, angC, sb)
          texte += `<br>${texteItalique('Compléter les solutions éventuelles et laisser vides les lignes inutiles.')}`
        }

        // Correction
        texteCorr = `On est dans le cas ${texteGras('C-C-A')} (côté-côté-angle opposé), c'est un cas ambigu.<br><br>`

        texteCorr += `${texteGras(`Recherche de $\\widehat{${angC}}$ par le théorème du sinus :`)}<br>
$\\dfrac{\\sin(\\widehat{${angC}})}{${sc}} = \\dfrac{\\sin(\\widehat{${angA}})}{${sa}}$<br><br>
$\\sin(\\widehat{${angC}}) = \\dfrac{${sc} \\times \\sin(\\widehat{${angA}})}{${sa}} = \\dfrac{${texNombre(sideC, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{${texNombre(sideA, 2)}} \\approx ${texNombre(arrondi(sinC, 4), 4)}$<br><br>`

        texteCorr += `$\\widehat{${angC}}_1 = \\arcsin(${texNombre(arrondi(sinC, 4), 4)}) \\approx ${texDeg(texResult(angleC1))}$ ou $\\widehat{${angC}}_2 = ${texDeg('180')} - ${texDeg(texResult(angleC1))} = ${texDeg(texResult(angleC2))}$<br><br>`

        texteCorr += `Vérifions la compatibilité :<br>`
        texteCorr += `$\\widehat{${angA}} + \\widehat{${angC}}_1 = ${texDeg(texNombre(angleA, 1))} + ${texDeg(texResult(angleC1))} = ${texDeg(texResult(angleA + angleC1))} < 180^\\circ$ ✓<br>`
        texteCorr += `$\\widehat{${angA}} + \\widehat{${angC}}_2 = ${texDeg(texNombre(angleA, 1))} + ${texDeg(texResult(angleC2))} = ${texDeg(texResult(angleA + angleC2))} > 180^\\circ$ ✗<br><br>`

        texteCorr += `Il y a ${texteGras('une seule solution')} (on retient $\\widehat{${angC}} \\approx ${texDeg(miseEnEvidence(texResult(angleC1)))}$).<br><br>`

        texteCorr += `${texteGras(`Angle $\\widehat{${angB}}$ :`)}<br>
$\\widehat{${angB}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angC}} = ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texResult(angleC1))} = ${texDeg(miseEnEvidence(texResult(angleB)))}$<br><br>`

        texteCorr += `${texteGras(`Côté $${sb}$ par le théorème du sinus :`)}<br>
$\\begin{aligned}
${sb} &= \\dfrac{${sa} \\times \\sin(\\widehat{${angB}})}{\\sin(\\widehat{${angA}})} \\\\
  &= \\dfrac{${texNombre(sideA, 2)} \\times \\sin(${texDeg(texResult(angleB))})}{\\sin(${texDeg(texNombre(angleA, 1))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideB))}
\\end{aligned}$`
      } else {
        // ======== 2 solutions ========
        let angleA: number, sideA: number, sideC: number, sinC: number
        let angleC1: number, angleC2: number
        let angleB1: number, angleB2: number, sideB1: number, sideB2: number
        let cptDo = 0
        do {
          cptDo++
          angleA = randint(15, 75) + randint(1, 9) / 10
          sideC = randint(5, 15) + randint(0, 99) / 100
          const h = sideC * Math.sin((angleA * Math.PI) / 180)
          const range = sideC - h
          if (range <= 0) {
            sinC = 2
            angleC1 = 0
            angleC2 = 180
            angleB1 = 0
            angleB2 = 0
            sideB1 = 0
            sideB2 = 0
            sideA = 0
            continue
          }
          sideA = arrondi(h + range * (randint(15, 85) / 100), 2)
          sinC = (sideC * Math.sin((angleA * Math.PI) / 180)) / sideA
          angleC1 = sinC > 0 && sinC < 1 ? (Math.asin(sinC) * 180) / Math.PI : 0
          angleC2 = 180 - angleC1
          angleB1 = 180 - angleA - angleC1
          angleB2 = 180 - angleA - angleC2
          sideB1 =
            (sideA * Math.sin((angleB1 * Math.PI) / 180)) /
            Math.sin((angleA * Math.PI) / 180)
          sideB2 =
            (sideA * Math.sin((angleB2 * Math.PI) / 180)) /
            Math.sin((angleA * Math.PI) / 180)
        } while (
          (sinC >= 1 ||
            sinC < 0.1 ||
            angleC1 < 5 ||
            angleB1 < 5 ||
            angleB2 < 5 ||
            angleA + angleC1 >= 180 ||
            angleA + angleC2 >= 180 ||
            sideA < 1 ||
            sideB1 < 1 ||
            sideB2 < 1 ||
            isNaN(sideB1) ||
            isNaN(sideB2)) &&
          cptDo < 50
        )

        // Statement
        texte = `Résoudre le triangle $${nom}$ sachant que $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$, $${sa} = ${nom[1]}${nom[2]} = ${texNombre(sideA, 2)}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        texte += `<br>${precisionInstruction}`

        const solutionsAttendues: [TriangleSolution, TriangleSolution] = [
          [texResult(angleC1), texResult(angleB1), texResult(sideB1)],
          [texResult(angleC2), texResult(angleB2), texResult(sideB2)],
        ]
        handleAnswers(
          this,
          i,
          buildAmbiguousCaseAnswers(solutionsAttendues, angB, angC, sb),
          { formatInteractif: 'tableauMathlive' },
        )
        if (this.interactif) {
          texte +=
            '<br>' +
            buildAmbiguousCaseTable(this.numeroExercice ?? 0, i, angB, angC, sb)
          texte += `<br>${texteItalique('Compléter les solutions éventuelles et laisser vides les lignes inutiles.')}`
        }

        // Correction
        texteCorr = `On est dans le cas ${texteGras('C-C-A')} (côté-côté-angle opposé), c'est un cas ambigu.<br><br>`

        texteCorr += `${texteGras(`Recherche de $\\widehat{${angC}}$ par le théorème du sinus :`)}<br>
$\\dfrac{\\sin(\\widehat{${angC}})}{${sc}} = \\dfrac{\\sin(\\widehat{${angA}})}{${sa}}$<br><br>
$\\sin(\\widehat{${angC}}) = \\dfrac{${sc} \\times \\sin(\\widehat{${angA}})}{${sa}} = \\dfrac{${texNombre(sideC, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{${texNombre(sideA, 2)}} \\approx ${texNombre(arrondi(sinC, 4), 4)}$<br><br>`

        texteCorr += `$\\widehat{${angC}}_1 = \\arcsin(${texNombre(arrondi(sinC, 4), 4)}) \\approx ${texDeg(texResult(angleC1))}$ ou $\\widehat{${angC}}_2 = ${texDeg('180')} - ${texDeg(texResult(angleC1))} = ${texDeg(texResult(angleC2))}$<br><br>`

        texteCorr += `Vérifions la compatibilité :<br>`
        texteCorr += `$\\widehat{${angA}} + \\widehat{${angC}}_1 = ${texDeg(texNombre(angleA, 1))} + ${texDeg(texResult(angleC1))} = ${texDeg(texResult(angleA + angleC1))} < 180^\\circ$ ✓<br>`
        texteCorr += `$\\widehat{${angA}} + \\widehat{${angC}}_2 = ${texDeg(texNombre(angleA, 1))} + ${texDeg(texResult(angleC2))} = ${texDeg(texResult(angleA + angleC2))} < 180^\\circ$ ✓<br><br>`

        texteCorr += `Il y a ${texteGras('deux solutions')}.<br><br>`

        // Solution 1
        texteCorr += `${texteGras('Solution $\\mathbf{1}$ :')} on retient $\\widehat{${angC}} \\approx ${texDeg(miseEnEvidence(texResult(angleC1)))}$<br><br>`

        texteCorr += `$\\widehat{${angB}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angC}} = ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texResult(angleC1))} = ${texDeg(miseEnEvidence(texResult(angleB1)))}$<br><br>`

        texteCorr += `$\\begin{aligned}
${sb} &= \\dfrac{${sa} \\times \\sin(\\widehat{${angB}})}{\\sin(\\widehat{${angA}})} \\\\
  &= \\dfrac{${texNombre(sideA, 2)} \\times \\sin(${texDeg(texResult(angleB1))})}{\\sin(${texDeg(texNombre(angleA, 1))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideB1))}
\\end{aligned}$<br><br>`

        // Solution 2
        texteCorr += `${texteGras('Solution $\\mathbf{2}$ :')} on retient $\\widehat{${angC}} \\approx ${texDeg(miseEnEvidence(texResult(angleC2)))}$<br><br>`

        texteCorr += `$\\widehat{${angB}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angC}} = ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texResult(angleC2))} = ${texDeg(miseEnEvidence(texResult(angleB2)))}$<br><br>`

        texteCorr += `$\\begin{aligned}
${sb} &= \\dfrac{${sa} \\times \\sin(\\widehat{${angB}})}{\\sin(\\widehat{${angA}})} \\\\
  &= \\dfrac{${texNombre(sideA, 2)} \\times \\sin(${texDeg(texResult(angleB2))})}{\\sin(${texDeg(texNombre(angleA, 1))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideB2))}
\\end{aligned}$`
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

type TriangleSolution = [string, string, string]

type AmbiguousTableKey = 'L1C1' | 'L1C2' | 'L1C3' | 'L2C1' | 'L2C2' | 'L2C3'

type ExpectedLayout = [TriangleSolution | null, TriangleSolution | null]

const ambiguousCaseRows = [
  ['L1C1', 'L1C2', 'L1C3'],
  ['L2C1', 'L2C2', 'L2C3'],
] as const satisfies readonly AmbiguousTableKey[][]

function comparePromptValue(saisie: string, attendu: string) {
  if (saisie === '') return false
  return fonctionComparaison(saisie, attendu).isOk
}

function buildAmbiguousCaseTable(
  numeroExercice: number,
  question: number,
  angB: string,
  angC: string,
  sideBName: string,
) {
  const emptyAngleCell = {
    texte: '',
    latex: true,
    gras: true,
    color: 'black',
    options: { texteApres: '°' },
  }
  const emptyLengthCell = {
    texte: '',
    latex: true,
    gras: true,
    color: 'black',
  }

  return AddTabDbleEntryMathlive.create(
    numeroExercice,
    question,
    {
      headingCols: [
        { texte: '\\text{}', latex: true, gras: true, color: 'black' },
        {
          texte: `\\widehat{${angC}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
        {
          texte: `\\widehat{${angB}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
        { texte: sideBName, latex: true, gras: true, color: 'black' },
      ],
      headingLines: [
        {
          texte: '\\text{Solution 1}',
          latex: true,
          gras: true,
          color: 'black',
        },
        {
          texte: '\\text{Solution 2}',
          latex: true,
          gras: true,
          color: 'black',
        },
      ],
      raws: [
        [emptyAngleCell, emptyAngleCell, emptyLengthCell].map((cell) => ({
          ...cell,
        })),
        [emptyAngleCell, emptyAngleCell, emptyLengthCell].map((cell) => ({
          ...cell,
        })),
      ],
      colFooters: [],
      lineFooters: [],
    },
    'tableauMathlive',
    true,
    {},
  ).output
}

function buildAmbiguousCaseAnswers(
  solutions: TriangleSolution[],
  angB: string,
  angC: string,
  sideBName: string,
) {
  return {
    L1C1: { value: solutions[0]?.[0] ?? '' },
    L1C2: { value: solutions[0]?.[1] ?? '' },
    L1C3: { value: solutions[0]?.[2] ?? '' },
    L2C1: { value: solutions[1]?.[0] ?? '' },
    L2C2: { value: solutions[1]?.[1] ?? '' },
    L2C3: { value: solutions[1]?.[2] ?? '' },
    callback: buildAmbiguousCaseCallback(solutions, angB, angC, sideBName),
  }
}

function buildCandidateLayouts(
  solutions: TriangleSolution[],
): ExpectedLayout[] {
  if (solutions.length === 0) return [[null, null]]
  if (solutions.length === 1)
    return [
      [solutions[0], null],
      [null, solutions[0]],
    ]
  return [
    [solutions[0], solutions[1]],
    [solutions[1], solutions[0]],
  ]
}

function evaluateLayout(
  promptValues: Record<AmbiguousTableKey, string>,
  layout: ExpectedLayout,
) {
  const promptStates: Record<AmbiguousTableKey, boolean> = {
    L1C1: false,
    L1C2: false,
    L1C3: false,
    L2C1: false,
    L2C2: false,
    L2C3: false,
  }

  let nbCorrect = 0
  let nbBonnesReponses = 0
  let nbReponses = 0
  for (let rowIndex = 0; rowIndex < ambiguousCaseRows.length; rowIndex++) {
    const expectedSolution = layout[rowIndex]
    const rowKeys = ambiguousCaseRows[rowIndex]

    if (expectedSolution == null) {
      const isEmptyLine = rowKeys.every((key) => promptValues[key] === '')
      for (const key of rowKeys) {
        promptStates[key] = isEmptyLine
        if (isEmptyLine) nbCorrect++
      }
      nbBonnesReponses += isEmptyLine ? 1 : 0
      nbReponses += 1
      continue
    }

    for (let colIndex = 0; colIndex < rowKeys.length; colIndex++) {
      const key = rowKeys[colIndex]
      const isOk = comparePromptValue(
        promptValues[key],
        expectedSolution[colIndex],
      )
      promptStates[key] = isOk
      if (isOk) {
        nbCorrect++
        nbBonnesReponses++
      }
    }
    nbReponses += rowKeys.length
  }

  return {
    isOk: nbBonnesReponses === nbReponses,
    nbCorrect,
    nbBonnesReponses,
    nbReponses,
    promptStates,
  }
}

function buildAmbiguousCaseCallback(
  solutions: TriangleSolution[],
  angB: string,
  angC: string,
  sideBName: string,
) {
  return (
    exercice: IExercice,
    question: number,
    _variables: [string, AnswerType][],
    _bareme: (listePoints: number[]) => [number, number],
  ) => {
    const spanFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${question}`,
    ) as HTMLDivElement | null
    const fields = Object.fromEntries(
      (Object.values(ambiguousCaseRows).flat() as AmbiguousTableKey[]).map(
        (key) => [
          key,
          document.getElementById(
            `champTexteEx${exercice.numeroExercice}Q${question}${key}`,
          ) as MathfieldElement | null,
        ],
      ),
    ) as Record<AmbiguousTableKey, MathfieldElement | null>

    if (Object.values(fields).some((field) => field == null)) {
      return {
        isOk: false,
        feedback:
          "erreur dans le programme : les zones de saisie n'ont pas été trouvées",
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const tableValues = Object.fromEntries(
      (Object.keys(fields) as AmbiguousTableKey[]).map((key) => [
        key,
        fields[key]?.value ?? '',
      ]),
    ) as Record<AmbiguousTableKey, string>

    const lineStates = ambiguousCaseRows.map((row) => {
      const values = row.map((key) => tableValues[key])
      if (values.every((value) => value === '')) return 'empty'
      if (values.every((value) => value !== '')) return 'complete'
      return 'partial'
    })

    const bestLayout = buildCandidateLayouts(solutions).reduce(
      (best, layout) => {
        const evaluatedLayout = evaluateLayout(tableValues, layout)
        return evaluatedLayout.isOk ||
          evaluatedLayout.nbBonnesReponses > best.nbBonnesReponses ||
          (evaluatedLayout.nbBonnesReponses === best.nbBonnesReponses &&
            evaluatedLayout.nbCorrect > best.nbCorrect)
          ? evaluatedLayout
          : best
      },
      evaluateLayout(tableValues, buildCandidateLayouts(solutions)[0]),
    )

    for (const key of Object.keys(
      bestLayout.promptStates,
    ) as AmbiguousTableKey[]) {
      const field = fields[key]
      const resultSpan = document.getElementById(
        `resultatCheckEx${exercice.numeroExercice}Q${question}${key}`,
      )
      if (field != null) {
        field.classList.add('corrected')
      }
      if (resultSpan != null) {
        resultSpan.innerHTML = bestLayout.promptStates[key] ? '😎' : '☹️'
      }
    }

    const completeLinesCount = lineStates.filter(
      (state) => state === 'complete',
    ).length
    const partialLinesCount = lineStates.filter(
      (state) => state === 'partial',
    ).length
    let feedback = ''
    if (!bestLayout.isOk) {
      if (partialLinesCount > 0) {
        feedback +=
          'Compléter entièrement une solution ou laisser la ligne vide.<br>'
      }
      if (solutions.length === 0) {
        feedback +=
          "Ici, il n'y a aucune solution : il fallait laisser les deux lignes vides."
      } else if (solutions.length === 1) {
        if (completeLinesCount === 0 && partialLinesCount === 0) {
          feedback +=
            "Ici, il y a une seule solution : compléter une seule ligne et laisser l'autre vide."
        } else if (completeLinesCount > 1) {
          feedback +=
            "Ici, il y a une seule solution : une seule ligne doit être complétée et l'autre doit rester vide."
        } else {
          feedback +=
            'La ligne complétée ne correspond pas à la solution attendue.'
        }
      } else if (completeLinesCount < 2) {
        feedback +=
          'Ici, il y a deux solutions : les deux lignes doivent être complétées.'
      } else {
        feedback += `Les deux solutions doivent rester cohérentes : à chaque valeur de $\\widehat{${angC}}$ il faut associer l'angle $\\widehat{${angB}}$ et le côté $${sideBName}$ correspondants.`
      }
    }

    if (spanFeedback != null) {
      spanFeedback.innerHTML = feedback.length > 0 ? `💡 ${feedback}` : ''
      if (feedback.length > 0) {
        spanFeedback.classList.add(
          'py-2',
          'italic',
          'text-coopmaths-warn-darkest',
          'dark:text-coopmathsdark-warn-darkest',
        )
      }
    }

    return {
      isOk: bestLayout.isOk,
      feedback,
      score: {
        nbBonnesReponses: bestLayout.nbBonnesReponses,
        nbReponses: bestLayout.nbReponses,
      },
    }
  }
}
