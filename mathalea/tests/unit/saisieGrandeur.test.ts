import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PerimetreOuVolumeBoule from '../../src/exercices/1e/1A-G02-14'
import {
  optionsClavierGrandeur,
  compareGrandeur,
  compareGrandeurAvecPi,
  compareGrandeurAvecPiEtAlternatives,
  reponseGrandeur,
  reponseGrandeurAvecPi,
} from '../../src/lib/interactif/saisieGrandeur'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

describe('saisieGrandeur', () => {
  describe('grandeur avec unité', () => {
    const reponse = reponseGrandeur(12.5, 'cm^2')

    it('écrit la réponse attendue avec le point décimal', () => {
      expect(reponse).toBe('12.5cm^2')
    })

    it('accepte la bonne valeur dans la bonne unité ou une unité équivalente', () => {
      expect(
        compareGrandeur('12,5\\operatorname{\\mathrm{cm}}^2', reponse).isOk,
      ).toBe(true)
      expect(
        compareGrandeur('1250\\operatorname{\\mathrm{mm}}^2', reponse).isOk,
      ).toBe(true)
    })

    it('refuse une saisie sans unité ou avec une autre grandeur', () => {
      expect(compareGrandeur('12,5', reponse).isOk).toBe(false)
      expect(
        compareGrandeur('12,5\\operatorname{\\mathrm{cm}}', reponse).isOk,
      ).toBe(false)
    })
  })

  describe('valeur exacte avec π et unité', () => {
    const reponse = reponseGrandeurAvecPi('16\\pi', 'cm^2')

    it('construit la réponse attendue', () => {
      expect(reponse).toBe('16\\pi\\operatorname{\\mathrm{cm}}^2')
    })

    it('accepte une écriture équivalente de la valeur', () => {
      expect(
        compareGrandeurAvecPi('16\\pi\\operatorname{\\mathrm{cm}}^2', reponse)
          .isOk,
      ).toBe(true)
      expect(
        compareGrandeurAvecPi(
          '\\frac{32}{2}\\pi\\operatorname{\\mathrm{cm}}^{2}',
          reponse,
        ).isOk,
      ).toBe(true)
    })

    it("signale l'unité oubliée", () => {
      const resultat = compareGrandeurAvecPi('16\\pi', reponse)
      expect(resultat.isOk).toBe(false)
      expect(resultat.feedback).toContain('unité')
    })

    it('refuse une mauvaise unité ou une mauvaise valeur', () => {
      expect(
        compareGrandeurAvecPi('16\\pi\\operatorname{\\mathrm{cm}}^3', reponse)
          .isOk,
      ).toBe(false)
      expect(
        compareGrandeurAvecPi('15\\pi\\operatorname{\\mathrm{cm}}^2', reponse)
          .isOk,
      ).toBe(false)
      expect(
        compareGrandeurAvecPi('50,24\\operatorname{\\mathrm{cm}}^2', reponse)
          .isOk,
      ).toBe(false)
    })
  })

  describe('grandeur avec π et alternatives', () => {
    const reponse = reponseGrandeurAvecPi('30\\pi', 'cm^3')
    const compare = compareGrandeurAvecPiEtAlternatives([
      reponseGrandeurAvecPi('0.03\\pi', 'dm^3'),
    ])

    it('accepte la réponse attendue et son équivalent dans une autre unité', () => {
      expect(
        compare('30\\pi\\operatorname{\\mathrm{cm}}^3', reponse).isOk,
      ).toBe(true)
      expect(
        compare('0,03\\pi\\operatorname{\\mathrm{dm}}^3', reponse).isOk,
      ).toBe(true)
    })

    it('refuse une valeur incohérente avec son unité', () => {
      expect(
        compare('30\\pi\\operatorname{\\mathrm{dm}}^3', reponse).isOk,
      ).toBe(false)
    })
  })
  describe('clavier avec fraction', () => {
    const touches = (options: Parameters<typeof optionsClavierGrandeur>[0]) =>
      (optionsClavierGrandeur(options).dataKeys as string[][])[0]

    it("propose la touche fraction seulement quand l'exercice la demande", () => {
      const base = {
        unitesEnonce: ['cm'],
        dimension: 3 as const,
        unitePrincipale: 'cm',
      }
      expect(touches({ ...base, avecPi: true })).not.toContain(
        '\\dfrac{#@}{#?}',
      )
      expect(touches({ ...base, avecPi: true, avecFraction: true })).toEqual([
        '7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ',', '\\pi',
        '\\dfrac{#@}{#?}',
      ])
    })

    describe('1A-G02-14', () => {
      beforeEach(() => {
        document.body.innerHTML = ''
        window.notify = vi.fn()
        window.notifyLocal = vi.fn()
      })

      it('le volume exact (fraction × π × unité) peut être saisi avec les touches du champ', () => {
        for (let graine = 1; graine <= 10; graine++) {
          seedrandom(`g02-14-${graine}`, { global: true })
          const exercice = new PerimetreOuVolumeBoule()
          exercice.interactif = true
          exercice.numeroExercice = 0
          exercice.nbQuestions = 2
          exercice.sup3 = false
          exercice.nouvelleVersion()
          exercice.listeQuestions.forEach((question, i) => {
            const cles = JSON.parse(
              question
                .match(/data-keys="([^"]*)"/)![1]
                .replaceAll('&quot;', '"'),
            ).flat() as string[]
            expect(cles).toContain('\\dfrac{#@}{#?}')
            const { value, compare } = (
              exercice.autoCorrection[i] as unknown as {
                valeur: {
                  reponse: {
                    value: string
                    compare: (a: string, b: string) => { isOk: boolean }
                  }
                }
              }
            ).valeur.reponse
            // `\dfrac{500}{3}\pi\operatorname{\mathrm{cm}}^3` s'écrit avec les touches fraction, π et cm³
            const saisie = value.replace(
              '\\operatorname{\\mathrm{cm}}',
              '\\operatorname{ cm}',
            )
            expect(compare(saisie, value).isOk, saisie).toBe(true)
          })
        }
      })
    })
  })
})
