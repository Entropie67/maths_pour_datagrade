import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CourseAuxNombres5e from '../../src/exercices/can/5e/can5a-CoopMaths'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random
const originalContext = { ...context }
beforeEach(() => {
  context.isHtml = true
  context.isAmc = false
  window.notify = vi.fn()
})
afterEach(() => {
  Math.random = originalRandom
  Object.assign(context, originalContext)
})

function generate(question: string, seed: number) {
  seedrandom(`can5a-${seed}`, { global: true })
  const exercise = new CourseAuxNombres5e()
  exercise.numeroExercice = 0
  exercise.interactif = true
  exercise.sup = question
  exercise.nouvelleVersion()
  return exercise
}

describe('can5a-CoopMaths : questions 25, 27 et 30', () => {
  it('Q25 : propose quatre hauteurs distinctes dont une seule correcte', () => {
    const objects = new Set<string>()
    for (let seed = 0; seed < 60; seed++) {
      const exercise = generate('25', seed)
      const propositions = exercise.autoCorrection[0].propositions!
      expect(propositions).toHaveLength(4)
      expect(new Set(propositions.map((p) => p.texte)).size).toBe(4)
      expect(propositions.filter((p) => p.statut)).toHaveLength(1)
      const correct = propositions.find((p) => p.statut)!.texte!
      const unit = correct.match(/text\{ (\w+)\}/)![1]
      const question = exercise.listeQuestions[0]
      const object = question.match(/hauteur d'une (\w+)/)![1]
      objects.add(object)
      expect(unit).toBe(
        (
          {
            chaise: 'cm',
            grue: 'dm',
            tour: 'm',
            girafe: 'dm',
            coline: 'm',
          } as Record<string, string>
        )[object],
      )
      expect(question).not.toContain('mathalea-mathfield')
    }
    expect(objects.size).toBe(5)
  })

  it('Q27 : accepte la distance parcourue pendant les heures et les 20 minutes annoncées', () => {
    for (let seed = 0; seed < 20; seed++) {
      const exercise = generate('27', seed)
      const question = exercise.listeQuestions[0]
      const speed = Number(question.match(/\$(\d+)\\text\{ km\/h\}/)![1])
      const hours = Number(question.match(/\$(\d+)\\text\{ h\}/)![1])
      const answer = exercise.autoCorrection[0].valeur!.reponse!
      const expected = speed * hours + speed / 3
      expect(
        answer.compare!(
          `${expected}\\operatorname{km}`,
          answer.value as string,
          answer.options,
        ),
      ).toMatchObject({ isOk: true })
      expect(exercise.listeCorrections[0]).toContain('\\dfrac{20}{60}')
    }
  })

  it('Q30 : affiche € après le champ et accepte le prix avec une virgule sans unité', () => {
    let decimals = 0
    for (let seed = 0; seed < 30; seed++) {
      const exercise = generate('30', seed)
      const question = exercise.listeQuestions[0]
      const prices = [...question.matchAll(/coûtent \$([\d{} ,\\]+)\$ €/g)].map(
        (match) =>
          Number(match[1].replace(/\{,\}|,/g, '.').replace(/[{} \\]/g, '')),
      )
      expect(prices).toHaveLength(2)
      const expected = Math.round((prices[1] - prices[0]) * 100) / 100
      if (!Number.isInteger(expected)) decimals++
      const answer = exercise.autoCorrection[0].valeur!.reponse!
      const input = String(expected).replace('.', ',')
      expect(Number(answer.value)).toBe(expected)
      expect(answer.value).not.toContain('€')
      expect(
        answer.compare!(input, answer.value as string, answer.options),
      ).toMatchObject({ isOk: true })
      expect(
        fonctionComparaison(String(expected + 1), answer.value as string).isOk,
      ).toBe(false)
      expect(question).toMatch(/<\/mathalea-mathfield>.*€/)
    }
    expect(decimals).toBeGreaterThan(0)
  })
})
