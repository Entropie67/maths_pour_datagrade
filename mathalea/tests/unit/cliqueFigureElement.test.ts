import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  coopmathsActionLight,
  coopmathsActionLightest,
} from '../../src/lib/colors'
import {
  CliqueFigureElement,
  addCliqueFigure,
  prepareCliqueFigure,
} from '../../src/lib/customElements/CliqueFigureElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import {
  exerciceInteractif,
  setCliqueFigure,
} from '../../src/lib/interactif/gestionInteractif'
import { interactivityTypeToCustomElementFormat } from '../../src/lib/types'
import { setOutputHtml } from '../../src/modules/context'

describe('CliqueFigureElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 3
    exercice.nbQuestions = 1
    exercice.autoCorrection[0] = {}
    exercice.cliqueFiguresArray = [
      [
        { id: 'figureA', solution: true },
        { id: 'figureB', solution: false },
      ],
    ]
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('clique-figure')).toBe(CliqueFigureElement)
    expect(listOfCustomElements).toContain('clique-figure')
    expect(mathaleaCustomElementsRegistry.get('clique-figure')).toBe(
      CliqueFigureElement,
    )
  })

  it('normalise le format cliqueFigure historique pour le dispatch', () => {
    expect(interactivityTypeToCustomElementFormat('cliqueFigure')).toBe(
      'clique-figure',
    )
  })

  it('expose la sélection restaurée et la lecture seule sans révéler la solution', () => {
    document.body.innerHTML = `
      <div id="figureB" aria-label="Un tracé à identifier."></div>
      <div id="figureA"></div>
      ${addCliqueFigure(exercice, 0)}
    `
    const host = document.querySelector('clique-figure') as CliqueFigureElement
    const figureA = document.getElementById('figureA')!
    const figureB = document.getElementById('figureB')!
    expect(figureB.getAttribute('aria-label')).toBe(
      'Figure 1. Un tracé à identifier.',
    )
    expect(figureA.getAttribute('aria-label')).toBe('Figure 2.')
    expect(figureA.getAttribute('aria-checked')).toBe('false')
    host.value = ['figureB']
    expect(figureB.getAttribute('aria-checked')).toBe('true')
    expect(figureA.getAttribute('aria-checked')).toBe('false')
    host.interactivityOn = false
    expect(figureB.getAttribute('aria-disabled')).toBe('true')
    expect(figureB.getAttribute('tabindex')).toBe('-1')
    host.interactivityOn = true
    expect(figureB.getAttribute('aria-disabled')).toBe('false')
    expect(figureB.getAttribute('tabindex')).toBe('0')
    expect(figureB.getAttribute('aria-checked')).toBe('true')
    expect(figureB.getAttribute('aria-label')).toBe(
      'Figure 1. Un tracé à identifier.',
    )
  })

  it('attend les figures sans créer un hôte orphelin avant leur affichage', () => {
    prepareCliqueFigure(exercice)
    expect(document.querySelector('clique-figure')).toBeNull()
    document.body.innerHTML = `
      <div id="figureA"></div>
      <div id="figureB"></div>
      ${addCliqueFigure(exercice, 0)}
    `
    prepareCliqueFigure(exercice)
    expect(document.querySelectorAll('clique-figure')).toHaveLength(1)
    expect(document.getElementById('figureA')?.getAttribute('role')).toBe(
      'checkbox',
    )
  })

  it('prepare, verifie et fige les figures existantes', () => {
    setCliqueFigure(exercice.autoCorrection[0])
    document.body.innerHTML = `
      <div id="exercice3">
        <div id="figureA"></div>
        <div id="figureB"></div>
        <span id="resultatCheckEx3Q0"></span>
      </div>
    `
    prepareCliqueFigure(exercice)
    const host = document.querySelector('clique-figure') as CliqueFigureElement
    const figureA = document.getElementById('figureA')!
    const figureB = document.getElementById('figureB')!

    figureA.click()
    const result = CliqueFigureElement.verifQuestion(exercice, 0)

    expect(host.id).toBe('clique-figureEx3Q0')
    expect(result).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
    expect(document.getElementById('resultatCheckEx3Q0')?.innerHTML).toBe('😎')
    expect(exercice.answers?.figureA).toBe('1')
    expect(exercice.answers?.['clique-figureEx3Q0']).toBe('["figureA"]')
    expect(
      (figureA as typeof figureA & { hasMathaleaListener: boolean })
        .hasMathaleaListener,
    ).toBe(false)
    expect(
      (figureB as typeof figureB & { hasMathaleaListener: boolean })
        .hasMathaleaListener,
    ).toBe(false)
  })

  it('corrige le format historique par le dispatch central', () => {
    exercice.autoCorrection[0].formatInteractif = 'cliqueFigure'
    document.body.innerHTML = `
      <div id="exercice3">
        <div id="figureA"></div>
        <div id="figureB"></div>
        <span id="resultatCheckEx3Q0"></span>
      </div>
    `
    prepareCliqueFigure(exercice)
    document.getElementById('figureA')?.click()

    const result = exerciceInteractif(
      exercice,
      document.createElement('div'),
      document.createElement('button'),
    )

    expect(result).toEqual({
      numberOfPoints: 1,
      numberOfQuestions: 1,
      perQuestionIsOk: [true],
    })
    expect(exercice.answers?.figureA).toBe('1')
  })

  it('permet plusieurs sélections et désélections avant la validation', () => {
    document.body.innerHTML = `
      <div id="exercice3">
        <div id="figureA"></div>
        <div id="figureB"></div>
        ${addCliqueFigure(exercice, 0)}
        <span id="resultatCheckEx3Q0"></span>
      </div>
    `
    const host = document.querySelector('clique-figure') as CliqueFigureElement
    const figureA = document.getElementById('figureA')!
    const figureB = document.getElementById('figureB')!
    figureA.dispatchEvent(new MouseEvent('mouseenter'))
    expect(figureA.style.filter).toBe(
      `drop-shadow(0 0 2px ${coopmathsActionLightest})`,
    )
    expect(figureA.style.outline).toBe('')
    expect(figureA.style.cursor).toBe('pointer')

    figureA.click()
    expect(figureA.style.filter).toBe('')
    figureB.click()
    expect(host.value).toBe('["figureA","figureB"]')
    expect(figureA.style.outline).toBe(figureB.style.outline)
    expect(figureA.style.outline).toBe(`3px solid ${coopmathsActionLight}`)
    expect(figureA.style.outlineOffset).toBe('-3px')

    figureB.click()
    expect(host.value).toBe('["figureA"]')
    expect(figureB.style.outline).toBe('none')
    expect(figureB.style.filter).toBe(
      `drop-shadow(0 0 2px ${coopmathsActionLightest})`,
    )
    figureB.dispatchEvent(new MouseEvent('mouseleave'))
    expect(figureB.style.filter).toBe('')
    expect(CliqueFigureElement.verifQuestion(exercice, 0).score).toEqual({
      nbBonnesReponses: 1,
      nbReponses: 1,
    })
  })
})
