import { tableauColonneLigne } from '../../../lib/2d/tableau'
import {
  isEqual,
  isReduced,
  seq,
  stringEquals,
} from '../../../lib/interactif/checks'
import { troisPointsProportionnels } from '../../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../../lib/interactif/tableaux/AjouteTableauMathlive'
import MonomePlusieursVariables from '../../../lib/mathFonctions/MonomePlusieursVariables'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import type { AnswerType } from '../../../lib/types'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Identifier ou reconstituer un monôme : coefficient, partie littérale et degré.'
export const interactifReady = true

export const amcReady = false
export const dateDePublication = '07/11/2026'
export const uuid = '9300a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['10LSFA4D-10', '10LCFA4D-10', '11CTFA3A-6'],
}
/**
 * @author Jean-claude Lhote
 */

const variables = ['x', 'y', 'z', 'r', 's', 't']
const monomialsPerTable = 6
const characteristicHeaders = [
  '\\text{Coefficient}',
  '\\text{Partie littérale}',
  '\\text{Degré}',
]

export default class IdentifierOuReconstituerUnMonome extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1

    this.besoinFormulaireTexte = [
      'Types de questions',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Identifier les caractéristiques d’un monôme',
        '2 : Reconstituer un monôme',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Caractéristiques à demander',
      [
        'Nombres séparés par des tirets :',
        '1 : Coefficient',
        '2 : Partie littérale',
        '3 : Degré',
      ].join('\n'),
    ]
    this.textFormOptions = { 2: { weighted: false, minSelections: 1 } }
    this.besoinFormulaire3Texte = [
      'Types de coefficients',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Fractionnaires',
      ].join('\n'),
    ]
    this.besoinFormulaire4CaseACocher = ['Une seule variable par monôme', true]
    this.besoinFormulaire5Numerique = ['Degré maximal', 6]

    this.sup = '1'
    this.sup2 = '1-2-3'
    this.sup3 = '1'
    this.sup4 = false
    this.sup5 = 3

    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Compléter le tableau.'
        : 'Compléter les tableaux.'

    const questionTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions * monomialsPerTable,
    }).map(Number)
    const characteristics = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 0,
      defaut: 0,
      nbQuestions: 0,
      shuffle: false,
      enleveDoublons: true,
    }).map(Number)
    // Conserver les tirages existants lorsque seuls les entiers sont choisis.
    const coefficientTypes: number[] =
      String(this.sup3) === '1'
        ? Array(this.nbQuestions * monomialsPerTable).fill(1)
        : gestionnaireFormulaireTexte({
            saisie: this.sup3,
            min: 1,
            max: 3,
            melange: 0,
            defaut: 1,
            nbQuestions: this.nbQuestions * monomialsPerTable,
          }).map(Number)
    const maxDegree = Number(this.sup5)
    const compareMonomial = seq([isEqual(), isReduced()])
    
    let hasConstantLiteralAnswer = false

    for (let i = 0; i < this.nbQuestions; i++) {
      const types = questionTypes.slice(
        i * monomialsPerTable,
        (i + 1) * monomialsPerTable,
      )
      // La reconstitution exige toujours le coefficient et la partie littérale.
      const displayedCharacteristics = [1, 2, 3].filter(
        (value) =>
          characteristics.includes(value) || (types.includes(2) && value <= 2),
      )
      const headers = ['\\text{Monôme}']
      const correctionHeaders = ['\\text{Monôme}']
      const rowHeaders = displayedCharacteristics.map(
        (value) => characteristicHeaders[value - 1],
      )
      const cells: string[][] = displayedCharacteristics.map(() => [])
      const correctionCells: string[][] = displayedCharacteristics.map(() => [])
      const answers: Record<string, AnswerType> = {}
      const monomials: MonomePlusieursVariables[] = []
      const drawn = new Set<string>()
      // Chaque tableau contient une constante, un degré 1 et le degré maximal.
      const degrees = shuffle([
        0,
        1,
        maxDegree,
        ...Array.from({ length: monomialsPerTable - 3 }, () =>
          randint(1, maxDegree),
        ),
      ])

      for (let column = 0; column < monomialsPerTable; column++) {
        const coefficientType = coefficientTypes[i * monomialsPerTable + column]
        let monomial: MonomePlusieursVariables
        do {
          const letters = shuffle(variables).slice(0, this.sup4 ? 1 : 2)
          monomial = MonomePlusieursVariables.createRandomMonome(
            degrees[column],
            coefficientType === 3 ? 'fractionnaire' : 'entier',
            letters,
          )
          if (coefficientType === 2) {
            // Un dixième exact non entier, sans calcul flottant intermédiaire.
            monomial.coefficient = new FractionEtendue(
              randint(
                -99,
                99,
                Array.from({ length: 19 }, (_, index) => (index - 9) * 10),
              ),
              10,
            )
          }
        } while (drawn.has(monomial.toString()))
        drawn.add(monomial.toString())
        monomials.push(monomial)
        const partieLiterale = new MonomePlusieursVariables(
          1,
          monomial.partieLitterale,
        ).toString()
        const coefficient =
          coefficientType === 2
            ? texNombre(monomial.coefficient.valeurDecimale, 1)
            : monomial.coefficient.texFractionSimplifiee
        const monomeLatex =
          coefficientType === 2
            ? `${coefficient}${monomial.degre === 0 ? '' : ` ${partieLiterale}`}`
            : monomial.toString()
        const values = [
          coefficient,
          monomial.degre === 0 ? '/' : partieLiterale,
          String(monomial.degre),
        ]
        const reconstruct = types[column] === 2
        headers.push(reconstruct ? '' : monomeLatex)
        correctionHeaders.push(
          reconstruct ? miseEnEvidence(monomeLatex) : monomeLatex,
        )
        if (reconstruct) {
          answers[`L0C${column + 1}`] = {
            value: monomeLatex,
            compare: compareMonomial,
          }
        }

        // Construction du tableau
        for (const [
          rowIndex,
          characteristic,
        ] of displayedCharacteristics.entries()) {
          const expected = values[characteristic - 1]
          const unknown =
            !reconstruct && characteristics.includes(characteristic)
          cells[rowIndex].push(unknown ? '' : expected)
          correctionCells[rowIndex].push(
            unknown ? miseEnEvidence(expected) : expected,
          )
          if (!unknown) continue
          answers[`L${rowIndex + 1}C${column + 1}`] =
            characteristic === 2 && monomial.degre === 0
              ? {
                  value: ['1', '/', ''],
                  compare: seq([stringEquals({ trim: true })]),
                  options: { nonReponseAcceptee: true },
                }
              : {
                  value: expected,
                  compare:
                    characteristic === 2 ? compareMonomial : seq([isEqual()]),
                }
        }
      }

      const renderTable = (
        columnHeaders: string[],
        content: string[][],
        interactive: boolean,
      ) => {
        if (!context.isHtml || context.isTypst) {
          return tableauColonneLigne(
            columnHeaders.map((cell) => cell || '\\phantom{-3x^{2}}'),
            rowHeaders,
            content.flat().map((cell) => cell || '\\phantom{-3x^{2}}'),
            1.7,
          )
        }
        const table = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          columnHeaders,
          rowHeaders,
          content.flat(),
          [],
          [],
          false,
        )
        return `<div style="max-width:100%;overflow-x:auto">${
          AddTabDbleEntryMathlive.create(
            this.numeroExercice ?? 0,
            i,
            table,
            'clavierDeBaseAvecVariable',
            interactive,
            {},
          ).output
        }</div>`
      }
      handleAnswers(
        this,
        i,
        { bareme: troisPointsProportionnels, ...answers },
        { formatInteractif: 'tableauMathlive' },
      )
      hasConstantLiteralAnswer ||=
        types.some((type, row) => type === 1 && monomials[row].degre === 0) &&
        characteristics.includes(2)
      this.listeQuestions[i] = renderTable(headers, cells, this.interactif)
      this.listeCorrections[i] = renderTable(
        correctionHeaders,
        correctionCells,
        false,
      )
      const explanations = [
        'Le coefficient est le facteur numérique, avec son signe. Devant une partie littérale, il vaut $1$ lorsqu’aucun nombre n’est écrit, et $-1$ lorsqu’un signe moins est seul écrit.',
      ]
      if (displayedCharacteristics.includes(2))
        explanations.push(
          'La partie littérale est le produit des variables avec leurs exposants.',
        )
      if (displayedCharacteristics.includes(3))
        explanations.push(
          'Le degré est la somme des exposants des variables. Un monôme constant non nul est de degré $0$.',
        )
      this.listeCorrections[i] += `<br>${explanations.join('<br>')}`
    }
    if (
      this.interactif &&
      context.isHtml &&
      !context.isTypst &&
      hasConstantLiteralAnswer
    ) {
      this.consigne += '<br>Laisser la case vide lorsque cela est pertinent.'
    }
    listeQuestionsToContenu(this)
  }
}
