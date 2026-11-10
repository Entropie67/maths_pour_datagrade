import { describe, expect, test } from 'vitest'
import FractionEtendue from './FractionEtendue'
import Trinome from './Trinome'

const p1 = new Trinome(1, 2, 1)

test('Utilisation de la classe Trinome', () => {
  expect(p1.tex).toBe('x^2+2x+1')
  expect(p1.discriminant.valeurDecimale).toBe(0)
})

describe('Trinome', () => {
  describe('constructor', () => {
    test('Initialisation avec des entiers', () => {
      const trinome = new Trinome(1, 2, 3)
      expect(trinome.a.valeurDecimale).toBe(1)
      expect(trinome.b.valeurDecimale).toBe(2)
      expect(trinome.c.valeurDecimale).toBe(3)
    })

    test('Initialisation avec des FractionEtendue', () => {
      const a = new FractionEtendue(1, 3)
      const b = new FractionEtendue(2, 3)
      const c = new FractionEtendue(3, 4)
      const trinome = new Trinome(a, b, c)
      expect(trinome.a).toEqual(a)
      expect(trinome.b).toEqual(b)
      expect(trinome.c).toEqual(c)
    })
  })

  describe('defFormeFactorisee', () => {
    test('Factorisation a(x-x1)(x-x2)', () => {
      const trinome = new Trinome(1, -3, 2)
      trinome.defFormeFactorisee(1, 1, 2)
      expect(trinome.a.valeurDecimale).toBe(1)
      expect(trinome.b.valeurDecimale).toBe(-3)
      expect(trinome.c.valeurDecimale).toBe(2)
    })
  })

  describe('defFormeFactorisee2', () => {
    test('Factorisation k(ax+b)(cx+d)', () => {
      const trinome = new Trinome(2, -4, 2)
      trinome.defFormeFactorisee2(-2, 1, -2, 2, -1)
      // -2(1x-2)(2x-1) = -2(2x^2-x-4x+2) = -4x^2+10x-4
      expect(trinome.a.valeurDecimale).toBe(-4)
      expect(trinome.b.valeurDecimale).toBe(10)
      expect(trinome.c.valeurDecimale).toBe(-4)
    })

    test('Factorisation k(ax+b)(cx+d) avec des fractions', () => {
      const trinome = new Trinome(2, -4, 2)
      const k = new FractionEtendue(1, 3)
      const a = new FractionEtendue(2, 1)
      const b = new FractionEtendue(1, 3)
      const c = new FractionEtendue(1, 5)
      const d = new FractionEtendue(2, 3)
      trinome.defFormeFactorisee2(k, a, b, c, d)
      expect(trinome.a).toMatchObject(new FractionEtendue(2, 15))
      expect(trinome.b).toMatchObject(new FractionEtendue(21, 45))
      expect(trinome.c).toMatchObject(new FractionEtendue(2, 27))
    })
  })

  describe('defFormeCanonique', () => {
    test('Forme canonique a(x-alpha)^2 + beta', () => {
      const trinome = new Trinome(1, -4, 4)
      trinome.defFormeCanonique(1, 2, 0)
      expect(trinome.a.valeurDecimale).toBe(1)
      expect(trinome.b.valeurDecimale).toBe(-4)
      expect(trinome.c.valeurDecimale).toBe(4)
    })
  })

  describe('add', () => {
    test('Somme de deux trinomes', () => {
      const trinome1 = new Trinome(1, 2, 3)
      const trinome2 = new Trinome(4, 5, 6)
      const sum = trinome1.add(trinome2)
      expect(sum.a.valeurDecimale).toBe(5)
      expect(sum.b.valeurDecimale).toBe(7)
      expect(sum.c.valeurDecimale).toBe(9)
    })

    test('Somme de deux trinomes avec des fractions', () => {
      const a = new FractionEtendue(1, 3)
      const b = new FractionEtendue(2, 5)
      const c = new FractionEtendue(3, 7)
      const a2 = new FractionEtendue(1, 4)
      const b2 = new FractionEtendue(1, 4)
      const c2 = 3
      const trinome1 = new Trinome(a, b, c)
      const trinome2 = new Trinome(a2, b2, c2)
      const sum = trinome1.add(trinome2)
      expect(sum.a).toMatchObject(new FractionEtendue(7, 12))
      expect(sum.b).toMatchObject(new FractionEtendue(13, 20))
      expect(sum.c).toMatchObject(new FractionEtendue(24, 7))
    })
  })

  describe('sub', () => {
    test('Différence de deux trinomes', () => {
      const trinome1 = new Trinome(4, 5, 6)
      const trinome2 = new Trinome(1, 2, 3)
      const difference = trinome1.sub(trinome2)
      expect(difference.a.valeurDecimale).toBe(3)
      expect(difference.b.valeurDecimale).toBe(3)
      expect(difference.c.valeurDecimale).toBe(3)
    })
  })

  describe('mul', () => {
    test('Multiplication par un scalaire', () => {
      const trinome = new Trinome(1, 2, 3)
      const k = new FractionEtendue(2, 1)
      const product = trinome.mul(k)
      expect(product.a.valeurDecimale).toBe(2)
      expect(product.b.valeurDecimale).toBe(4)
      expect(product.c.valeurDecimale).toBe(6)
    })
  })

  describe('isEqual', () => {
    test("Test d'égalité", () => {
      const trinome1 = new Trinome(1, 2, 3)
      const trinome2 = new Trinome(1, 2, 3)
      expect(trinome1.isEqual(trinome2)).toBe(true)
    })

    test("Test d'inégalité", () => {
      const trinome1 = new Trinome(1, 2, 3)
      const trinome2 = new Trinome(4, 5, 6)
      expect(trinome1.isEqual(trinome2)).toBe(false)
    })
  })

  describe('tex', () => {
    test('Forme LaTeX', () => {
      const trinome = new Trinome(1, -2, 1)
      expect(trinome.tex).toBe('x^2-2x+1')
    })
  })

  describe('discriminant', () => {
    test('Calcul du discriminant', () => {
      const trinome = new Trinome(1, -3, 2)
      const discriminant = trinome.discriminant
      expect(discriminant.valeurDecimale).toBe(1) // b^2 - 4ac = 9 - 8 = 1
    })
  })

  describe('image', () => {
    test('Devrait retourner la bonne image', () => {
      const trinome = new Trinome(1, -3, 2)
      const x = new FractionEtendue(1, 1)
      const image = trinome.image(x)
      expect(image.valeurDecimale).toBe(0) // 1(1)^2 - 3(1) + 2 = 0
    })
  })

  describe('isConstant', () => {
    test('Devrait dire que le trinome est constant', () => {
      const trinome = new Trinome(0, 0, 5)
      expect(trinome.isConstant).toBe(true)
    })

    test("Devrait dire que le trinome n'est pas constant", () => {
      const trinome = new Trinome(1, 0, 5)
      expect(trinome.isConstant).toBe(false)
    })
  })

  describe('x1 et x2', () => {
    test('Devrait calculer les racines', () => {
      const trinome = new Trinome(2, 3, 5)
      trinome.defFormeFactorisee(1, 2, 3)
      let x1 = trinome.x1
      if (x1 instanceof FractionEtendue) x1 = x1.valeurDecimale
      let x2 = trinome.x2
      if (x2 instanceof FractionEtendue) x2 = x2.valeurDecimale
      expect(x1).toBe(2)
      expect(x2).toBe(3)
    })
    test('Devrait calculer les racines doubles', () => {
      const trinome = new Trinome(2, 3, 5)
      trinome.defFormeFactorisee(1, 2, 2)
      let x1 = trinome.x1
      if (x1 instanceof FractionEtendue) x1 = x1.valeurDecimale
      let x2 = trinome.x2
      if (x2 instanceof FractionEtendue) x2 = x2.valeurDecimale
      expect(x1).toBe(2)
      expect(x2).toBe(2)
    })
  })

  describe('texFormeFactorisee', () => {
    test('Devrait retourner la forme factorisée', () => {
      const trinome1 = new Trinome(1, 2, 1)
      expect(trinome1.texFormeFactorisee).toBe('(x+1)^2')
      const trinome2 = new Trinome(3, -9, 6)
      expect(trinome2.texFormeFactorisee).toBe('3(x-1)(x-2)')
    })
  })

  describe('texCalculX1', () => {
    test('Devrait retourner le calcul de la 1re racine', () => {
      const trinome1 = new Trinome(3, -9, 6)
      expect(trinome1.texCalculRacine1()).toBe(
        'x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}=\\dfrac{9-\\sqrt{9}}{2\\times3}=\\dfrac{6}{6}=1',
      )
      expect(trinome1.texCalculRacine2()).toBe(
        'x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{9+\\sqrt{9}}{2\\times3}=\\dfrac{12}{6}=2',
      )
      const trinome2 = new Trinome(-2, -20, -47)
      expect(trinome2.texCalculRacine1()).toBe(
        'x_1 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{20+\\sqrt{24}}{2\\times\\left(-2\\right)}=\\dfrac{-20-\\sqrt{24}}{4}\\approx-6,225',
      )
      expect(trinome2.texCalculRacine1(true)).toBe(
        'x_1 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{20+\\sqrt{24}}{2\\times\\left(-2\\right)}=\\dfrac{-20-\\sqrt{24}}{4}=\\dfrac{-10- \\sqrt{6}}{2}',
      )
    })
  })
})
