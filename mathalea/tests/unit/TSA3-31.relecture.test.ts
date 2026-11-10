import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TSA3_31 from '../../src/exercices/TSpe/TSA3-31'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Reponse = {
  value: string
  compare: (saisie: string, reponse: string) => { isOk: boolean }
}

function genere(graine: string, sup: string) {
  seedrandom(graine, { global: true })
  const exercice = new TSA3_31()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 3
  exercice.sup = sup
  exercice.nouvelleVersion()
  return exercice
}

const reponse = (exercice: TSA3_31, i: number) =>
  (exercice.autoCorrection[i] as unknown as { valeur: { reponse: Reponse } })
    .valeur.reponse

describe('TSA3-31 : relecture', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
  })

  it.each(['1', '2', '3'])(
    'accepte la réponse attendue et une forme non réduite est refusée (type %s)',
    (sup) => {
      for (const graine of ['a', 'b', 'c', 'd']) {
        const exercice = genere(graine, sup)
        expect(exercice.listeQuestions).toHaveLength(3)
        for (let i = 0; i < 3; i++) {
          const { value, compare } = reponse(exercice, i)
          expect(compare(value, value).isOk).toBe(true)
          expect(compare(`${value}+0x+1-1`, value).isOk).toBe(false)
          expect(exercice.listeCorrections[i]).toContain(value)
        }
      }
    },
  )
})
