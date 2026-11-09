import { createHash } from 'node:crypto'
import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sortRandomlyLikeV8 } from '../../src/lib/outils/arrayOutils'
import { historicalSortHashes } from './sortRandomlyLikeV8.fixtures'

/**
 * Les exercices publiés (4A12-1, 4C20-2, 5G1A, 6G2B-1, 6G2C-2…) ont été tirés avec le tri natif de V8.
 * Sous 64 éléments, conserver le résultat et la consommation aléatoire historiques,
 * indépendamment des évolutions du tri natif de V8 (notamment sous Node 26).
 */
describe('sortRandomlyLikeV8', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each(Array.from({ length: 64 }, (_, n) => n))(
    'conserve les tirages historiques et la consommation aléatoire pour n=%i',
    (n) => {
      const hash = createHash('sha256')
      const random = vi.spyOn(Math, 'random')
      for (let graine = 1; graine <= 100; graine++) {
        random.mockReset().mockImplementation(seedrandom(String(graine)))
        const stable = sortRandomlyLikeV8(
          Array.from({ length: n }, (_, i) => i),
        )
        const calls = random.mock.calls.length
        hash.update(JSON.stringify([stable, calls, Math.random()]))
      }
      expect(hash.digest('hex')).toBe(historicalSortHashes[n])
    },
  )

  it('conserve le cas n=3, graine=1 même si le tri natif change', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(seedrandom('1'))
    expect(sortRandomlyLikeV8([0, 1, 2])).toEqual([2, 1, 0])
    expect(random).toHaveBeenCalledTimes(2)
    expect(Math.random()).toBe(0.8740779300873869)
  })

  it('délègue au tri natif à partir de 64 éléments', () => {
    const random = vi.spyOn(Math, 'random')
    for (let n = 64; n <= 70; n++) {
      for (let graine = 1; graine <= 100; graine++) {
        const base = Array.from({ length: n }, (_, i) => i)

        random.mockReset().mockImplementation(seedrandom(String(graine)))
        const natif = [...base].sort(() => Math.random() - 0.5)
        const appelsNatif = random.mock.calls.length
        const suiteNatif = Math.random()

        random.mockReset().mockImplementation(seedrandom(String(graine)))
        const stable = sortRandomlyLikeV8([...base])
        const appelsStable = random.mock.calls.length
        const suiteStable = Math.random()

        expect(stable, `n=${n} graine=${graine}`).toEqual(natif)
        expect(appelsStable, `n=${n} graine=${graine}`).toBe(appelsNatif)
        expect(suiteStable, `n=${n} graine=${graine}`).toBe(suiteNatif)
      }
    }
  })

  it('trie en place et renvoie le même tableau', () => {
    vi.spyOn(Math, 'random').mockImplementation(seedrandom('1'))
    const tableau = [1, 2, 3, 4]
    expect(sortRandomlyLikeV8(tableau)).toBe(tableau)
  })
})
