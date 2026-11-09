import { describe, expect, it } from 'vitest'
import { extraireRacineCarree } from '../../src/lib/outils/calculs'
describe('extraireRacineCarree', () => {
  describe('cas limites', () => {
    it('devrait retourner [0, 0] pour n = 0', () => {
      expect(extraireRacineCarree(0)).toEqual([0, 0])
    })

    it('devrait retourner [0, -5] pour n négatif', () => {
      expect(extraireRacineCarree(-5)).toEqual([0, -5])
    })

    it('devrait retourner [1, 1] pour n = 1', () => {
      expect(extraireRacineCarree(1)).toEqual([1, 1])
    })
  })

  describe('nombres premiers', () => {
    it('devrait retourner [1, n] pour les nombres premiers', () => {
      expect(extraireRacineCarree(2)).toEqual([1, 2])
      expect(extraireRacineCarree(3)).toEqual([1, 3])
      expect(extraireRacineCarree(5)).toEqual([1, 5])
      expect(extraireRacineCarree(7)).toEqual([1, 7])
      expect(extraireRacineCarree(11)).toEqual([1, 11])
      expect(extraireRacineCarree(13)).toEqual([1, 13])
    })
  })

  describe('carrés parfaits', () => {
    it('devrait extraire complètement les carrés parfaits', () => {
      expect(extraireRacineCarree(4)).toEqual([2, 1]) // 4 = 2² × 1
      expect(extraireRacineCarree(9)).toEqual([3, 1]) // 9 = 3² × 1
      expect(extraireRacineCarree(16)).toEqual([4, 1]) // 16 = 4² × 1
      expect(extraireRacineCarree(25)).toEqual([5, 1]) // 25 = 5² × 1
      expect(extraireRacineCarree(36)).toEqual([6, 1]) // 36 = 6² × 1
      expect(extraireRacineCarree(49)).toEqual([7, 1]) // 49 = 7² × 1
      expect(extraireRacineCarree(64)).toEqual([8, 1]) // 64 = 8² × 1
      expect(extraireRacineCarree(81)).toEqual([9, 1]) // 81 = 9² × 1
      expect(extraireRacineCarree(100)).toEqual([10, 1]) // 100 = 10² × 1
    })
  })

  describe('nombres avec facteurs carrés simples', () => {
    it('devrait extraire correctement les facteurs carrés simples', () => {
      expect(extraireRacineCarree(8)).toEqual([2, 2]) // 8 = 2² × 2
      expect(extraireRacineCarree(12)).toEqual([2, 3]) // 12 = 2² × 3
      expect(extraireRacineCarree(18)).toEqual([3, 2]) // 18 = 3² × 2
      expect(extraireRacineCarree(20)).toEqual([2, 5]) // 20 = 2² × 5
      expect(extraireRacineCarree(24)).toEqual([2, 6]) // 24 = 2² × 6
      expect(extraireRacineCarree(27)).toEqual([3, 3]) // 27 = 3² × 3
      expect(extraireRacineCarree(32)).toEqual([4, 2]) // 32 = 4² × 2
      expect(extraireRacineCarree(45)).toEqual([3, 5]) // 45 = 3² × 5
      expect(extraireRacineCarree(50)).toEqual([5, 2]) // 50 = 5² × 2
    })
  })

  describe('nombres avec facteurs carrés multiples', () => {
    it('devrait extraire correctement les facteurs carrés multiples', () => {
      expect(extraireRacineCarree(72)).toEqual([6, 2]) // 72 = (2² × 3²) × 2 = 6² × 2
      expect(extraireRacineCarree(48)).toEqual([4, 3]) // 48 = 4² × 3
      expect(extraireRacineCarree(75)).toEqual([5, 3]) // 75 = 5² × 3
      expect(extraireRacineCarree(98)).toEqual([7, 2]) // 98 = 7² × 2
      expect(extraireRacineCarree(108)).toEqual([6, 3]) // 108 = 6² × 3
      expect(extraireRacineCarree(128)).toEqual([8, 2]) // 128 = 8² × 2
      expect(extraireRacineCarree(162)).toEqual([9, 2]) // 162 = 9² × 2
      expect(extraireRacineCarree(200)).toEqual([10, 2]) // 200 = 10² × 2
    })
  })

  describe('grands nombres', () => {
    it('devrait fonctionner avec de grands nombres', () => {
      expect(extraireRacineCarree(288)).toEqual([12, 2]) // 288 = 12² × 2
      expect(extraireRacineCarree(450)).toEqual([15, 2]) // 450 = 15² × 2
      expect(extraireRacineCarree(512)).toEqual([16, 2]) // 512 = 16² × 2
      expect(extraireRacineCarree(800)).toEqual([20, 2]) // 800 = 20² × 2
    })
  })

  describe('propriétés mathématiques', () => {
    it('devrait vérifier que a² × b = n', () => {
      const testCases = [8, 12, 18, 20, 24, 32, 45, 50, 72, 98, 128, 200]

      testCases.forEach((n) => {
        const [a, b] = extraireRacineCarree(n)
        expect(a * a * b).toBe(n)
      })
    })

    it("devrait vérifier que b n'a pas de facteur carré > 1", () => {
      const testCases = [8, 12, 18, 20, 24, 32, 45, 50, 72, 98, 128, 200]

      testCases.forEach((n) => {
        const [, b] = extraireRacineCarree(n)
        // Vérifier que b n'a pas de facteur carré en essayant de l'extraire
        const [aBis, bBis] = extraireRacineCarree(b)
        expect(aBis).toBe(1) // Si b n'a pas de facteur carré, aBis doit être 1
        expect(bBis).toBe(b) // et bBis doit être égal à b
      })
    })
  })
})
