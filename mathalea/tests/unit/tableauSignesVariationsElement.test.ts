import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  addTableauSignesVariations,
  TableauSignesVariationsElement,
} from '../../src/lib/customElements/TableauSignesVariationsElement'
import type { TableauSVConfig } from '../../src/lib/interactif/tableauSignesVariations/types'
import { setOutputHtml } from '../../src/modules/context'

const config: TableauSVConfig = {
  colonnes: [
    { valeur: '0', editable: true, expected: '0' },
    { valeur: '1' },
  ],
  lignes: [
    {
      type: 'signe',
      label: 'f',
      cellules: [
        { symbole: '+', editable: true, expected: '+' },
        { symbole: '' },
        { symbole: '' },
      ],
    },
  ],
}

describe('TableauSignesVariationsElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('rehydrate son etat depuis sa value JSON', () => {
    const source = new TableauSignesVariationsElement()
    source.config = config
    source.update({ L0C0: '0', L1C0: '+' })

    const savedValue = source.value
    const target = new TableauSignesVariationsElement()
    target.config = config
    target.value = savedValue

    expect(typeof savedValue).toBe('string')
    expect(target.getState()).toEqual({ L0C0: '0', L1C0: '+' })
    expect(target.value).toBe(savedValue)
  })

  it('stocke sa value restaurable dans exercice.answers', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 5
    document.body.innerHTML = addTableauSignesVariations(exercice, 0, {
      config,
    })
    const element = document.querySelector(
      'tableau-signes-variations',
    ) as TableauSignesVariationsElement
    element.connectedCallback()
    element.update({ L0C0: '0', L1C0: '+' })

    const result = TableauSignesVariationsElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(true)
    expect(exercice.answers).toEqual({
      'tableau-signes-variationsEx5Q0': element.value,
    })
    const restored = new TableauSignesVariationsElement()
    restored.config = config
    restored.value = exercice.answers?.['tableau-signes-variationsEx5Q0'] ?? ''
    expect(restored.getState()).toEqual({ L0C0: '0', L1C0: '+' })
  })

  it('respecte interactivityOn=false dans les options de creation', () => {
    const html = TableauSignesVariationsElement.create({
      config,
      interactivityOn: false,
    })
    document.body.innerHTML = html

    const element = document.querySelector(
      'tableau-signes-variations',
    ) as TableauSignesVariationsElement
    element.connectedCallback()

    expect(element.interactivityOn).toBe(false)
    expect(element.getAttribute('interactivity-on')).toBe('false')
    expect(
      element.shadowRoot?.querySelectorAll('.tab-sv__cell--editable').length,
    ).toBe(0)
    expect(element.shadowRoot?.querySelector('.tab-sv__toolbar')).toBeNull()
  })

  it("ne cumule pas les écouteurs globaux de la barre d'outils à chaque rendu", () => {
    const ajouts = vi.spyOn(document, 'addEventListener')
    const retraits = vi.spyOn(document, 'removeEventListener')
    const actifs = () =>
      ['mousedown', 'keydown'].reduce(
        (total, type) =>
          total +
          ajouts.mock.calls.filter(([t]) => t === type).length -
          retraits.mock.calls.filter(([t]) => t === type).length,
        0,
      )

    const element = new TableauSignesVariationsElement()
    element.config = config
    document.body.appendChild(element)
    for (let i = 0; i < 5; i++) element.update({ L0C0: '0', L1C0: '+' })

    // une seule barre d'outils (2 écouteurs) reste branchée
    expect(actifs()).toBe(2)

    element.remove()
    expect(actifs()).toBe(0)
    vi.restoreAllMocks()
  })
})
