import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExerciceQcmACourt from '../../src/exercices/ExerciceQcmACourt'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import CESpeQ3 from '../../src/exercices/EAMPremiere/EAM-CESpe-2026-Q3'
import ANnonSpeQ2 from '../../src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q2'
import ANnonSpeQ3 from '../../src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q3'
import C02_1 from '../../src/exercices/1e/1A-C02-1'
import R01_2 from '../../src/exercices/1e/1A-R01-2'
import S04_1 from '../../src/exercices/1e/1A-S04-1'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Reponse = {
  value: string | string[]
  options?: Record<string, boolean>
  compare?: (
    saisie: string,
    reponse: string,
    options?: object,
  ) => {
    isOk: boolean
  }
}

/** Réponses attendues de la première question, en saisie libre interactive. */
function reponseAttendue(
  Exercice: new () => ExerciceQcmACourt | ExerciceSimple,
  graine: string,
) {
  seedrandom(graine, { global: true })
  const exercice = new Exercice()
  exercice.nbQuestions = 1
  exercice.interactif = true
  if (exercice instanceof ExerciceSimple) {
    exercice.seed = graine
    exercice.versionQcm = false
    mathaleaHandleExerciceSimple(exercice, true, 0)
  } else {
    exercice.sup3 = false
    exercice.nouvelleVersion()
  }
  const { reponse } = (
    exercice.autoCorrection[0] as unknown as { valeur: { reponse: Reponse } }
  ).valeur
  const valeur = String(
    Array.isArray(reponse.value) ? reponse.value[0] : reponse.value,
  )
  const compare = reponse.compare ?? fonctionComparaison
  return {
    valeur,
    accepte: (saisie: string) =>
      compare(saisie, valeur, reponse.options ?? {}).isOk,
  }
}

describe('1A : fonctions de comparaison', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('1A-A01-2 Q2 : accepter une fraction non simplifiée avec un conseil', () => {
    const exercice = new ANnonSpeQ2()
    const compare = exercice.compareReponseCourte!
    const feedback = 'La réponse est juste mais elle pouvait être simplifiée.'
    for (const [saisie, reponse] of [
      ['\\frac{14}{6}', '\\frac{7}{3}'],
      ['\\frac{6}{2}', '3'],
      ['\\frac62', '3'],
    ]) {
      expect(compare(saisie, reponse)).toMatchObject({ isOk: true, feedback })
    }
    for (const [saisie, reponse] of [
      ['\\frac{7}{3}', '\\frac{7}{3}'],
      ['3', '3'],
      ['1,5', '\\frac{3}{2}'],
    ]) {
      const resultat = compare(saisie, reponse)
      expect(resultat.isOk).toBe(true)
      expect(resultat.feedback).not.toBe(feedback)
    }
    expect(compare('\\frac{16}{6}', '\\frac{7}{3}').isOk).toBe(false)
    expect(compare('1+2', '3').isOk).toBe(false)
  })

  describe('un calcul non abouti n’est pas le résultat', () => {
    it('1A-A01-3 (Centres étrangers spécialité Q3) : A/B + 1 = 11/5', () => {
      let verifie = 0
      for (let graine = 1; graine <= 12; graine++) {
        const { valeur, accepte } = reponseAttendue(CESpeQ3, `cmp-ce-${graine}`)
        const nombre = Number(valeur.replace(',', '.'))
        if (!/\\d?frac/.test(valeur) && Number.isNaN(nombre)) continue
        verifie++
        expect(accepte(valeur), valeur).toBe(true)
        expect(accepte(`${valeur}+0`), valeur).toBe(false)
        expect(accepte(`\\frac{3/4}{5/8}+1`), valeur).toBe(false)
        if (/\\d?frac/.test(valeur)) {
          const [, signe, n, d] =
            valeur.match(/(-?)\\d?frac\{(-?\d+)\}\{(\d+)\}/) ?? []
          expect(
            accepte(`${signe}\\frac{${2 * Number(n)}}{${2 * Number(d)}}`),
          ).toBe(true)
          expect(accepte(String(Number(n) / Number(d)).replace('.', ','))).toBe(
            Number.isFinite(Number(n) / Number(d)),
          )
        }
      }
      expect(verifie).toBeGreaterThan(0)
    })

    it.each([
      ['1A-C02-1', C02_1],
      ['1A-R01-2', R01_2],
      ['1A-S04-1', S04_1],
    ] as const)(
      '%s : le résultat est accepté, pas la somme qui le donne',
      (_, Exercice) => {
        for (let graine = 1; graine <= 10; graine++) {
          const { valeur, accepte } = reponseAttendue(Exercice, `cmp-${graine}`)
          if (!/^-?[\d.,]+$/.test(valeur)) continue
          const n = Number(valeur.replace(',', '.'))
          expect(accepte(valeur)).toBe(true)
          expect(accepte(`${n - 1}+1`), valeur).toBe(false)
          expect(accepte(`${n}\\times1`), valeur).toBe(false)
        }
      },
    )

    it('1A-A01-2 (Amérique du Nord non spécialité Q3) : la forme c×2^k est exigée', () => {
      const { valeur, accepte } = reponseAttendue(ANnonSpeQ3, 'cmp-an-q3')
      expect(accepte(valeur)).toBe(true)
      const [c, k] = valeur.match(/(\d+)\\times\s*2\^\{(\d+)\}/)?.slice(1) ?? []
      expect(accepte(String(Number(c) * 2 ** Number(k)))).toBe(false)
    })
  })
})
