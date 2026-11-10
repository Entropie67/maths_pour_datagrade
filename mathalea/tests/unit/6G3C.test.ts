import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProprietesMediatrice from '../../src/exercices/6e/6G3C'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random

beforeEach(() => {
  context.isHtml = true
  context.isAmc = false
  context.isTypst = false
})

afterEach(() => {
  Math.random = originalRandom
})

function checkLengths(seed: string, sup: number, sup2: boolean) {
  seedrandom(seed, { global: true })
  const exercice = new ProprietesMediatrice()
  exercice.numeroExercice = 0
  exercice.nbQuestions = 10
  exercice.sup = sup
  exercice.sup2 = sup2
  exercice.nouvelleVersion()

  expect(exercice.listeQuestions).toHaveLength(10)
  exercice.listeCorrections.forEach((correction, i) => {
    const figure = document.createElement('div')
    figure.innerHTML = correction
    const lengths = Array.from(figure.querySelectorAll('svg text'))
      .map((label) => label.textContent ?? '')
      .filter((label) => label.endsWith(' cm'))
    expect(lengths).toHaveLength(2)
    if (correction.includes("n'est pas équidistant")) {
      expect(lengths[0], `Graine ${seed}, question ${i + 1}`).not.toBe(
        lengths[1],
      )
    } else {
      expect(lengths[0], `Graine ${seed}, question ${i + 1}`).toBe(lengths[1])
    }

    if (exercice.listeQuestions[i].includes('appartient-il')) {
      const values = [
        ...correction.split('<br>')[0].matchAll(/= ([\d{,}]+)\\text\{ cm\}\$/g),
      ].map((match) => `${match[1].replace(/[{}]/g, '')} cm`)
      expect(values).toEqual([...new Set(lengths)])
    }
  })
}

describe('6G3C : longueurs affichées et propriétés de la médiatrice', () => {
  it('ne contredit pas les longueurs affichées pour le signalement Kd15', () => {
    checkLengths('Kd15', 3, true)
  })

  it.each([1, 2, 3])('reste cohérent pour la situation %s', (sup) => {
    for (const sup2 of [false, true]) {
      for (let seed = 0; seed < 20; seed++) {
        checkLengths(String(seed), sup, sup2)
      }
    }
  })
})
