import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Thales from '../../src/exercices/3e/3AutoG12'
import Conversions from '../../src/exercices/4e/4C32-3'
import Disques from '../../src/exercices/5e/5G2E-3'
import Perimetres from '../../src/exercices/6e/6M1autoE-3'
import Puissances from '../../src/exercices/can/2e/can2N4-02'
import Somme from '../../src/exercices/can/5e/can5C4-02'
import FractionDecimale from '../../src/exercices/can/canc3a-2026/canc3a-2026-Q14'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import * as aleatoire from '../../src/lib/outils/arrayOutils'
import * as outils from '../../src/modules/outils'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

afterEach(() => vi.restoreAllMocks())

describe('9968 : accepter les résultats sans erreur de flottant', () => {
  it('accepte une fraction décimale avec un numérateur entier', () => {
    const exercice = new FractionDecimale()
    exercice.enonce(4.56, 1, 100)
    expect(exercice.reponse).toBe('\\dfrac{457}{100}')
    expect(
      fonctionComparaison(
        '4,57',
        String(exercice.reponse),
        exercice.optionsDeComparaison,
      ).isOk,
    ).toBe(true)
  })

  it('accepte 50,4 pour le calcul de Thalès', () => {
    const exercice = new Thales()
    vi.spyOn(aleatoire, 'choice')
      .mockReturnValueOnce(2.1)
      .mockReturnValueOnce(8)
      .mockReturnValueOnce(3)
    exercice.nouvelleVersion()
    expect(exercice.reponse).toBe(50.4)
    expect(fonctionComparaison('50,4', String(exercice.reponse)).isOk).toBe(
      true,
    )
  })

  it.each([
    [33, 8, 17, '5610000', '5,61\\times10^{6}'],
    [11, 5, 16, '1760', '1,76\\times10^{3}'],
  ] as const)(
    'accepte les deux écritures du nombre de Go du serveur (%s × 10^%s × %s Mo)',
    (a, exposant, b, attendu, scientifique) => {
      const exercice = new Conversions()
      exercice.sup = '2'
      exercice.nbQuestions = 1
      vi.spyOn(outils, 'randint')
        .mockReturnValueOnce(a)
        .mockReturnValueOnce(exposant)
        .mockReturnValueOnce(b)
      exercice.nouvelleVersion()
      const reponse = exercice.autoCorrection[0].valeur!.reponse
      expect(reponse!.value).toBe(attendu)
      for (const saisie of [attendu, scientifique]) {
        expect(
          fonctionComparaison(saisie, String(reponse!.value), reponse!.options)
            .isOk,
        ).toBe(true)
      }
    },
  )

  it.each([
    ['a', 0.25],
    ['a', 0.5],
    ['b', 0.2],
    ['b', 0.4],
  ] as const)(
    'calcule exactement les puissances du cas %s avec %s',
    (type, a) => {
      const exercice = new Puissances()
      vi.spyOn(exercice, 'quotaChoice').mockReturnValue(type)
      vi.spyOn(aleatoire, 'choice').mockReturnValue(a)
      vi.spyOn(outils, 'randint').mockReturnValue(4)
      exercice.nouvelleVersion()
      const attendu = a === 0.25 || a === 0.2 ? 1 : 16
      expect(exercice.reponse).toBe(attendu)
      expect(
        fonctionComparaison(String(attendu), String(exercice.reponse)).isOk,
      ).toBe(true)
    },
  )

  it.each([3, 4])('accepte la somme décimale du cas %s', (type) => {
    const exercice = new Somme()
    vi.spyOn(exercice, 'quotaChoice').mockReturnValue(type)
    vi.spyOn(outils, 'randint')
      .mockReturnValueOnce(12)
      .mockReturnValueOnce(type === 3 ? 13 : 5)
      .mockReturnValueOnce(type === 3 ? 5 : 3)
    exercice.nouvelleVersion()
    const attendu = type === 3 ? '12,135' : '12,035'
    expect(fonctionComparaison(attendu, String(exercice.reponse)).isOk).toBe(
      true,
    )
  })

  it.each(['1', '2', '3'])(
    'accepte les périmètres décimaux des figures %s',
    (sup) => {
      for (let i = 0; i < 10; i++) {
        seedrandom(`9968-${i}`, { global: true })
        const exercice = new Perimetres()
        exercice.sup = sup
        exercice.sup2 = true
        exercice.nbQuestions = 1
        exercice.nouvelleVersion()
        const reponse = exercice.autoCorrection[0].valeur!.reponse!
        const saisie =
          String(reponse.value).replace('cm', '').replace('.', ',') +
          '\\operatorname{cm}'
        expect(String(reponse.value)).not.toMatch(/\d\.\d{3}/)
        expect(
          fonctionComparaison(saisie, String(reponse.value), reponse.options)
            .isOk,
        ).toBe(true)
        expect(exercice.listeQuestions[0]).not.toMatch(/\d\.\d/)
      }
    },
  )

  it.each(['4', '5'])(
    'accepte les deux valeurs approchées du disque de type %s',
    (sup) => {
      seedrandom('9968-disques', { global: true })
      const exercice = new Disques()
      exercice.sup = sup
      exercice.nbQuestions = 1
      const randint = outils.randint
      vi.spyOn(outils, 'randint').mockImplementation(
        (...args: Parameters<typeof outils.randint>) =>
          args[0] === 2 && args[1] === 5 ? 2 : randint(...args),
      )
      exercice.nouvelleVersion()
      const attendus =
        sup === '4'
          ? [
              ['12.5cm', '12.6cm'],
              ['12.5cm^2', '12.6cm^2'],
            ]
          : [
              ['10.2cm', '10.3cm'],
              ['6.2cm^2', '6.3cm^2'],
            ]
      for (const index of [0, 1]) {
        const reponse = exercice.autoCorrection[index].valeur!.reponse!
        expect(Array.isArray(reponse.value)).toBe(true)
        const valeurs = reponse.value as string[]
        expect(valeurs).toEqual(attendus[index])
        for (const valeur of valeurs) {
          expect(
            fonctionComparaison(
              valeur.replace('cm', '\\operatorname{cm}').replace('.', ','),
              valeur,
              reponse.options,
            ).isOk,
          ).toBe(true)
        }
      }
    },
  )
})
