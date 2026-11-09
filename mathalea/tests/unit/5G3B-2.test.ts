import { afterEach, expect, it, vi } from 'vitest'
import SymetrieProprietesArchive from '../../src/exercices/5e/5G3B-2-old'
import SymetrieProprietes from '../../src/exercices/5e/5G3B-2'

const originalRandom = Math.random

afterEach(() => {
  Math.random = originalRandom
  vi.unstubAllGlobals()
})

it.each([
  ['version courante', SymetrieProprietes],
  ['version archivée', SymetrieProprietesArchive],
] as const)(
  'générer la graine e906e sans intersection impossible (%s)',
  (_, Exercise) => {
    const notify = vi.fn()
    vi.stubGlobal('notify', notify)
    const exercice = new Exercise()
    exercice.seed = 'e906e'
    exercice.nbQuestions = 4
    exercice.nouvelleVersionWrapper()

    expect(exercice.listeQuestions).toHaveLength(4)
    expect(notify).not.toHaveBeenCalled()
  },
)

it("ne pas afficher trois angles de 60° sur un triangle quelconque (graine jZCb)", () => {
  vi.stubGlobal('notify', vi.fn())
  const exercice = new SymetrieProprietes()
  exercice.seed = 'jZCb'
  exercice.sup = '4'
  exercice.sup3 = 3
  exercice.nbQuestions = 3
  exercice.nouvelleVersionWrapper()
  exercice.listeQuestions.forEach((question, i) => {
    const angles = [...question.matchAll(/(\d+)\^\\circ/g)].map((m) =>
      Number(m[1]),
    )
    expect(angles).toHaveLength(3)
    expect(angles.reduce((somme, a) => somme + a, 0)).toBe(180)
    // L'angle demandé figure parmi les mesures affichées sur la figure.
    expect(
      exercice.listeCorrections[i].includes(`boldsymbol{${angles[2]}^\\circ}`) ||
        angles.some((a) =>
          exercice.listeCorrections[i].includes(`boldsymbol{${a}^\\circ}`),
        ),
    ).toBe(true)
    expect(new Set(angles).size).toBeGreaterThan(1)
  })
})
