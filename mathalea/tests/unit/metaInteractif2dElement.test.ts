import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import ConservationTransformation from '../../src/exercices/5e/5G3B'
import ListeDeroulanteElement from '../../src/lib/customElements/ListeDeroulanteElement'
import { MetaInteractif2dElement } from '../../src/lib/customElements/MetaInteractif2dElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import {
  exerciceInteractif,
  handleAnswers,
} from '../../src/lib/interactif/gestionInteractif'
import { interactivityTypeToCustomElementFormat } from '../../src/lib/types'
import { pointsMaxExercice } from '../../src/lib/interactif/baremeExercice'
import { toutAUnPoint } from '../../src/lib/interactif/fonctionsBaremes'
import { setOutputHtml } from '../../src/modules/context'

describe('MetaInteractif2dElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 5
    exercice.nbQuestions = 1
    exercice.interactif = true
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('meta-interactif-2d')).toBe(
      MetaInteractif2dElement,
    )
    expect(listOfCustomElements).toContain('meta-interactif-2d')
    expect(mathaleaCustomElementsRegistry.get('meta-interactif-2d')).toBe(
      MetaInteractif2dElement,
    )
  })

  it('normalise le format MetaInteractif2d historique pour le dispatch', () => {
    expect(interactivityTypeToCustomElementFormat('MetaInteractif2d')).toBe(
      'meta-interactif-2d',
    )
  })

  it('cree un wrapper en conservant le math-field interne', () => {
    const html = MetaInteractif2dElement.create({
      numeroExercice: 5,
      questionIndex: 0,
      fieldIndex: 0,
      innerHtml: '<math-field id="MetaInteractif2dEx5Q0field0"></math-field>',
    })

    expect(html).toContain('<meta-interactif-2d')
    expect(html).toContain('id="meta-interactif-2dEx5Q0field0"')
    expect(html).toContain('id="MetaInteractif2dEx5Q0field0"')
  })

  it('verifie une question par le dispatch central', () => {
    handleAnswers(
      exercice,
      0,
      { field0: { value: '7' } },
      { formatInteractif: 'MetaInteractif2d' },
    )
    document.body.innerHTML = MetaInteractif2dElement.create({
      numeroExercice: 5,
      questionIndex: 0,
      fieldIndex: 0,
      innerHtml: '<span id="MetaInteractif2dEx5Q0field0"></span>',
    })
    const field = document.getElementById(
      'MetaInteractif2dEx5Q0field0',
    ) as HTMLElement & {
      getPromptValue: (prompt: string) => string
      setPromptState: (prompt: string, state: string, value: boolean) => void
    }
    field.getPromptValue = vi.fn(() => '7')
    field.setPromptState = vi.fn()

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
    expect(document.getElementById('resultatCheckEx5Q0')?.innerHTML).toBe('😎')
    expect(field.setPromptState).toHaveBeenCalledWith('champ1', 'correct', true)
    expect(
      document.getElementById('resultatCheckEx5Q0field0')?.textContent,
    ).toBe('😎')
    expect(pointsMaxExercice(exercice)).toBe(1)
    expect(exercice.answers?.MetaInteractif2dEx5Q0).toBe(
      '{"MetaInteractif2dEx5Q0field0":"7"}',
    )
  })

  it.each([
    ['7', 'conserve les angles', 4, '😎', '😎'],
    ['8', 'conserve les longueurs', 2, '☹️', '☹️'],
    ['', '', 2, '☹️', '☹️'],
  ])(
    'corrige les champs et les listes (%s, %s)',
    (saisie, choix, points, smileyChamp, smileyListe) => {
      handleAnswers(
        exercice,
        0,
        {
          bareme: toutAUnPoint,
          field0: { value: '7' },
          field1: { value: '5' },
          field2: { value: 'conserve les angles' },
          field3: { value: 'conserve les longueurs' },
        },
        { formatInteractif: 'MetaInteractif2d' },
      )
      document.body.innerHTML =
        [0, 1]
          .map((index) =>
            MetaInteractif2dElement.create({
              numeroExercice: 5,
              questionIndex: 0,
              fieldIndex: index,
              innerHtml: `<span id="MetaInteractif2dEx5Q0field${index}"></span>`,
            }),
          )
          .join('') +
        [2, 3]
          .map((index) =>
            ListeDeroulanteElement.create({
              id: `liste-deroulanteEx5Q0field${index}`,
              choices: ['', 'conserve les angles', 'conserve les longueurs'],
            }),
          )
          .join('')
      for (const index of [0, 1]) {
        const field = document.getElementById(
          `MetaInteractif2dEx5Q0field${index}`,
        ) as HTMLElement & {
          getPromptValue: () => string
          setPromptState: () => void
        }
        field.getPromptValue = vi.fn(() => (index === 0 ? saisie : '5'))
        field.setPromptState = vi.fn()
      }
      ;(
        document.getElementById(
          'liste-deroulanteEx5Q0field2',
        ) as ListeDeroulanteElement
      ).value = choix
      ;(
        document.getElementById(
          'liste-deroulanteEx5Q0field3',
        ) as ListeDeroulanteElement
      ).value = 'conserve les longueurs'

      expect(pointsMaxExercice(exercice)).toBe(4)
      const result = MetaInteractif2dElement.verifQuestion(exercice, 0)
      expect(result.score).toEqual({ nbBonnesReponses: points, nbReponses: 4 })
      expect(result.isOk).toBe(points === 4)
      expect(
        document.getElementById('resultatCheckEx5Q0field0')?.textContent,
      ).toBe(smileyChamp)
      expect(
        document.getElementById('resultatCheckEx5Q0field1')?.textContent,
      ).toBe('😎')
      expect(
        document.getElementById('resultatCheckEx5Q0field2')?.textContent,
      ).toBe(smileyListe)
      expect(
        document.getElementById('resultatCheckEx5Q0field3')?.textContent,
      ).toBe('😎')
      expect(
        (
          document.getElementById(
            'liste-deroulanteEx5Q0field2',
          ) as ListeDeroulanteElement
        ).interactivityOn,
      ).toBe(false)
    },
  )

  it.each(['1', '2', '3', '4', '5'])(
    'garde quatre points par question dans 5G3B pour s=%s',
    (sup) => {
      for (const sup2 of [false, true]) {
        const exercise = new ConservationTransformation()
        exercise.numeroExercice = 5
        exercise.interactif = true
        exercise.nbQuestions = 2
        exercise.sup = sup
        exercise.sup2 = sup2
        exercise.nouvelleVersion()
        expect(exercise.autoCorrection).toHaveLength(2)
        expect(pointsMaxExercice(exercise)).toBe(8)
      }
    },
  )
})
