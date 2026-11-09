import { describe, expect, it } from 'vitest'
import { sameUpToIntegerShift } from './sameUpToIntegerShift'

describe('sameUpToIntegerShift', () => {
  it.each([
    // la somme des carrés de deux nombres pairs
    ['(2n)^2+(2m)^2', '(2n)^2+(2m)^2'],
    ['4n^2+4m^2', '(2n)^2+(2m)^2'],
    ['(2n+2)^2+(2m)^2', '(2n)^2+(2m)^2'],
    // la somme de trois entiers consécutifs
    ['(n-1)+n+(n+1)', 'n+(n+1)+(n+2)'],
    ['3n', 'n+(n+1)+(n+2)'],
    ['3n+6', 'n+(n+1)+(n+2)'],
    // le produit de deux entiers consécutifs
    ['(n-1)n', 'n(n+1)'],
    ['n^2+n', 'n(n+1)'],
    // un nombre impair : 2n+1, 2n-1, 1-2n
    ['2n-1', '2n+1'],
    ['1-2n', '2n+1'],
    // le produit d'un nombre pair et d'un nombre impair : lettres échangées
    ['2m(2n+1)', '2n(2m+1)'],
    ['2m\\times\\left(2n+1\\right)', '2n(2m+1)'],
    // le triple de la somme de trois entiers consécutifs
    ['3\\left(n+n+1+n+2\\right)', '3(n+(n+1)+(n+2))'],
    // un multiple de 7, son carré, son cube
    ['7n+7', '7n'],
    ['49n^2', '(7n)^2'],
    ['(7n-7)^3', '(7n)^3'],
    // le produit de trois entiers consécutifs
    ['(n-1)n(n+1)', 'n(n+1)(n+2)'],
    ['n^3-n', 'n(n+1)(n+2)'],
    // le carré du successeur, le double du carré
    ['n^2+2n+1', '(n+1)^2'],
    ['2\\times n^2', '2n^2'],
    // la somme des cubes de deux nombres impairs consécutifs
    ['(2n-1)^3+(2n+1)^3', '(2n+1)^3+(2n+3)^3'],
    // décalages quelconques : k est calculé, pas cherché dans une petite plage
    ['(n-12)^2', 'n^2'],
    ['(12-n)^2', 'n^2'],
    ['(n+50)^3', 'n^3'],
    ['(2n-40)^2+(2m+30)^2', '(2n)^2+(2m)^2'],
    ['2m(2n-21)', '2n(2m+1)'],
    ['5(n-100)+7', '5n+7'],
  ])('accepter %s pour %s', (saisie, reponse) => {
    expect(sameUpToIntegerShift().run(saisie, reponse).passed).toBe(true)
  })

  it.each([
    // un nombre pair au carré n'est pas un nombre impair au carré
    ['(2n+1)^2', '(2n)^2'],
    // deux nombres pairs quelconques ne sont pas égaux
    ['(2n)^2+(2n)^2', '(2n)^2+(2m)^2'],
    // un multiple de 6 n'est pas un multiple de 3 quelconque
    ['6n', '3n'],
    ['n^2+m^2', '(2n)^2+(2m)^2'],
    ['n(n+2)', 'n(n+1)'],
    // carré du successeur et successeur du carré
    ['n^2+1', '(n+1)^2'],
    // double du carré et carré du double
    ['(2n)^2', '2n^2'],
    // un multiple de 14 n'est pas un multiple de 7 quelconque
    ['14n', '7n'],
    ['n(n+1)', 'n(n+1)(n+2)'],
    // le carré d'un entier : (n-12)^8 n'atteint que des puissances 8es
    ['(n-12)^8', 'n^2'],
    ['(n-12)^2+1', 'n^2'],
    ['(2n+41)^2', '(2n)^2'],
  ])('refuser %s pour %s', (saisie, reponse) => {
    expect(sameUpToIntegerShift().run(saisie, reponse).passed).toBe(false)
  })

  it("limiter les décalages : n désigne l'un des trois entiers consécutifs", () => {
    const check = sameUpToIntegerShift({
      shifts: [0, 2],
      allowNegation: false,
    })
    const somme = 'n+(n+1)+(n+2)'
    for (const saisie of ['3n+3', '(n-1)+n+(n+1)', '(n-2)+(n-1)+n', '3n']) {
      expect(check.run(saisie, somme).passed).toBe(true)
    }
    // trois nombres pairs consécutifs : 3n+6, refusé avec ces décalages
    expect(check.run('n+(n+2)+(n+4)', somme).passed).toBe(false)
    expect(check.run('(n+1)+(n+2)+(n+3)', somme).passed).toBe(false)
    expect(check.run('3-3n', somme).passed).toBe(false)
    // avec les décalages par défaut, 3n+6 = (n+1)+(n+2)+(n+3) est accepté
    expect(sameUpToIntegerShift().run('n+(n+2)+(n+4)', somme).passed).toBe(true)
  })

  it('rester rapide pour une saisie refusée à deux lettres', () => {
    const debut = performance.now()
    sameUpToIntegerShift().run('(2n)^2+(2m)^2+1', '(2n)^2+(2m)^2')
    expect(performance.now() - debut).toBeLessThan(500)
  })

  it('respecter une lettre dont le rôle est fixé', () => {
    const check = sameUpToIntegerShift({ fixed: ['n'] })
    expect(check.run('3n+3', 'n+(n+1)+(n+2)').passed).toBe(true)
    expect(check.run('(n-1)+n+(n+1)', 'n+(n+1)+(n+2)')).toMatchObject({
      passed: false,
      feedbackKo: "Respecter le rôle donné à $n$ dans l'énoncé.",
    })
  })

  it('signaler une lettre étrangère ou manquante', () => {
    const check = sameUpToIntegerShift({ variables: ['n', 'm'] })
    expect(check.run('2x+2y', '2n+2m')).toMatchObject({
      passed: false,
      feedbackKo: 'Utiliser uniquement les lettres $n$ et $m$.',
    })
    expect(check.run('4n', '2n+2m')).toMatchObject({
      passed: false,
      feedbackKo: 'Utiliser aussi la lettre $m$.',
    })
  })

  it('signaler une saisie non interprétable', () => {
    expect(sameUpToIntegerShift().run('\\frac{', 'n').passed).toBe(false)
  })
})
