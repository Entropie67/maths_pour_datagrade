import seedrandom from 'seedrandom'
import { expect, it } from 'vitest'

import CalculsImagesFonctions from '../../exercices/3e/3F10-2'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { inferAmcOptionsFromAnswerType } from '../amc/amcInferenceHelpers'
import { normalizeLegacySetReponseValueForAMC } from './gestionInteractif'

it('garde des tailles de grilles cohérentes sur les fonctions rationnelles de 3F10-2', () => {
  const previousContext = { isAmc: context.isAmc, isHtml: context.isHtml }
  context.isAmc = true
  context.isHtml = false

  try {
    for (let seed = 0; seed < 10; seed++) {
      seedrandom(`3F10-2-amc-${seed}`, { global: true })
      const exercice = new CalculsImagesFonctions()
      exercice.seed = `3F10-2-amc-${seed}`
      exercice.fonctions = 'polynomialesOuRationnelles'
      exercice.sup = 2
      exercice.sup2 = 1
      exercice.sup3 = 1
      exercice.nouvelleVersionWrapper()

      expect(exercice.autoCorrectionAMC).toHaveLength(exercice.nbQuestions)
      for (const item of exercice.autoCorrectionAMC) {
        const param = item.reponse?.param
        expect(
          param?.digits ?? 0,
          JSON.stringify({ seed, valeur: item.reponse?.valeur, param }),
        ).toBeLessThanOrEqual(4)
        expect(param?.decimals ?? 0).toBeLessThanOrEqual(2)
        if (typeof item.reponse?.valeur === 'number') {
          expect(
            param?.decimals,
            JSON.stringify({ seed, valeur: item.reponse.valeur, param }),
          ).toBe(0)
        }
      }
    }
  } finally {
    context.isAmc = previousContext.isAmc
    context.isHtml = previousContext.isHtml
  }
})

it('réduit une fractionEgale non entière avant de dimensionner ses cases', () => {
  const value = normalizeLegacySetReponseValueForAMC(
    new FractionEtendue(100, 40),
    'fractionEgale',
  ) as FractionEtendue

  expect(value.num).toBe(5)
  expect(value.den).toBe(2)
  expect(inferAmcOptionsFromAnswerType({ reponse: { value } })).toEqual({
    digits: 2,
    decimals: 1,
    signe: false,
  })
})

it('ne réinterprète pas les autres anciens formats setReponse', () => {
  const value = new FractionEtendue(100, 25)
  expect(normalizeLegacySetReponseValueForAMC(value, 'calcul')).toBe(value)
})
