import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('mathlive', () => {
  class MockMathfieldElement extends HTMLElement {
    value = ''
    readOnly = false

    getValue() {
      return this.value
    }

    setValue(value: string) {
      this.value = value
    }
  }
  if (customElements.get('math-field') == null)
    customElements.define('math-field', MockMathfieldElement)
  return { MathfieldElement: MockMathfieldElement }
})

import Exercice from '../../src/exercices/Exercice'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import {
  addMathaleaSolveur,
  baremeSolveur,
  MathaleaSolveurElement,
  modeSolveur,
  optionsSolveur,
} from '../../src/lib/customElements/MathaleaSolveurElement'
import { isEquivalentInequality } from '../../src/lib/interactif/checks/inequalityChecks'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

describe('MathaleaSolveurElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 4
    exercice.interactif = true
    exercice.autoCorrection[0] = {}
  })

  it("accepte 8s=4\\times5 pour \\frac{8}{5}=\\frac{4}{s} quand l'inconnue est s", () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '\\dfrac{8}{5}=\\dfrac{4}{s}',
      variable: 's',
    })
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    const input = solver.querySelectorAll('math-field')[1] as
      (HTMLElement & { value: string }) | undefined
    if (input == null) throw new Error('Champ de saisie absent')
    expect(input.dataset.inconnue).toBe('s')
    input.value = '8s=4\\times5'
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.evaluate()

    expect(solver.querySelector('.message')?.textContent).toBe(
      "L'équation saisie est équivalente à l'équation attendue.",
    )
  })

  it("n'écrit que l'équation hors interactivité", () => {
    exercice.interactif = false

    expect(addMathaleaSolveur(exercice, 0, { initial: '2x+4=10' })).toBe(
      '$2x+4=10$',
    )
  })

  it("n'affiche que l'équation quand l'élément est créé figé", () => {
    document.body.innerHTML =
      '<mathalea-solveur id="s" initial="2x+4=10" interactivity-on="false"></mathalea-solveur>'
    const solver = document.querySelector('mathalea-solveur')

    expect(solver?.querySelector('math-field')).toBeNull()
    expect(solver?.querySelector('button')).toBeNull()
    expect(solver?.textContent).toContain('2x+4=10')
  })

  it('enregistre le composant dans les registres MathALÉA', () => {
    expect(customElements.get('mathalea-solveur')).toBe(MathaleaSolveurElement)
    expect(listOfCustomElements).toContain('mathalea-solveur')
    expect(mathaleaCustomElementsRegistry.get('mathalea-solveur')).toBe(
      MathaleaSolveurElement,
    )
  })

  it("rend seulement l'équation initiale en vue Typst", () => {
    const previousIsTypst = context.isTypst
    context.isTypst = true
    try {
      expect(
        MathaleaSolveurElement.create({ initial: '\\dfrac{2x}{3}=5' }),
      ).toBe('$\\dfrac{2x}{3}=5$')
    } finally {
      context.isTypst = previousIsTypst
    }
  })

  it("rend seulement l'équation initiale en export LaTeX", () => {
    setOutputLatex()

    expect(MathaleaSolveurElement.create({ initial: '\\dfrac{2x}{3}=5' })).toBe(
      '$\\dfrac{2x}{3}=5$',
    )
  })

  it("isole le conteneur du champ des styles globaux de la classe 'field'", () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
    })
    const solver = document.querySelector('mathalea-solveur')

    expect(solver?.querySelectorAll('.solver-field')).toHaveLength(2)
    expect(solver?.querySelector('.field')).toBeNull()
    expect(solver?.querySelector('style')?.textContent).toContain(
      '.solver-field { display: block; min-width: 0; margin: 0; padding: 0; border: 0; background: transparent; }',
    )
    expect(solver?.querySelector('style')?.textContent).toContain(
      'math-field { display: block !important; width: 100%; margin: 0 !important; padding: 0; box-sizing: border-box; }',
    )
    expect(solver?.querySelector('style')?.textContent).toContain(
      'math-field::part(container) { border: none !important; }',
    )
    expect(solver?.querySelector('style')?.textContent).toContain(
      'math-field:not(.solver-readonly) { border: 1px solid #aab2bd !important; border-radius: .35rem; }',
    )
    expect(solver?.querySelector('style')?.textContent).toContain(
      'math-field.solver-readonly::part(container) { border: none !important; outline: none !important; box-shadow: none !important; background: transparent; }',
    )
    expect(solver?.querySelector('style')?.textContent).toContain(
      '.line.invalid math-field::part(container) { border: none; background: transparent; }',
    )
    const fields = solver?.querySelectorAll('math-field') ?? []
    expect(fields[0]?.classList.contains('solver-readonly')).toBe(true)
    expect(fields[1]?.classList.contains('solver-readonly')).toBe(false)
  })

  it('ajoute une ligne après une transformation équivalente', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
    })
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    const input = solver.querySelectorAll('math-field')[1] as
      (HTMLElement & { value: string }) | undefined
    if (input == null) throw new Error('Champ de saisie absent')
    expect(input.id).toBe('mathalea-solveurEx4Q0-line-1')
    expect(input.dataset.listenerAdded).toBe('true')
    expect(input.dataset.keyboard).toBe('numbersInconnue basicOperations2')
    expect(input.dataset.inconnue).toBe('x')
    input.value = '2x=6'
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    const button = solver.querySelector<HTMLButtonElement>('.evaluate')
    expect(button).not.toBeNull()
    solver.evaluate()

    expect(solver.value).toBe('2x=6')
    expect({
      count: solver.querySelectorAll('math-field').length,
      message: solver.querySelector('.message')?.textContent,
    }).toEqual({ count: 3, message: expect.stringContaining('équivalente') })
  })

  it.each(['x=3', '3=x'])(
    "n'ajoute pas de ligne après la forme résolue %s",
    (solution) => {
      document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
        initial: '2x=6',
      })
      const solver = document.querySelector(
        'mathalea-solveur',
      ) as MathaleaSolveurElement
      const input = solver.querySelectorAll('math-field')[1] as
        (HTMLElement & { value: string }) | undefined
      if (input == null) throw new Error('Champ de saisie absent')
      input.value = solution
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      solver.evaluate()

      expect(solver.value).toBe(solution)
      expect(solver.querySelectorAll('math-field')).toHaveLength(2)
      expect(solver.interactivityOn).toBe(false)
      expect(solver.querySelector('.message')?.textContent).toBe(
        "L'équation est résolue.",
      )
    },
  )

  it.each(['x<3', '3>x'])(
    "n'ajoute pas de ligne après l'inéquation résolue %s",
    (solution) => {
      document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
        initial: '2x<6',
        kind: 'inequation',
      })
      const solver = document.querySelector(
        'mathalea-solveur',
      ) as MathaleaSolveurElement
      const input = solver.querySelectorAll('math-field')[1] as
        (HTMLElement & { value: string }) | undefined
      if (input == null) throw new Error('Champ de saisie absent')
      input.value = solution
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      solver.evaluate()

      expect(solver.value).toBe(solution)
      expect(solver.querySelectorAll('math-field')).toHaveLength(2)
      expect(solver.interactivityOn).toBe(false)
      expect(solver.querySelector('.message')?.textContent).toBe(
        "L'inéquation est résolue.",
      )
    },
  )

  it('fige une étape fausse en mode évaluation', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
      mode: 'evaluation',
    })
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    const input = solver.querySelectorAll('math-field')[1] as
      (HTMLElement & { value: string }) | undefined
    if (input == null) throw new Error('Champ de saisie absent')
    input.value = '2x=5'
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.querySelector<HTMLButtonElement>('.evaluate')?.click()

    expect(solver.interactivityOn).toBe(false)
    expect(solver.querySelector('.message')?.textContent).toContain(
      "n'est pas équivalente",
    )
  })

  it('conserve une étape fausse en rouge et reprend depuis la dernière étape correcte', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
      mode: 'entrainement',
    })
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    const firstAttempt = solver.querySelectorAll('math-field')[1] as
      (HTMLElement & { value: string }) | undefined
    if (firstAttempt == null) throw new Error('Champ de saisie absent')
    firstAttempt.value = '2x=5'
    firstAttempt.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.evaluate()

    expect(solver.querySelectorAll('.line.invalid')).toHaveLength(1)
    expect(solver.querySelector('.line.invalid')?.textContent).toContain(
      'Étape incorrecte',
    )
    expect(solver.value).toBe('')
    expect(solver.querySelectorAll('math-field')).toHaveLength(3)
    expect(
      [...solver.querySelectorAll('.step')].map((step) => step.textContent),
    ).toEqual(['Énoncé', 'Étape 1', 'Étape 1'])

    const secondAttempt = solver.querySelectorAll('math-field')[2] as
      (HTMLElement & { value: string }) | undefined
    if (secondAttempt == null) throw new Error('Nouveau champ de saisie absent')
    secondAttempt.value = '2x=6'
    secondAttempt.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.evaluate()

    expect(solver.value).toBe('2x=6')
    expect(solver.querySelectorAll('.line.invalid')).toHaveLength(1)
    expect(
      [...solver.querySelectorAll('.step')].map((step) => step.textContent),
    ).toEqual(['Énoncé', 'Étape 1', 'Étape 1', 'Étape 2'])
    expect(solver.querySelector('.message')?.textContent).toContain(
      'équivalente',
    )
  })

  it('corrige la dernière ligne avec la réponse de handleAnswers', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
    })
    exercice.autoCorrection[0].valeur = { reponse: { value: 'x=3' } }
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    expect(solver.querySelector('#resultatCheckEx4Q0')).not.toBeNull()
    expect(solver.querySelector('#feedbackEx4Q0')).not.toBeNull()
    solver.value = 'x=3'

    expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
    expect(exercice.answers?.[solver.id]).toBe('x=3')
    expect(solver.interactivityOn).toBe(false)
    expect(document.querySelector('#resultatCheckEx4Q0')?.textContent).toBe(
      '😎',
    )
  })

  it.each([
    ['evaluation', '4x=6', 'x=\\dfrac{3}{2}', 'x=\\dfrac{6}{4}', 1],
    ['entrainement', '4x=6', 'x=\\dfrac{3}{2}', '\\dfrac{6}{4}=x', 2],
    ['evaluation', '2x=6', 'x=3', 'x=\\dfrac{6}{2}', 1],
    ['entrainement', '2x=-6', 'x=-3', 'x=\\dfrac{-6}{2}', 2],
    ['evaluation', '7x=-5', 'x=-\\dfrac{5}{7}', 'x=-5/7', 1],
    ['entrainement', '7x=-5', 'x=-\\dfrac{5}{7}', '-5/7=x', 2],
    ['evaluation', '7x=-5', 'x=-\\dfrac{5}{7}', 'x=-\\frac57', 1],
    ['entrainement', '7x=-5', 'x=-\\dfrac{5}{7}', 'x=\\frac{-5}7', 2],
  ] as const)(
    'termine et note une fraction en mode %s : %s → %s → %s',
    (mode, initial, expected, solution, points) => {
      document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
        initial,
        mode,
      })
      exercice.autoCorrection[0].valeur = {
        reponse: { value: expected },
        bareme: baremeSolveur(mode),
      }
      const solver = document.querySelector(
        'mathalea-solveur',
      ) as MathaleaSolveurElement
      const input = solver.querySelectorAll('math-field')[1] as HTMLElement & {
        value: string
      }
      const termine = vi.fn()
      solver.addEventListener('solveur-termine', termine)
      input.value = solution
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      solver.evaluate()

      expect(solver.value).toBe(solution)
      expect(solver.querySelectorAll('math-field')).toHaveLength(2)
      expect(solver.interactivityOn).toBe(false)
      expect(termine).toHaveBeenCalledOnce()
      expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toEqual({
        isOk: true,
        feedback: '',
        score: { nbBonnesReponses: points, nbReponses: points },
      })
      expect(exercice.answers?.[solver.id]).toBe(solution)
    },
  )

  it('refuse une fraction non simplifiée de valeur incorrecte', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '4x=6',
    })
    exercice.autoCorrection[0].valeur = {
      reponse: { value: 'x=\\dfrac{3}{2}' },
    }
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    solver.value = 'x=\\dfrac{8}{4}'

    expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toMatchObject({
      isOk: false,
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    })
  })

  it('refuse une étape équivalente qui ne présente pas encore la forme attendue', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '2x+4=10',
    })
    exercice.autoCorrection[0].valeur = { reponse: { value: 'x=3' } }
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    solver.value = '2x=6'

    expect(MathaleaSolveurElement.verifQuestion(exercice, 0).isOk).toBe(false)
  })

  it("accepte la solution isolée d'une équation avec l'inconnue au dénominateur", () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '\\dfrac{8}{9}=\\dfrac{7}{x}',
    })
    exercice.autoCorrection[0].valeur = {
      reponse: { value: 'x=\\dfrac{63}{8}' },
    }
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    solver.value = 'x=\\dfrac{63}{8}'

    expect(MathaleaSolveurElement.verifQuestion(exercice, 0).isOk).toBe(true)
  })

  it('accepte une transformation rationnelle avec un nom de distance', () => {
    document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
      initial: '\\dfrac{8}{9}=\\dfrac{7}{GO}',
      variable: 'GO',
    })
    const solver = document.querySelector(
      'mathalea-solveur',
    ) as MathaleaSolveurElement
    const input = solver.querySelectorAll('math-field')[1] as
      (HTMLElement & { value: string }) | undefined
    if (input == null) throw new Error('Champ de saisie absent')
    input.value = 'GO=\\dfrac{63}{8}'
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.evaluate()

    expect(solver.value).toBe('GO=\\dfrac{63}{8}')
    expect(solver.querySelectorAll('math-field')).toHaveLength(2)
    expect(solver.querySelector('.message')?.textContent).toBe(
      "L'équation est résolue.",
    )
  })

  describe('barème', () => {
    function creeSolveur(mode: 'entrainement' | 'evaluation') {
      document.body.innerHTML = addMathaleaSolveur(exercice, 0, {
        initial: '2x+4=10',
        mode,
      })
      exercice.autoCorrection[0].valeur = {
        reponse: { value: 'x=3' },
        bareme: baremeSolveur(mode),
      }
      return document.querySelector(
        'mathalea-solveur',
      ) as MathaleaSolveurElement
    }

    function evalue(
      solver: MathaleaSolveurElement,
      rang: number,
      ligne: string,
    ) {
      const input = solver.querySelectorAll('math-field')[rang] as
        (HTMLElement & { value: string }) | undefined
      if (input == null) throw new Error('Champ de saisie absent')
      input.value = ligne
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      solver.evaluate()
    }

    it('convertit le paramètre de formulaire en mode', () => {
      expect(modeSolveur(1)).toBe('evaluation')
      expect(modeSolveur('2')).toBe('entrainement')
      expect(modeSolveur(undefined)).toBe('evaluation')
    })

    it('combine le mode brouillon (non interactif) et le barème (interactif)', () => {
      expect(optionsSolveur(true, false, 2)).toEqual({
        mode: 'entrainement',
        interactivityOn: true,
      })
      expect(optionsSolveur(true, true, 1)).toEqual({
        mode: 'evaluation',
        interactivityOn: true,
      })
      expect(optionsSolveur(false, true, 2)).toEqual({
        mode: 'entrainement',
        interactivityOn: true,
      })
      expect(optionsSolveur(false, false, 2)).toEqual({
        mode: 'evaluation',
        interactivityOn: false,
      })
    })

    it('mode evaluation : la question vaut 1 point et une étape fausse la rend fausse', () => {
      const solver = creeSolveur('evaluation')
      expect(MathaleaSolveurElement.pointsMaxQuestion(exercice, 0)).toBe(1)
      evalue(solver, 1, '2x=5')
      expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toMatchObject({
        isOk: false,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      })
    })

    it('mode entrainement : 2 points sans aucune étape fausse', () => {
      const solver = creeSolveur('entrainement')
      expect(MathaleaSolveurElement.pointsMaxQuestion(exercice, 0)).toBe(2)
      evalue(solver, 1, 'x=3')
      expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toEqual({
        isOk: true,
        feedback: '',
        score: { nbBonnesReponses: 2, nbReponses: 2 },
      })
    })

    it('mode entrainement : 1 point si la solution est trouvée malgré une étape fausse', () => {
      const solver = creeSolveur('entrainement')
      evalue(solver, 1, '2x=5')
      evalue(solver, 2, '2x=6')
      evalue(solver, 3, 'x=3')
      const resultat = MathaleaSolveurElement.verifQuestion(exercice, 0)
      expect(resultat.isOk).toBe(false)
      expect(resultat.score).toEqual({ nbBonnesReponses: 1, nbReponses: 2 })
      expect(resultat.feedback).toContain('étape était incorrecte')
    })

    it("mode entrainement : 0 point si la solution n'est pas trouvée", () => {
      const solver = creeSolveur('entrainement')
      evalue(solver, 1, '2x=5')
      evalue(solver, 2, '2x=6')
      expect(MathaleaSolveurElement.verifQuestion(exercice, 0)).toMatchObject({
        isOk: false,
        score: { nbBonnesReponses: 0, nbReponses: 2 },
      })
    })
  })
})

describe('isEquivalentInequality', () => {
  const check = isEquivalentInequality()

  it('accepte les transformations positives', () => {
    expect(check.run('x+2<5', '2x+4<10').passed).toBe(true)
  })

  it('exige de retourner le signe après multiplication par un négatif', () => {
    expect(check.run('x>2', '-2x<-4').passed).toBe(true)
    expect(check.run('x<2', '-2x<-4').passed).toBe(false)
  })

  it('distingue les inégalités strictes et larges', () => {
    expect(check.run('x\\leq2', '2x<=4').passed).toBe(true)
    expect(check.run('x\\leqslant2', '2x<=4').passed).toBe(true)
    expect(check.run('x<2', '2x<=4').passed).toBe(false)
  })
})
