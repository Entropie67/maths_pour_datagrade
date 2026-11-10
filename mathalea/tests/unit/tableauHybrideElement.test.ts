import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  creeTableauHybrideElement,
  TableauHybrideElement,
} from '../../src/lib/customElements/TableauHybride'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import { toutAUnPoint } from '../../src/lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

describe('TableauHybrideElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    if (globalThis.CSS == null) {
      vi.stubGlobal('CSS', { escape: (value: string) => value })
    } else if (globalThis.CSS.escape == null) {
      globalThis.CSS.escape = (value: string) => value
    }
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('tableau-hybride')).toBe(TableauHybrideElement)
    expect(listOfCustomElements).toContain('tableau-hybride')
    expect(mathaleaCustomElementsRegistry.get('tableau-hybride')).toBe(
      TableauHybrideElement,
    )
  })

  it('conserve les saisies lors de la verification', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 7
    handleAnswers(
      exercice,
      0,
      {
        bareme: toutAUnPoint,
        L1C1: { value: 5 },
        L1C2: { value: 8 },
      },
      { formatInteractif: 'tableau-hybride' },
    )
    exercice.answers = undefined

    document.body.innerHTML = creeTableauHybrideElement({
      numeroExercice: exercice.numeroExercice,
      questionIndex: 0,
      tableau: {
        rows: [
          [
            { type: 'text', texte: 'Équipe', header: true },
            { type: 'text', texte: 'Tour A', header: true },
            { type: 'text', texte: 'Tour B', header: true },
          ],
          [
            { type: 'text', texte: 'Les comètes', header: true },
            {
              type: 'select',
              id: 'L1C1',
              value: 5,
              choix0: true,
              choices: [{ label: '5', value: '5' }],
            },
            {
              type: 'select',
              id: 'L1C2',
              value: 8,
              choix0: true,
              choices: [{ label: '8', value: '8' }],
            },
          ],
        ],
      },
    })

    const tableau = document.querySelector(
      'tableau-hybride',
    ) as TableauHybrideElement
    const champs = Array.from(
      tableau.querySelectorAll<
        HTMLElement & {
          value: string
          _listeDeroulante?: { select: (index: number) => void }
        }
      >('liste-deroulante[data-cell-id]'),
    )
    champs[0]._listeDeroulante?.select(0)
    champs[1]._listeDeroulante?.select(0)

    const result = TableauHybrideElement.verifQuestion(exercice, 0)

    expect(result.score).toEqual({ nbBonnesReponses: 2, nbReponses: 2 })
    expect(exercice.answers).toEqual({
      'tableau-hybrideEx7Q0': '{"L1C1":"5","L1C2":"8"}',
    })
    expect(champs.map((champ) => champ.value)).toEqual(['5', '8'])
    expect(
      champs.every(
        (champ) => champ.getAttribute('interactivity-on') === 'false',
      ),
    ).toBe(true)
  })

  it('restaure les saisies sérialisées par Capytale', () => {
    const tableau = document.createElement(
      'tableau-hybride',
    ) as TableauHybrideElement
    const premierChamp = document.createElement('math-field')
    premierChamp.dataset.cellId = 'L1C1'
    const secondChamp = document.createElement('math-field')
    secondChamp.dataset.cellId = 'L1C2'
    tableau.append(premierChamp, secondChamp)
    const saisies = { L1C1: '5', L1C2: '8' }

    tableau.value = JSON.stringify(saisies)

    expect(tableau.value).toEqual(saisies)
  })

  it('utilise les styles partages des tableaux MathLive', () => {
    document.body.innerHTML = creeTableauHybrideElement({
      numeroExercice: 0,
      questionIndex: 0,
      tableau: {
        rows: [
          [
            { type: 'text', texte: 'En-tête', header: true },
            { type: 'text', texte: 'Valeur' },
          ],
        ],
      },
    })

    const tableau = document.querySelector('tableau-hybride')
    const table = tableau?.querySelector('table')
    const header = table?.querySelector('th') as HTMLElement

    expect(table?.classList.contains('tableauMathlive')).toBe(true)
    expect(table?.querySelector(':scope > tbody > tr')).not.toBeNull()
    expect(header.getAttribute('style')).toBeNull()
  })

  it('utilise aussi les styles MathLive pour le tableau statique', () => {
    const rendu = creeTableauHybrideElement({
      numeroExercice: 0,
      questionIndex: 0,
      interactivityOn: false,
      tableau: {
        rows: [[{ type: 'text', texte: 'En-tête', header: true }]],
      },
    })

    expect(rendu).toContain('<table class="tableauMathlive">')
    expect(rendu).not.toContain('tableauHybride')
    expect(rendu).not.toContain('<th style=')
  })
})
