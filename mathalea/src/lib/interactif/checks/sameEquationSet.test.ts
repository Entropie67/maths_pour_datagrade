import { describe, expect, it } from 'vitest'
import { sameEquationSet, splitList } from './sameEquationSet'

const check = sameEquationSet()
describe('sameEquationSet', () => {
  it('découper la liste', () => {
    expect(splitList('\\{x=2;y=0\\}')).toEqual(['x=2', 'y=0'])
    expect(splitList('\\varnothing')).toEqual([])
  })
  it.each([
    ['x=2;y=0', 'x=2;y=0'],
    ['y=0;x=2', 'x=2;y=0'],
    ['\\{2x=4; y=0\\}', 'x=2;y=0'],
    ['y=\\frac{1}{2}x-1', 'y=0.5x-1'],
    ['\\emptyset', '\\emptyset'],
    ['\\varnothing', '\\emptyset'],
    ['x=-1;x=1', 'x=1;x=-1'],
  ])('accepter %s pour %s', (saisie, reponse) => {
    expect(check.run(saisie, reponse).passed).toBe(true)
  })
  it.each([
    ['x=2', 'x=2;y=0', 'Il manque au moins une équation.'],
    ['x=2;y=0', 'x=2', 'Il y a trop d’équations.'],
    ['x=2;y=1', 'x=2;y=0', 'Au moins une équation est incorrecte.'],
    ['y=2', 'x=2', 'Au moins une équation est incorrecte.'],
    [
      'x=2,y=0',
      'x=2;y=0',
      'Séparer les équations par des points-virgules, par exemple $x=2;y=1$.',
    ],
    ['x=1;x=1', 'x=1;x=-1', 'Au moins une équation est incorrecte.'],
    ['\\emptyset', 'x=1', 'Il manque au moins une équation.'],
  ])('refuser %s pour %s', (saisie, reponse, feedback) => {
    const result = check.run(saisie, reponse)
    expect(result.passed).toBe(false)
    expect(result.feedbackKo).toBe(feedback)
  })
})
