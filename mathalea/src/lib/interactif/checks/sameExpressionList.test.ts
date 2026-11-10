import { describe, expect, it } from 'vitest'
import { sameExpressionList } from './sameExpressionList'

const check = sameExpressionList()
describe('sameExpressionList', () => {
  it.each([
    ['\\ln(6)', '\\ln(6)'],
    ['2\\ln(12)-3;\\ln(16)-1', '2\\ln(4)-1;2\\ln(12)-3'],
    ['1+\\sqrt{e}', '1+\\mathrm{e}^{1/2}'],
    ['1+e^{\\frac12}', '1+\\mathrm{e}^{1/2}'],
    ['-\\frac{1}{2e}', '-\\dfrac{1}{2}\\mathrm{e}^{-1}'],
    ['\\{3;1\\}', '1;3'],
    ['\\emptyset', '\\emptyset'],
  ])('accepter %s pour %s', (saisie, reponse) => {
    expect(check.run(saisie, reponse).passed).toBe(true)
  })
  it.each([
    ['1', '1;3', 'Il manque au moins une valeur.'],
    ['1;3;5', '1;3', 'Il y a trop de valeurs.'],
    ['1;1', '1;3', 'Au moins une valeur est incorrecte.'],
    ['\\ln(5)', '\\ln(6)', 'Au moins une valeur est incorrecte.'],
  ])('refuser %s pour %s', (saisie, reponse, feedback) => {
    const result = check.run(saisie, reponse)
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toBe(feedback)
  })
})
