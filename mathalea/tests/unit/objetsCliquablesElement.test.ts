import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  addObjetsCliquables,
  type ObjetCliquableData,
  ObjetsCliquablesElement,
} from '../../src/lib/customElements/ObjetsCliquablesElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import {
  exerciceInteractif,
  handleAnswers,
} from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

const objets: ObjetCliquableData[] = [
  { type: 'segment', id: 's1', x1: 0, y1: 0, x2: 2, y2: 0, etat: false },
  { type: 'cercle', id: 'c1', x: 1, y: 1, r: 0.5, etat: false },
  { type: 'droite', id: 'd1', x1: 0, y1: 0, x2: 1, y2: 1, etat: false },
  {
    type: 'polygone',
    id: 'poly1',
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    etat: false,
  },
  {
    type: 'polyline',
    id: 'line1',
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0.5 },
      { x: 2, y: 0 },
    ],
    etat: false,
  },
]

function renderQuestion(exercice: Exercice): ObjetsCliquablesElement {
  document.body.innerHTML = `<svg id="figEx3Q0" viewBox="-20 -60 100 100"></svg>${addObjetsCliquables(
    exercice,
    0,
    {
      figureId: 'figEx3Q0',
      objets,
      pixelsParCm: 20,
    },
  )}`
  return document.querySelector('objets-cliquables') as ObjetsCliquablesElement
}

describe('ObjetsCliquablesElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 3
    exercice.nbQuestions = 1
    exercice.interactif = true
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('objets-cliquables')).toBe(
      ObjetsCliquablesElement,
    )
    expect(listOfCustomElements).toContain('objets-cliquables')
    expect(mathaleaCustomElementsRegistry.get('objets-cliquables')).toBe(
      ObjetsCliquablesElement,
    )
  })

  it('cree les conteneurs de resultat et feedback', () => {
    const html = addObjetsCliquables(exercice, 0, {
      figureId: 'figEx3Q0',
      objets,
    })

    expect(html).toContain('<objets-cliquables')
    expect(html).toContain('id="resultatCheckEx3Q0"')
    expect(html).toContain('id="feedbackEx3Q0"')
  })

  it('injecte les hit zones dans la figure cible', () => {
    renderQuestion(exercice)

    const figure = document.querySelector('#figEx3Q0')!
    expect(figure.querySelectorAll('[data-objets-cliquables-host]')).toHaveLength(
      5,
    )
    expect(figure.querySelectorAll('.objet-cliquable-hit-zone')).toHaveLength(5)
    expect(figure.querySelector('#objets-cliquablesEx3Q0-poly1 polygon')).not.toBeNull()
    expect(figure.querySelector('#objets-cliquablesEx3Q0-line1 polyline')).not.toBeNull()
  })

  it('verifie les objets selectionnes et stocke la value restaurable', () => {
    const attendus = objets.map((objet) => ({
      ...objet,
      etat: objet.id === 's1',
    }))
    handleAnswers(
      exercice,
      0,
      { reponse: { value: JSON.stringify(attendus) } },
      { formatInteractif: 'objets-cliquables' },
    )
    renderQuestion(exercice)
    document
      .querySelector<SVGGElement>('#objets-cliquablesEx3Q0-s1')!
      .dispatchEvent(new MouseEvent('click'))

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
    expect(document.querySelector('#resultatCheckEx3Q0')?.innerHTML).toBe('😎')
    expect(exercice.answers?.['objets-cliquablesEx3Q0']).toContain(
      '"etat":true',
    )
  })

  it('restaure les etats avec le setter value', () => {
    const element = renderQuestion(exercice)
    element.value = JSON.stringify(
      objets.map((objet) => ({ ...objet, etat: objet.id === 'c1' })),
    )

    expect(element.value).toContain('"id":"c1"')
    expect(element.value).toContain('"etat":true')
  })

  it('devient inerte quand interactivityOn vaut false', () => {
    const element = renderQuestion(exercice)
    element.interactivityOn = false
    const group = document.querySelector<SVGGElement>(
      '#objets-cliquablesEx3Q0-s1',
    )!
    const hitZone = group.querySelector('.objet-cliquable-hit-zone')

    expect(group.style.cursor).toBe('default')
    expect(hitZone?.getAttribute('pointer-events')).toBe('none')
  })

  it('permet une callback de verification de substitution', () => {
    const callback = vi.fn(() => ({
      isOk: false,
      feedback: 'Retour personnalise.',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }))
    handleAnswers(
      exercice,
      0,
      { reponse: { value: JSON.stringify(objets) } },
      { formatInteractif: 'objets-cliquables' },
    )
    document.body.innerHTML = `<svg id="figEx3Q0" viewBox="-20 -60 100 100"></svg>${addObjetsCliquables(
      exercice,
      0,
      {
        figureId: 'figEx3Q0',
        objets,
        verifyCallback: callback,
      },
    )}`

    const result = exerciceInteractif(
      exercice,
      document.createElement('div'),
      document.createElement('button'),
    )

    expect(callback).toHaveBeenCalled()
    expect(result).toEqual({
      numberOfPoints: 0,
      numberOfQuestions: 1,
      perQuestionIsOk: [false],
    })
    expect(document.querySelector('#feedbackEx3Q0')?.innerHTML).toBe(
      '💡 Retour personnalise.',
    )
  })
})
