import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TSA3_30 from '../../src/exercices/TSpe/TSA3-30'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Reponse = {
  value: string
  compare: (saisie: string, reponse: string) => { isOk: boolean }
}

function genere(graine: string, sup: string, sup2: string) {
  seedrandom(graine, { global: true })
  const exercice = new TSA3_30()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 5
  exercice.sup = sup
  exercice.sup2 = sup2
  exercice.nouvelleVersion()
  return exercice
}

const reponse = (exercice: TSA3_30, i: number) =>
  (exercice.autoCorrection[i] as unknown as { valeur: { reponse: Reponse } })
    .valeur.reponse

describe('TSA3-30 : relecture', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
  })

  it.each(['1', '2', '3'])(
    'accepte la réponse attendue et refuse une réponse fausse (type %s)',
    (sup) => {
      for (const sup2 of ['1', '2']) {
        const exercice = genere(`${sup}-${sup2}`, sup, sup2)
        expect(exercice.listeQuestions).toHaveLength(5)
        for (let i = 0; i < 5; i++) {
          const { value, compare } = reponse(exercice, i)
          expect(compare(value, value).isOk).toBe(true)
          expect(compare(`2\\times(${value})`, value).isOk).toBe(false)
          expect(exercice.listeCorrections[i]).toContain(value)
        }
      }
    },
  )

  it('accepte la forme non simplifiée issue de la formule', () => {
    // Pour u^n, la formule n×u'×u^(n-1) est toujours suivie d'une simplification
    const exercice = genere('formule', '1', '1')
    for (let i = 0; i < 5; i++) {
      const { value, compare } = reponse(exercice, i)
      const formule = exercice.listeCorrections[i].match(
        /appliquant la formule ci-dessus avec \$n=\d\$ :\\\[[a-z]'\(x\)=(.*?)\.\\\]/,
      )![1]
      expect(compare(formule, value).isOk).toBe(true)
    }
  })
})
