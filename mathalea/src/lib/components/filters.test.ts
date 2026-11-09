import { describe, expect, it } from 'vitest'
import type { ResourceAndItsPath } from '../types/referentiels'
import { subjectCriterion } from './filters'

describe('subjectCriterion', () => {
  it("trouve un exercice d'une banque externe (sans `features`) par son titre", () => {
    const item = {
      pathToResource: ['Enigmes de la FFJM', 'Chrono-logique'],
      resource: {
        uuid: 'bq-ffjm-balai-furieux',
        url: '',
        id: 'balai-furieux',
        titre: 'Au balai furieux',
        typeExercice: 'static',
        banque: 'ffjm',
        banqueTitre: 'FFJM',
        tags: [],
      },
    } as unknown as ResourceAndItsPath
    expect(subjectCriterion('balai').meetCriterion([item])).toEqual([item])
    expect(subjectCriterion('cuisson').meetCriterion([item])).toEqual([])
  })
})
