import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'

// Import de la fonction à tester (il faudra l'exporter depuis FractionEtendue.ts)
// Pour l'instant, on va tester via le constructeur FractionEtendue
import FractionEtendue from '../../src/modules/FractionEtendue'

describe('normalizeFraction', () => {
  describe('Deux arguments entiers', () => {
    it('devrait retourner [3, 4] pour (3, 4)', () => {
      const f = new FractionEtendue(3, 4)
      expect(f.num).toBe(3)
      expect(f.den).toBe(4)
    })

    it('devrait retourner [-3, 4] pour (-3, 4)', () => {
      const f = new FractionEtendue(-3, 4)
      expect(f.num).toBe(-3)
      expect(f.den).toBe(4)
    })

    it('devrait retourner [3, -4] pour (3, -4)', () => {
      const f = new FractionEtendue(3, -4)
      expect(f.num).toBe(3)
      expect(f.den).toBe(-4)
    })

    it('devrait retourner [0, 1] pour (0, 5)', () => {
      const f = new FractionEtendue(0, 5)
      expect(f.num).toBe(0)
      expect(f.den).toBe(5)
    })
  })

  describe('Arguments avec décimaux', () => {
    it('devrait convertir 0.5 et 2 en fraction', () => {
      const f = new FractionEtendue(0.5, 2)
      // 0.5 = 1/2, donc 0.5/2 = 5/20
      expect(f.num).toBe(5)
      expect(f.den).toBe(20)
    })

    it('devrait convertir 1.5 et 3 en fraction', () => {
      const f = new FractionEtendue(1.5, 3)
      // 1.5 = 3/2, donc 1.5/3 = 15/30
      expect(f.num).toBe(15)
      expect(f.den).toBe(30)
    })

    it('devrait convertir 0.25 et 0.5 en fraction', () => {
      const f = new FractionEtendue(0.25, 0.5)
      // 0.25/0.5 = 1/2
      expect(f.num).toBe(25)
      expect(f.den).toBe(50)
    })

    it('devrait gérer les décimaux avec plusieurs chiffres', () => {
      const f = new FractionEtendue(0.125, 0.375)
      // 0.125/0.375 = 125/375 = 1/3
      expect(f.num).toBe(125)
      expect(f.den).toBe(375)
    })
  })

  describe('Arguments avec Decimal', () => {
    it('devrait accepter un Decimal comme numérateur', () => {
      const f = new FractionEtendue(new Decimal(3), 4)
      expect(f.num).toBe(3)
      expect(f.den).toBe(4)
    })

    it('devrait accepter des Decimal avec décimales', () => {
      const f = new FractionEtendue(new Decimal(1.5), 3)
      expect(f.num).toBe(15)
      expect(f.den).toBe(30)
    })

    it('devrait gérer les Decimal négatifs', () => {
      const f = new FractionEtendue(new Decimal(-2.5), 5)
      expect(f.num).toBe(-25)
      expect(f.den).toBe(50)
    })
  })

  describe('Cas limites', () => {
    it('devrait gérer les très petits nombres', () => {
      const f = new FractionEtendue(0.00001, 1)
      expect(f.den).toBe(100000)
      expect(f.num).toBe(1)
    })

    it('devrait limiter le dénominateur à 10000 pour les décimaux périodiques', () => {
      // 1/3 = 0.3333... sera limité
      const f = new FractionEtendue(1 / 3, 1)
      expect(f.den).toBe(100000)
    })

    describe('Simplification automatique', () => {
      it('devrait simplifier 6/8 en 3/4', () => {
        const f = new FractionEtendue(6, 8)
        expect(f.numIrred).toBe(3)
        expect(f.denIrred).toBe(4)
      })

      it('devrait simplifier 10/15 en 2/3', () => {
        const f = new FractionEtendue(10, 15)
        expect(f.numIrred).toBe(2)
        expect(f.denIrred).toBe(3)
      })

      it('devrait garder 7/11 inchangé (déjà irréductible)', () => {
        const f = new FractionEtendue(7, 11)
        expect(f.numIrred).toBe(7)
        expect(f.denIrred).toBe(11)
      })
    })

    describe('Gestion des signes', () => {
      it('devrait avoir signe -1 pour numérateur négatif', () => {
        const f = new FractionEtendue(-3, 4)
        expect(f.s).toBe(-1)
        expect(f.signe).toBe(-1)
      })

      it('devrait avoir signe -1 pour dénominateur négatif', () => {
        const f = new FractionEtendue(3, -4)
        expect(f.s).toBe(-1)
      })

      it('devrait avoir signe 1 pour les deux négatifs', () => {
        const f = new FractionEtendue(-3, -4)
        expect(f.s).toBe(1)
      })

      it('devrait avoir signe 0 pour numérateur nul', () => {
        const f = new FractionEtendue(0, 4)
        expect(f.s).toBe(0)
      })

      it('devrait placer le signe au numérateur irréductible', () => {
        const f = new FractionEtendue(3, -4)
        expect(f.numIrred).toBe(-3)
        expect(f.denIrred).toBe(4)
      })
    })
  })
})

describe('texSimplificationAvecEtapes', () => {
  describe('Fractions entières (dénominateur 1)', () => {
    it('ne doit pas produire de \\dfrac avec dénominateur vide pour -10/1 (factorisation)', () => {
      const f = new FractionEtendue(10, 1).multiplieEntier(-1)
      const tex = f.texSimplificationAvecEtapes(true, '#F15929')
      expect(tex).not.toContain('}{}')
      expect(tex).not.toContain('\\dfrac')
      expect(tex).toContain('-10')
    })

    it('retourne uniquement le résultat pour 10/1 (factorisation)', () => {
      const f = new FractionEtendue(10, 1)
      expect(f.texSimplificationAvecEtapes(true)).toBe('=10')
    })

    it('gère le signe pour -7/1 (factorisation)', () => {
      const f = new FractionEtendue(-7, 1)
      expect(f.texSimplificationAvecEtapes(true)).toBe('=-7')
    })
  })
})
