import { afterEach, describe, expect, it, vi } from 'vitest'
import { tick } from 'svelte'
import QuestionContext from '../../../src/components/display/eleve/QuestionContext.svelte'
import { composeQuestionContext } from '../../../src/lib/components/questionContext'

vi.mock('../../../src/lib/mathalea', () => ({ mathaleaRenderDiv: vi.fn() }))

let connected = 0
let disconnected = 0
class ContextFigure extends HTMLElement {
  connectedCallback() {
    connected++
  }
  disconnectedCallback() {
    disconnected++
  }
}
if (!customElements.get('context-test-figure')) {
  customElements.define('context-test-figure', ContextFigure)
}
afterEach(() => {
  document.body.innerHTML = ''
})

describe('contexte partagé entre les pages', () => {
  it('assemble les parties non vides dans leur ordre sans séparateur superflu', () => {
    expect(
      composeQuestionContext({ consigne: '', introduction: '  ' }, 'Question.'),
    ).toBe('Question.')
    expect(
      composeQuestionContext(
        { consigne: 'Consigne.', introduction: 'Introduction.' },
        'Question.',
      ),
    ).toBe('Consigne.<br>\nIntroduction.<br>\nQuestion.')
  })

  it('garde la figure pour un contexte identique et la détruit quand le contexte change', async () => {
    connected = disconnected = 0
    const target = document.createElement('div')
    document.body.append(target)
    const content =
      '<context-test-figure id="shared-figure"></context-test-figure>'
    // Les props héritées de Svelte restent modifiables par $set en mode compatibilité.
    const { createClassComponent } = await import('svelte/legacy')
    const component = createClassComponent({
      component: QuestionContext,
      target,
      props: { content, exerciseIndex: 0, zoom: 1 },
    })
    const figure = target.querySelector('#shared-figure')!
    figure.setAttribute('student-state', 'conservé')
    component.$set({ content, exerciseIndex: 0, zoom: 2 })
    await tick()
    expect(target.querySelector('#shared-figure')).toBe(figure)
    expect(connected).toBe(1)
    expect(disconnected).toBe(0)
    component.$set({ content: `Nouveau contexte.${content}` })
    await tick()
    expect(target.querySelectorAll('#shared-figure')).toHaveLength(1)
    expect(target.querySelector('#shared-figure')).not.toBe(figure)
    expect(connected).toBe(2)
    expect(disconnected).toBe(1)
    component.$set({ exerciseIndex: 1 })
    await tick()
    expect(connected).toBe(3)
    expect(disconnected).toBe(2)
    component.$destroy()
    expect(disconnected).toBe(3)
  })

  it('conserve les éléments voisins quand le contexte change ou devient vide', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    const { createClassComponent } = await import('svelte/legacy')
    const component = createClassComponent({
      component: QuestionContext,
      target,
      props: { content: 'Contexte A.', exerciseIndex: 0, zoom: 1 },
    })
    const voisin = document.createElement('p')
    voisin.id = 'voisin'
    target.append(voisin)
    component.$set({ content: '', exerciseIndex: 1 })
    await tick()
    expect(target.querySelector('#voisin')).toBe(voisin)
    expect(target.textContent).not.toContain('Contexte A.')
    component.$set({ content: 'Contexte A.', exerciseIndex: 0 })
    await tick()
    expect(target.querySelector('#voisin')).toBe(voisin)
    expect(target.textContent).toContain('Contexte A.')
    component.$destroy()
  })
})
