import { describe, expect, it } from 'vitest'
import { estCarreEgalNombre, isSolvedForm } from './MathaleaSolveurElement'
import { tousLesSolveursSontTermines } from './solveurTermine'
import type { IExercice } from '../types'

describe('isSolvedForm', () => {
  it.each([
    'x=-5/7',
    'x=-\\frac57',
    'x=\\frac{-5}7',
    'x=\\frac5{7}',
    'x=3',
    'x=-3',
    'x=2,5',
    'x=2.5',
    'x=\\dfrac{6}{5}',
    'x=-\\frac{6}{5}',
    'x=\\dfrac{-6}{5}',
    '3=x',
    'x=\\dfrac{6}{2}',
    'x=\\dfrac{6}{4}',
    'x=\\dfrac{-10}{5}',
    'x=-\\frac{6}{4}',
    'x=\\tfrac{6}{-4}',
    'x=\\dfrac{0}{5}',
    'x=\\dfrac{3}{1}',
    '\\dfrac{6}{4}=x',
  ])('accepte %s', (value) => {
    expect(isSolvedForm(value, 'equation', 'x')).toBe(true)
  })

  it.each([
    'x=2\\times\\frac{3}{5}',
    'x=2\\times\\dfrac{3}{5}',
    'x=\\dfrac{6+1}{5}',
    'x=3+2',
    'x=5/0',
    'x=\\frac50',
    'x=\\frac5{0}',
    'x=(3+2)/7',
    'x=5/7/2',
    'x=\\dfrac{6}{0}',
    '2x=6',
    'x=x+1',
  ])("refuse %s tant que le calcul n'est pas fini", (value) => {
    expect(isSolvedForm(value, 'equation', 'x')).toBe(false)
  })

  it('gère les inéquations', () => {
    expect(isSolvedForm('x\\leqslant\\dfrac{6}{10}', 'inequation', 'x')).toBe(
      true,
    )
    expect(isSolvedForm('x<2\\times3', 'inequation', 'x')).toBe(false)
  })
})

describe('estCarreEgalNombre', () => {
  it.each([
    'x^2=9',
    'x^{2}=9',
    '9=x^2',
    'x^2=\\dfrac{9}{4}',
    'x^2=2,25',
    'x^2=-4',
    'x^2=0',
  ])('accepte %s', (value) => {
    expect(estCarreEgalNombre(value)).toBe(true)
  })

  it.each([
    'x^2=3+6',
    '4x^2=9',
    'x^3=8',
    'x=3',
    'x^2=x',
    'x^2-9=0',
    'x^2=\\dfrac{9}{0}',
  ])('refuse %s', (value) => {
    expect(estCarreEgalNombre(value)).toBe(false)
  })

  it("accepte une autre lettre pour l'inconnue", () => {
    expect(estCarreEgalNombre('t^2=16', 't')).toBe(true)
    expect(estCarreEgalNombre('t^2=16', 'x')).toBe(false)
  })
})

describe('isSolvedForm dans C', () => {
  it.each([
    'z=3',
    'z=-3i',
    'z=i',
    'z=2+3i',
    'z=-2-i',
    'z=3i+2',
    'z=\\mathrm{i}',
    'z=2-5\\mathrm{i}',
    'z=\\dfrac{1}{13}+\\dfrac{5}{13}i',
    'z=-\\dfrac{3}{13}-\\dfrac{5}{13}\\mathrm{i}',
    'z=\\dfrac{1}{13}+\\dfrac{5i}{13}',
    'z=2,5-1,5i',
    '1+2i=z',
    // Les fractions n'ont pas besoin d'être simplifiées dans C.
    'z=\\dfrac{2}{4}+i',
    'z=\\dfrac{6}{3}i',
    'z=\\dfrac{140}{245}+\\dfrac{350}{245}\\mathrm{i}',
    'z=-\\dfrac{140}{245}-\\dfrac{350i}{245}',
  ])('accepte %s', (value) => {
    expect(isSolvedForm(value, 'equation', 'z', true)).toBe(true)
  })

  it.each([
    'z=\\dfrac{1+5i}{13}',
    'z=\\dfrac{-1+i}{2+3i}',
    'z=(1+i)(2-i)',
    'z=2+3',
    'z=2i+3i',
    'z=2+0i',
    'z=0+3i',
    'z=\\dfrac{140+350i}{245}',
    'z=\\dfrac{1}{0}+i',
    '(1+i)z=3',
    'z=1+z',
  ])("refuse %s tant que le calcul n'est pas fini", (value) => {
    expect(isSolvedForm(value, 'equation', 'z', true)).toBe(false)
  })

  it("refuse l'unité imaginaire dans R", () => {
    expect(isSolvedForm('x=2+3i', 'equation', 'x')).toBe(false)
  })
})

describe('tousLesSolveursSontTermines', () => {
  const exercice = {
    autoCorrection: [
      { formatInteractif: 'mathalea-solveur' },
      { formatInteractif: 'mathalea-solveur' },
    ],
  } as unknown as IExercice

  function conteneur(etats: boolean[]): HTMLElement {
    const div = document.createElement('div')
    for (const interactivityOn of etats) {
      const solveur = document.createElement(
        'mathalea-solveur',
      ) as HTMLElement & { interactivityOn: boolean }
      solveur.interactivityOn = interactivityOn
      div.appendChild(solveur)
    }
    return div
  }

  it('attend que tous les solveurs soient terminés', () => {
    expect(
      tousLesSolveursSontTermines(exercice, conteneur([false, true])),
    ).toBe(false)
    expect(
      tousLesSolveursSontTermines(exercice, conteneur([false, false])),
    ).toBe(true)
  })

  it("ne s'applique pas si une question n'est pas un solveur", () => {
    const mixte = {
      autoCorrection: [
        { formatInteractif: 'mathalea-solveur' },
        { formatInteractif: 'mathlive' },
      ],
    } as unknown as IExercice
    expect(tousLesSolveursSontTermines(mixte, conteneur([false]))).toBe(false)
  })
})
