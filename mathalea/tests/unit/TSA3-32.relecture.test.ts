import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TSA3_32 from '../../src/exercices/TSpe/TSA3-32'

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
  const exercice = new TSA3_32()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.sup = sup
  exercice.nouvelleVersion()
  return exercice
}

const reponse = (exercice: TSA3_32, i: number) =>
  (exercice.autoCorrection[i] as unknown as { valeur: { reponse: Reponse } })
    .valeur.reponse

describe('TSA3-32 : relecture', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
  })

  it.each(['1', '2', '3'])(
    'dérivée et tableau de variations cohérents (type %s)',
    (sup) => {
      for (const graine of ['a', 'b', 'c', 'd', 'e']) {
        const exercice = genere(`${sup}-${graine}`, sup)
        expect(exercice.listeQuestions).toHaveLength(1)

        // Question 1 : réponse attendue, forme non simplifiée, réponse fausse
        const { value, compare } = reponse(exercice, 0)
        expect(compare(value, value).isOk).toBe(true)
        expect(compare(`2\\times(${value})`, value).isOk).toBe(false)
        const formule = exercice.listeCorrections[0].match(
          /appliquant la formule ci-dessus(?: avec \$n=\d\$)? :\\\[f'\(x\)=(.*?)\.\\\]/,
        )![1]
        if (!formule.includes('color')) {
          expect(compare(formule, value).isOk).toBe(true)
        }

        // Question 2 : signe de f' et sens des flèches cohérents
        const attendu = JSON.parse(reponse(exercice, 1).value) as Record<
          string,
          string
        >
        expect(Object.keys(attendu)).toHaveLength(6)
        expect(attendu.L1C1).not.toBe(attendu.L1C3)
        expect(attendu.L2C3).toBe(attendu.L1C1 === '-' ? 'bas' : 'haut')
        expect(attendu.L2C4).toBe(attendu.L1C3 === '-' ? 'bas' : 'haut')
        // La résolution de « facteur > 0 » finit sur x > x0 si f' > 0 à droite
        expect(exercice.listeCorrections[0]).toContain(
          `&\\iff x${attendu.L1C3 === '+' ? '>' : '<'}${attendu.L0C1}\\end{aligned}`,
        )
      }
    },
  )

  it('donne une question par fonction, avec a) dérivée et b) tableau', () => {
    seedrandom('plusieurs', { global: true })
    const exercice = new TSA3_32()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nbQuestions = 3
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(3)
    expect(exercice.autoCorrection).toHaveLength(6)
    for (const [q, nom] of ['f', 'g', 'h'].entries()) {
      expect(exercice.listeQuestions[q]).toContain(`$${nom}'(x)=$`)
      expect(exercice.listeQuestions[q]).toContain(
        `tableau de variations de $${nom}$`,
      )
      expect(
        JSON.parse(reponse(exercice, 2 * q + 1).value) as object,
      ).toHaveProperty('L0C1')
    }
  })
})
