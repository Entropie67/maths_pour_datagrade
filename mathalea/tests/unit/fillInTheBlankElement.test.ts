import type { MathfieldElement } from 'mathlive'
import { beforeEach, describe, expect, it } from 'vitest'
import { KeyboardType } from '../../src/lib/interactif/claviers/keyboard'
import { remplisLesBlancs } from '../../src/lib/interactif/questionMathLive'
import Exercice from '../../src/exercices/Exercice'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { verifyFillInTheBlankMathLive } from '../../src/lib/interactif/mathLiveVerifications'
import { setOutputHtml } from '../../src/modules/context'

describe('FillInTheBlankElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('transmet les touches personnalisées au champ interne sans ajouter de bloc standard', () => {
    const exercice = new Exercice()
    exercice.interactif = true
    const dataKeys = [
      ['0', '1', ','],
      ['+', '-', '\\times', 'u_n'],
    ]
    const template = document.createElement('template')
    template.innerHTML = remplisLesBlancs(
      exercice,
      0,
      'u_{n+1}=%{champ1}',
      KeyboardType.clavierEntierementPersonnalisable,
      '\\ldots',
      { dataKeys },
    )
    const wrapper = template.content.querySelector('fill-in-the-blank')!
    const mathfield = wrapper.querySelector('math-field')!
    expect(JSON.parse(wrapper.getAttribute('data-keys')!)).toEqual(dataKeys)
    expect(JSON.parse(mathfield.getAttribute('data-keys')!)).toEqual(dataKeys)
    expect(mathfield.getAttribute('data-keyboard')).toBe('')
  })

  it('verrouille le mathfield interne apres verification', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 3
    handleAnswers(
      exercice,
      0,
      { champ1: { value: '2' } },
      { formatInteractif: 'fill-in-the-blank' },
    )
    document.body.innerHTML = '<span id="resultatCheckEx3Q0"></span>'

    const mathfield = document.createElement(
      'div',
    ) as unknown as MathfieldElement
    mathfield.id = 'champTexteEx3Q0'
    const promptStates = new Map<string, { state: unknown; locked: boolean }>()
    mathfield.getPrompts = () => ['champ1', 'champ2']
    mathfield.getPromptValue = (id: string) => (id === 'champ1' ? '2' : '')
    mathfield.getValue = () => '\\placeholder[champ1]{2}'
    mathfield.setPromptState = (id, state, locked = false) => {
      promptStates.set(id, { state, locked })
    }
    mathfield.readOnly = false

    const result = verifyFillInTheBlankMathLive(exercice, 0, mathfield)

    expect(result.isOk).toBe(true)
    expect(mathfield.classList.contains('corrected')).toBe(true)
    expect(mathfield.readOnly).toBe(true)
    expect(promptStates.get('champ1')?.locked).toBe(true)
    expect(promptStates.get('champ2')?.locked).toBe(true)
  })

  it("annonce chaque champ faux par son rang plutot que par le nom technique du champ, sans imbrication d'un champ dans l'autre", () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 4
    handleAnswers(
      exercice,
      0,
      { champ1: { value: '2' }, champ2: { value: '3' } },
      { formatInteractif: 'fill-in-the-blank' },
    )
    document.body.innerHTML = '<span id="resultatCheckEx4Q0"></span>'

    const mathfield = document.createElement(
      'div',
    ) as unknown as MathfieldElement
    mathfield.id = 'champTexteEx4Q0'
    mathfield.getPrompts = () => ['champ1', 'champ2']
    mathfield.getPromptValue = (id: string) => (id === 'champ1' ? '5' : '9')
    mathfield.getValue = () =>
      '\\placeholder[champ1]{5}\\placeholder[champ2]{9}'
    mathfield.setPromptState = () => {}
    mathfield.readOnly = false

    const result = verifyFillInTheBlankMathLive(exercice, 0, mathfield)

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('1ère réponse')
    expect(result.feedback).toContain('2e réponse')
    expect(result.feedback).not.toContain('Champ')
    expect(result.feedback.match(/réponse\s*:/g)).toHaveLength(2)
  })
})
