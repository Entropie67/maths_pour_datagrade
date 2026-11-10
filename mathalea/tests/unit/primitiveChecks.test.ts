// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import {
  integrationConstantPresence,
  sameFunctionWithConstantFeedback,
  samePrimitiveUpToConstant,
  seq,
} from '../../src/lib/interactif/checks'

describe('integrationConstantPresence', () => {
  const check = integrationConstantPresence()

  test('accepte une réponse contenant la constante c', () => {
    expect(check.run('\\dfrac{4}{3}x^6+6x+c', '').passed).toBe(true)
    expect(check.run('c-\\dfrac{1}{3x+5}', '').passed).toBe(true)
  })

  test('refuse une réponse sans constante et le signale', () => {
    const result = check.run('\\dfrac{4}{3}x^6+6x', '')
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toContain('constante')
  })

  test('ne confond pas c avec cos', () => {
    expect(check.run('-\\dfrac{1}{5}\\cos(5x)', '').passed).toBe(false)
    expect(check.run('-\\dfrac{1}{5}\\cos(5x)+c', '').passed).toBe(true)
  })

  test('mode expected:false refuse la présence de c', () => {
    const sansC = integrationConstantPresence({ expected: false })
    expect(sansC.run('x^2+c', '').passed).toBe(false)
    expect(sansC.run('x^2+3', '').passed).toBe(true)
  })
})

describe('samePrimitiveUpToConstant', () => {
  const check = samePrimitiveUpToConstant()

  test('accepte la réponse attendue et toute autre constante', () => {
    expect(check.run('x^2+c', 'x^2+c').passed).toBe(true)
    expect(check.run('x^2+c+1', 'x^2+c').passed).toBe(true)
    expect(check.run('x^2+5+c', 'x^2+c').passed).toBe(true)
  })

  test('refuse une fonction de dérivée différente', () => {
    const result = check.run('x^3+c', 'x^2+c')
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toContain('dérivant')
  })

  test('accepte les formes équivalentes non développées', () => {
    expect(check.run('(x+1)^2+c', 'x^2+2x+c').passed).toBe(true)
  })

  test('respecte le domaine pour les racines', () => {
    const surDomaine = samePrimitiveUpToConstant({ domaine: [-3, 0.5] })
    expect(
      surDomaine.run('-\\dfrac{2}{5}\\sqrt{3-5x}+c', '-\\dfrac{2}{5}\\sqrt{3-5x}+c')
        .passed,
    ).toBe(true)
  })

  test('requireConstantEffect refuse une réponse où c est absent', () => {
    const strict = samePrimitiveUpToConstant({ requireConstantEffect: true })
    const result = strict.run('x^2+c\\times 0', 'x^2+c')
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toContain('constante')
  })

  test('fonctions trigonométriques à une constante près', () => {
    expect(
      check.run('-\\dfrac{1}{5}\\cos(5x)+c', '-\\dfrac{1}{5}\\cos(5x)+c')
        .passed,
    ).toBe(true)
    expect(
      check.run('\\dfrac{1}{5}\\cos(5x)+c', '-\\dfrac{1}{5}\\cos(5x)+c').passed,
    ).toBe(false)
  })
})

describe('sameFunctionWithConstantFeedback', () => {
  const check = sameFunctionWithConstantFeedback()

  test('accepte la fonction exacte sous une autre forme', () => {
    expect(check.run('(x+1)^2', 'x^2+2x+1').passed).toBe(true)
  })

  test('signale un terme constant erroné', () => {
    const result = check.run('x^2+4', 'x^2+3')
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toContain('terme constant')
  })

  test('signale une dérivée fausse sans parler du terme constant', () => {
    const result = check.run('x^3+3', 'x^2+3')
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).not.toContain('terme constant')
  })
})

describe('échantillonnage sur l’intervalle demandé', () => {
  test('refuse une expression non définie sur une partie de l’intervalle', () => {
    const check = sameFunctionWithConstantFeedback({ domaine: [-2, 2] })
    expect(check.run('\\left(\\sqrt{x}\\right)^2', 'x').passed).toBe(false)
    const primitive = samePrimitiveUpToConstant({ domaine: [-2, 2] })
    expect(primitive.run('\\left(\\sqrt{x}\\right)^2', 'x').passed).toBe(false)
  })

  test('accepte une forme équivalente seulement sur l’intervalle demandé', () => {
    const surIntervalle = samePrimitiveUpToConstant({
      domaine: [0, Math.PI / 2],
    })
    expect(
      surIntervalle.run('5\\sqrt{\\left(\\cos(x)\\right)^2}', '5\\cos(x)')
        .passed,
    ).toBe(true)
    const surR = samePrimitiveUpToConstant({
      domaine: [-2 * Math.PI, 2 * Math.PI],
    })
    expect(
      surR.run('5\\sqrt{\\left(\\cos(x)\\right)^2}', '5\\cos(x)').passed,
    ).toBe(false)
  })
})

describe('constante nommée C', () => {
  test('accepte une primitive écrite avec +C', () => {
    expect(
      samePrimitiveUpToConstant({ constant: 'C' }).run('x^2+C', 'x^2').passed,
    ).toBe(true)
  })

  test('détecte une constante C restante', () => {
    const sansC = integrationConstantPresence({ constant: 'C', expected: false })
    expect(sansC.run('x^2+C', '').passed).toBe(false)
    expect(sansC.run('x^2+3', '').passed).toBe(true)
  })
})

describe('scénario complet de l’exercice interactif', () => {
  test('mode f(x) : constante requise puis comparaison', () => {
    const comparateur = seq([
      integrationConstantPresence(),
      samePrimitiveUpToConstant({ requireConstantEffect: true }),
    ])
    expect(comparateur('\\dfrac{4}{3}x^6+6x+c', '\\dfrac{4}{3}x^6+6x+c').isOk).toBe(
      true,
    )
    const sansConstante = comparateur('\\dfrac{4}{3}x^6+6x', '\\dfrac{4}{3}x^6+6x+c')
    expect(sansConstante.isOk).toBe(false)
    expect(sansConstante.feedback).toContain('constante')
  })
})
