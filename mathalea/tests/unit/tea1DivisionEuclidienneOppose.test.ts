import { afterEach, expect, it, vi } from 'vitest'
import DivisionEuclidienneOppose from '../../src/exercices/TEx/TEA1-21'
import { texNombre } from '../../src/lib/outils/texNombre'
import * as outils from '../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each([1, 7, 23])(
  'enchaîne les deux divisions avec un reste positif de %i',
  (r) => {
    const tirage = vi.spyOn(outils, 'randint')
    tirage
      .mockReturnValueOnce(24)
      .mockReturnValueOnce(47)
      .mockReturnValueOnce(r)
    const exercice = new DivisionEuclidienneOppose()
    exercice.nouvelleVersion()
    const a = 24 * 48 + r
    expect(exercice.nbQuestions).toBe(1)
    expect(exercice.nbQuestionsModifiable).toBe(true)
    expect(exercice.listeQuestions[0]).toContain(
      `${texNombre(a)}=47\\times 24+${24 + r}`,
    )
    expect(exercice.listeQuestions[0]).toContain(`$${texNombre(a)}$`)
    expect(exercice.listeQuestions[0]).toContain(`$${texNombre(-a)}$`)
    for (let i = 0; i < 2; i++) {
      const reponses = exercice.autoCorrection[0].valeur!
      const q = Number(reponses[`field${i}`].value)
      const reste = Number(reponses[`field${i + 2}`].value)
      expect(24 * q + reste).toBe(i === 0 ? a : -a)
      expect(reste).toBeGreaterThanOrEqual(0)
      expect(reste).toBeLessThan(24)
      expect(q).toBe(i === 0 ? 48 : -49)
      expect(reponses.bareme!([1, 1, 1, 1])).toEqual([1, 1])
    }
  },
)

it('génère le nombre demandé de paires de questions', () => {
  const exercice = new DivisionEuclidienneOppose()
  exercice.nbQuestions = 4
  exercice.nouvelleVersion()
  expect(exercice.listeQuestions).toHaveLength(4)
  expect(exercice.listeCorrections).toHaveLength(4)
  for (let i = 0; i < 4; i++) {
    expect(exercice.listeQuestions[i]).toContain('<ol')
    expect(exercice.autoCorrection[i].valeur?.field3).toBeDefined()
  }
})

it('regroupe les quatre réponses dans un seul multi-mathfield', () => {
  const exercice = new DivisionEuclidienneOppose()
  exercice.interactif = true
  exercice.nouvelleVersion()
  expect(exercice.listeQuestions[0].match(/<multi-mathfield/g)).toHaveLength(1)
  expect(exercice.autoCorrection[0].formatInteractif).toBe('multi-mathfield')
  for (const nom of ['field0', 'field1', 'field2', 'field3']) {
    expect(exercice.listeQuestions[0]).toContain(nom)
  }
})
