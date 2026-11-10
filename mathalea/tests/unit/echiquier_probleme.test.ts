import { describe, expect, it } from 'vitest'
import { EchiquierProblemeElement } from '../../src/lib/customElements/EchiquierProblemeElement'
import { context, setOutputHtml } from '../../src/modules/context'

describe('EchiquierProblemeElement', () => {
  it("rend le type d'echiquier et l'operation en statique en mode correction", async () => {
    setOutputHtml()
    document.body.innerHTML = EchiquierProblemeElement.create({
      numeroExercice: 1,
      questionIndex: 0,
      interactivityOn: false,
      expectedRows: ['Prix total'],
      expectedColumns: ['Courses'],
      rowChoices: ['Prix total'],
      columnChoices: ['Courses'],
      cells: [{ row: 'Prix total', column: 'Courses', value: '8 €' }],
      expectedStructure: 'ligne',
      expectedOperation: 'addition',
      cellFillMode: 'correction',
    })

    const echiquier = document.querySelector(
      'echiquier-probleme',
    ) as EchiquierProblemeElement
    const root = echiquier.shadowRoot!

    expect(root.querySelector('.controls')).toBeNull()
    expect(root.querySelectorAll('button')).toHaveLength(0)
    expect(root.querySelectorAll('select')).toHaveLength(0)
    expect(root.querySelector('.analysis')?.textContent).toContain(
      "Type d'échiquier :en ligne",
    )
    expect(root.querySelector('.analysis')?.textContent).toContain(
      'Opération :addition',
    )
  })

  it("rend un echiquier HTML statique a completer quand l'interactivite est coupee", () => {
    setOutputHtml()
    document.body.innerHTML = EchiquierProblemeElement.create({
      numeroExercice: 1,
      questionIndex: 0,
      interactivityOn: false,
      expectedRows: ['Prix total'],
      expectedColumns: ['Courses'],
      rowChoices: ['Prix total'],
      columnChoices: ['Courses'],
      cells: [{ row: 'Prix total', column: 'Courses', value: '8 €' }],
      expectedStructure: 'ligne',
      expectedOperation: 'addition',
      cellFillMode: 'student',
    })

    const echiquier = document.querySelector(
      'echiquier-probleme',
    ) as EchiquierProblemeElement
    const root = echiquier.shadowRoot!

    expect(root.querySelector('.controls')).toBeNull()
    expect(root.querySelectorAll('select')).toHaveLength(0)
    expect(root.textContent).toContain('Prix total')
    expect(root.textContent).toContain('Courses')
    expect(root.textContent).toContain('...')
    expect(root.textContent).not.toContain('8 €')
  })

  it('attribue les points par groupes de verification', () => {
    setOutputHtml()
    const answer = {
      expectedRows: ['Prix unitaire', 'Masse totale', 'Prix total'],
      expectedColumns: ['Pommes'],
      rowChoices: ['Prix unitaire', 'Masse totale', 'Prix total'],
      columnChoices: ['Pommes'],
      cells: [
        { row: 'Prix unitaire', column: 'Pommes', value: '2 €/kg' },
        { row: 'Masse totale', column: 'Pommes', value: '3 kg' },
        { row: 'Prix total', column: 'Pommes', value: '6 €' },
      ],
      expectedGreyedRows: ['Prix unitaire'],
      expectedGreyedColumns: [],
      expectedStructure: 'colonne',
      expectedOperation: 'multiplication',
      cellFillMode: 'student',
      simplificationMode: 'grey',
    } as const
    document.body.innerHTML = EchiquierProblemeElement.create({
      numeroExercice: 1,
      questionIndex: 0,
      ...answer,
    })
    const echiquier = document.querySelector(
      'echiquier-probleme',
    ) as EchiquierProblemeElement
    echiquier.value = {
      rowHeaders: [...answer.expectedRows],
      columnHeaders: [...answer.expectedColumns],
      cellValues: {
        '0:0': '2 €/kg',
        '1:0': '3 kg',
        '2:0': '6 €',
      },
      greyedRows: ['Prix unitaire'],
      greyedColumns: [],
      structure: 'colonne',
      operation: 'multiplication',
    }
    const exercice = {
      id: 'test',
      numeroExercice: 1,
      autoCorrection: [
        { valeur: { reponse: { value: JSON.stringify(answer) } } },
      ],
    }

    const result = EchiquierProblemeElement.verifQuestion(exercice as never, 0)

    expect(result.score).toEqual({ nbBonnesReponses: 5, nbReponses: 5 })
    expect(
      EchiquierProblemeElement.pointsMaxQuestion(exercice as never, 0),
    ).toBe(5)
  })

  it("rend l'enonce Typst a completer meme sans interactivite", () => {
    setOutputHtml()
    context.isTypst = true
    try {
      const options = {
        numeroExercice: 1,
        questionIndex: 0,
        interactivityOn: false,
        expectedRows: ['Prix total'],
        expectedColumns: ['Courses'],
        rowChoices: ['Prix total'],
        columnChoices: ['Courses'],
        cells: [{ row: 'Prix total', column: 'Courses', value: '8 €' }],
      }

      const enonce = EchiquierProblemeElement.create({
        ...options,
        cellFillMode: 'student',
      })
      const correction = EchiquierProblemeElement.create({
        ...options,
        cellFillMode: 'correction',
      })

      expect(enonce).toContain('[...]')
      expect(enonce).toContain(
        'align: (x, _) => if x == 0 { left } else { center }',
      )
      expect(enonce).not.toContain('8 €')
      expect(correction).toContain('8 €')
    } finally {
      context.isTypst = false
    }
  })
})
