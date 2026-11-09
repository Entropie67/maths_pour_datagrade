import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuestionsEtSousQuestions from '../../src/exercices/modèlesExos/40_questions_et_sous_questions'
import { pointsMaxQuestion } from '../../src/lib/interactif/baremeExercice'
import Exercice from '../../src/exercices/Exercice'
import { MultiMathfieldElement } from '../../src/lib/customElements/MultiMathfield'
import { createQuestion } from '../../src/lib/interactif/createQuestion'
import { createSubQuestions } from '../../src/lib/interactif/subQuestions'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'

const subQuestions = [
  {
    question: 'Première question.',
    answer: { value: '3' },
    correction: 'Première correction.',
  },
  {
    question: 'Justifier.',
    correction: 'Justification.',
  },
  {
    question: 'Deuxième question.',
    answer: { value: '5' },
    correction: 'Deuxième correction.',
  },
]

function newExercice(interactif: boolean) {
  const exercice = new Exercice()
  exercice.numeroExercice = 0
  exercice.interactif = interactif
  return exercice
}

describe('createSubQuestions', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('place chaque champ dans son item et chaque correction sous son repère', () => {
    const exercice = newExercice(true)
    const { question, correction } = createSubQuestions(
      exercice,
      0,
      subQuestions,
    )
    // Gabarit lu sans monter le composant : MathLive ne tourne pas sous jsdom.
    const template = document.createElement('template')
    template.innerHTML = question
    const gabarit = document.createElement('template')
    gabarit.innerHTML =
      template.content
        .querySelector('multi-mathfield')
        ?.getAttribute('data-template') ?? ''
    expect(
      Array.from(gabarit.content.querySelectorAll('ol.alpha > li')).map((li) =>
        li.textContent?.trim(),
      ),
    ).toEqual([
      'Première question. %{field0}',
      'Justifier.',
      'Deuxième question. %{field2}',
    ])

    document.body.innerHTML = correction
    expect(
      Array.from(document.querySelectorAll('ol.alpha > li')).map(
        (li) => li.textContent,
      ),
    ).toEqual([
      'Première correction.',
      'Justification.',
      'Deuxième correction.',
    ])
  })

  it('ne compte que les sous-questions à réponse, un point chacune', () => {
    const exercice = newExercice(true)
    createSubQuestions(exercice, 0, subQuestions)
    const valeur = exercice.autoCorrection[0].valeur
    expect(exercice.autoCorrection[0].formatInteractif).toBe('multi-mathfield')
    expect(Object.keys(valeur ?? {})).toEqual(['field0', 'field2', 'bareme'])
    expect(MultiMathfieldElement.pointsMaxQuestion(exercice, 0)).toBe(2)
  })

  it('donne une liste sans champ hors interactivité', () => {
    const { question } = createSubQuestions(newExercice(false), 0, subQuestions)
    expect(question).not.toContain('multi-mathfield')
    expect(question).toContain("<ol class='alpha'>")
  })

  it('numérote a), b), c) en LaTeX', () => {
    setOutputLatex()
    const { question, correction } = createSubQuestions(
      newExercice(true),
      0,
      subQuestions,
    )
    expect(question).toContain('\\begin{enumerate}[label=\\textbf{\\alph*)}]')
    expect(question).not.toContain('%{')
    expect(correction).toContain('\\item Justification.')
  })
})

describe('createSubQuestions avec plusieurs champs par sous-question', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  const plusieursChamps = [
    {
      question: 'Division de $17$ par $5$.<br>$q=$ %{0}$\\quad r=$ %{1}',
      answer: [{ value: 3 }, { value: 2 }],
      correction: 'Première correction.',
    },
    {
      question: 'Division de $-17$ par $5$.<br>$q=$ %{0}$\\quad r=$ %{1}',
      answer: [{ value: -4 }, { value: 3 }],
      correction: 'Deuxième correction.',
    },
  ]

  it('place chaque champ au repère de son énoncé', () => {
    const exercice = newExercice(true)
    const { question } = createSubQuestions(exercice, 0, plusieursChamps)
    const gabarit = question.match(/data-template="([^"]*)"/)?.[1] ?? ''
    expect(gabarit).toContain('$q=$ %{field0}$\\quad r=$ %{field2}')
    expect(gabarit).toContain('$q=$ %{field1}$\\quad r=$ %{field3}')
    expect(Object.keys(exercice.autoCorrection[0].valeur ?? {})).toEqual([
      'field0',
      'field2',
      'field1',
      'field3',
      'bareme',
    ])
    expect(MultiMathfieldElement.pointsMaxQuestion(exercice, 0)).toBe(4)
  })

  it('ajoute les champs à la suite sans repère dans l’énoncé', () => {
    const exercice = newExercice(true)
    const { question } = createSubQuestions(exercice, 0, [
      {
        question: 'Donner deux nombres.',
        answer: [{ value: 1 }, { value: 2 }],
        correction: '',
      },
    ])
    expect(question).toContain('Donner deux nombres. %{field0} %{field1}')
  })

  it('remplace les repères par des points de suspension hors interactivité', () => {
    const { question } = createSubQuestions(
      newExercice(false),
      0,
      plusieursChamps,
    )
    expect(question).not.toContain('%{')
    expect(question).toContain('$q=$ $\\ldots$$\\quad r=$ $\\ldots$')
  })
})

describe('createQuestion', () => {
  beforeEach(() => {
    setOutputHtml()
  })

  it('remplit une question simple avec son champ et sa réponse', () => {
    const exercice = newExercice(true)
    createQuestion(exercice, 0, {
      question: 'Calculer $2+3$.',
      correction: '$2+3=5$',
      answer: { value: 5 },
    })
    expect(exercice.listeQuestions[0]).toContain('mathalea-mathfield')
    expect(exercice.listeCorrections[0]).toBe('$2+3=5$')
    expect(exercice.autoCorrection[0].valeur?.reponse?.value).toBe('5')
  })

  it('ajoute les sous-questions après la consigne et l’explication communes', () => {
    const exercice = newExercice(false)
    createQuestion(exercice, 0, {
      question: 'Consigne.',
      correction: 'Explication.',
      subQuestions,
    })
    expect(exercice.listeQuestions[0]).toMatch(
      /^Consigne\.\n<ol class='alpha'>/,
    )
    expect(exercice.listeCorrections[0]).toMatch(
      /^Explication\.\n<ol class='alpha'>/,
    )
    expect(exercice.autoCorrection[0].formatInteractif).toBe('multi-mathfield')
  })
})

describe('modèle 40_questions_et_sous_questions', () => {
  afterEach(() => vi.restoreAllMocks())

  it('vaut toujours 1 point par question, quel que soit le tirage', () => {
    for (const graine of ['a', 'b', 'c', 'd', 'e', 'f']) {
      for (const nbQuestions of [1, 2, 3, 4]) {
        vi.spyOn(Math, 'random').mockImplementation(seedrandom(graine))
        const exercice = new QuestionsEtSousQuestions()
        exercice.numeroExercice = 0
        exercice.interactif = true
        exercice.nbQuestions = nbQuestions
        exercice.nouvelleVersion()
        for (let i = 0; i < nbQuestions; i++) {
          expect(pointsMaxQuestion(exercice, i)).toBe(1)
        }
        vi.restoreAllMocks()
      }
    }
  })
})
