import { beforeEach, describe, expect, test } from 'vitest'

import referentielExams from '../../src/json/referentielStaticFR.json'
import { getAllEndings } from '../../src/lib/components/refUtils'
import { triAnnales } from '../../src/lib/components/sorting'
import type { JSONReferentielObject } from '../../src/lib/types/referentiels'

describe('sorteddnbexamens', () => {
  const examsReferentiel: JSONReferentielObject = { ...referentielExams }
  let examens = getAllEndings(examsReferentiel)
  examens = examens.filter(
    (value) =>
      value.resource.uuid.includes('bac') &&
      value.resource.uuid.includes('2024'),
  )
  examens = examens.slice(1, 100)
  // examens.forEach((value, index)=> console.log('' + index + ':' + value.pathToResource[0] + ':' + value.pathToResource[1] + ':' + value.pathToResource[2] + ':' + value.resource.uuid))
  examens = triAnnales(examens, 'ascStringdescNumber')
  // examens.forEach((value, index)=> console.log('' + index + ':' + value.pathToResource[0] + ':' + value.pathToResource[1] + ':' + value.pathToResource[2] + ':' + value.resource.uuid))
  // const orderedExamsReferentiel = buildReferentiel(examens)

  beforeEach(() => {})

  test('sorteddnbexamens', () => {
    expect(examens.length).toBe(99)
  })
})
