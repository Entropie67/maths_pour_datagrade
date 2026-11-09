import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  addMathaleaCouteauSuisse,
  MathaleaCouteauSuisseElement,
} from '../../src/lib/customElements/MathaleaCouteauSuisse'
import { MathaleaQcmElement } from '../../src/lib/customElements/MathaleaQcm'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import { exerciceInteractif } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'

const propositions = [
  { texte: '$4$', statut: true },
  { texte: '$5$', statut: false },
]

describe('MathaleaCouteauSuisseElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 3
    exercice.nbQuestions = 1
    exercice.autoCorrection[0] = {}
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('mathalea-couteau-suisse')).toBe(
      MathaleaCouteauSuisseElement,
    )
    expect(listOfCustomElements).toContain('mathalea-couteau-suisse')
    expect(mathaleaCustomElementsRegistry.get('mathalea-couteau-suisse')).toBe(
      MathaleaCouteauSuisseElement,
    )
  })

  it('delegue la verification aux elements declares', () => {
    document.body.innerHTML = addMathaleaCouteauSuisse(exercice, 0, {
      contenu: MathaleaQcmElement.create({
        numeroExercice: exercice.numeroExercice,
        questionIndex: 0,
        propositions,
      }),
      elements: [
        {
          formatInteractif: 'mathalea-qcm',
          autoCorrection: {
            propositions: propositions.map((proposition) => ({
              ...proposition,
            })),
            options: {},
          },
        },
      ],
    })
    const qcm = document.querySelector('mathalea-qcm') as MathaleaQcmElement
    qcm.value = '[0]'

    const result = MathaleaCouteauSuisseElement.verifQuestion(exercice, 0)

    expect(result).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-couteau-suisse',
    )
    expect(exercice.answers?.['mathalea-qcmEx3Q0']).toBe('[0]')
    expect(exercice.answers?.['mathalea-couteau-suisseEx3Q0']).toContain(
      'mathalea-qcmEx3Q0',
    )
    expect(qcm.interactivityOn).toBe(false)
  })

  it('fonctionne via le dispatch interactif central', () => {
    document.body.innerHTML = addMathaleaCouteauSuisse(exercice, 0, {
      contenu: MathaleaQcmElement.create({
        numeroExercice: exercice.numeroExercice,
        questionIndex: 0,
        propositions,
      }),
      elements: [
        {
          formatInteractif: 'mathalea-qcm',
          autoCorrection: {
            propositions: propositions.map((proposition) => ({
              ...proposition,
            })),
            options: {},
          },
        },
      ],
    })
    const qcm = document.querySelector('mathalea-qcm') as MathaleaQcmElement
    qcm.value = '[0]'

    const result = exerciceInteractif(
      exercice,
      document.createElement('div'),
      document.createElement('button'),
    )

    expect(result).toMatchObject({
      numberOfPoints: 1,
      numberOfQuestions: 1,
      perQuestionIsOk: [true],
    })
  })

  it('agrège plusieurs enfants du même type avec leurs propres index DOM', () => {
    const secondPropositions = [
      { texte: '$6$', statut: false },
      { texte: '$7$', statut: true },
    ]
    document.body.innerHTML = addMathaleaCouteauSuisse(exercice, 0, {
      contenu: [
        MathaleaQcmElement.create({
          numeroExercice: exercice.numeroExercice,
          questionIndex: 1,
          propositions,
        }),
        MathaleaQcmElement.create({
          numeroExercice: exercice.numeroExercice,
          questionIndex: 2,
          propositions: secondPropositions,
        }),
      ].join(''),
      elements: [
        {
          formatInteractif: 'mathalea-qcm',
          questionIndex: 1,
          autoCorrection: { propositions },
        },
        {
          formatInteractif: 'mathalea-qcm',
          questionIndex: 2,
          autoCorrection: { propositions: secondPropositions },
        },
      ],
    })
    const qcms = document.querySelectorAll<MathaleaQcmElement>('mathalea-qcm')
    qcms[0].value = '[0]'
    qcms[1].value = '[1]'

    const result = MathaleaCouteauSuisseElement.verifQuestion(exercice, 0)

    expect(result.score).toEqual({ nbBonnesReponses: 2, nbReponses: 2 })
    expect(result.isOk).toBe(true)
    expect(exercice.autoCorrection).toHaveLength(1)
  })

  it('restaure les valeurs sérialisées de ses enfants', () => {
    document.body.innerHTML = addMathaleaCouteauSuisse(exercice, 0, {
      contenu: MathaleaQcmElement.create({
        numeroExercice: exercice.numeroExercice,
        questionIndex: 0,
        propositions,
      }),
      elements: [{ formatInteractif: 'mathalea-qcm' }],
    })
    const wrapper = document.querySelector(
      'mathalea-couteau-suisse',
    ) as MathaleaCouteauSuisseElement
    const qcm = document.querySelector('mathalea-qcm') as MathaleaQcmElement

    wrapper.value = JSON.stringify({ [qcm.id]: '[1]' })

    expect(qcm.value).toBe('[1]')
  })

  it('conserve son contenu en sortie LaTeX', () => {
    setOutputLatex()

    const rendu = addMathaleaCouteauSuisse(exercice, 0, {
      contenu: 'contenu statique',
      elements: [
        {
          formatInteractif: 'mathalea-qcm',
          autoCorrection: {
            propositions,
            options: {},
          },
        },
      ],
    })

    expect(rendu).toBe('contenu statique')
    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-couteau-suisse',
    )
  })
})
