import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotationPuissance from '../../src/exercices/4e/4C33-0'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Compare = (saisie: string) => { isOk: boolean; feedback?: string }

/** Questions « Écrire sans notation puissance » avec une base négative et un exposant > 1 */
function questionsProduit() {
  seedrandom('produit-equivalent', { global: true })
  const exercice = new NotationPuissance()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 12
  exercice.sup = 1
  exercice.sup2 = 2 // base négative
  exercice.sup3 = 1 // exposant positif
  exercice.sup4 = 3
  exercice.sup5 = 2
  exercice.nouvelleVersion()
  return exercice.autoCorrection.flatMap((reponses) => {
    const { value, compare } = reponses.valeur?.reponse ?? {}
    if (!Array.isArray(value) || compare == null) return []
    const facteurs = value[0].split('\\times')
    return [
      {
        attendue: value as string[],
        compare: compare as unknown as Compare,
        nombre: facteurs.length,
        base: facteurs[0].replace(/[()-]/g, ''),
        signeDevant: value[0].startsWith('-') ? -1 : 1,
      },
    ]
  })
}

const produitSimple = (base: string, nombre: number) =>
  Array(nombre).fill(base).join('\\times')

describe('4C33-0 : produit équivalent à celui attendu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('accepte sans feedback les écritures attendues', () => {
    const questions = questionsProduit()
    expect(questions.length).toBeGreaterThan(0)
    for (const { attendue, compare } of questions) {
      for (const variante of attendue) {
        expect(compare(variante)).toEqual({ isOk: true, feedback: '' })
      }
    }
  })

  it('accepte une écriture juste mais différente avec un feedback', () => {
    for (const { nombre, base, signeDevant, compare } of questionsProduit()) {
      // (-b)^n est du signe de (-1)^n, multiplié par le signe devant
      const signe = (nombre % 2 === 0 ? 1 : -1) * signeDevant
      const saisie = (signe < 0 ? '-' : '') + produitSimple(base, nombre)
      const result = compare(saisie)
      expect(result.isOk, saisie).toBe(true)
      expect(result.feedback).toContain('pas celle qui était attendue')
    }
  })

  it('refuse un mauvais signe, un mauvais nombre de facteurs ou un autre facteur', () => {
    for (const { nombre, base, signeDevant, compare } of questionsProduit()) {
      const signe = (nombre % 2 === 0 ? 1 : -1) * signeDevant
      const mauvaisSigne = (signe < 0 ? '' : '-') + produitSimple(base, nombre)
      expect(compare(mauvaisSigne).isOk, mauvaisSigne).toBe(false)
      const bonSigne = signe < 0 ? '-' : ''
      expect(compare(bonSigne + produitSimple(base, nombre + 1)).isOk).toBe(
        false,
      )
      expect(compare(bonSigne + produitSimple(base, nombre - 1)).isOk).toBe(
        false,
      )
      const autre = bonSigne + produitSimple(base, nombre - 1) + '\\times1'
      expect(compare(autre).isOk, autre).toBe(false)
    }
  })
})

describe('4C33-0 : produit équivalent avec un exposant négatif', () => {
  it("accepte l'inverse d'un produit juste mais différent de celui attendu", () => {
    seedrandom('produit-equivalent-negatif', { global: true })
    const exercice = new NotationPuissance()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nbQuestions = 12
    exercice.sup = 1
    exercice.sup2 = 2
    exercice.sup3 = 2 // exposant négatif
    exercice.sup4 = 1
    exercice.nouvelleVersion()
    let nbTestees = 0
    for (const reponses of exercice.autoCorrection) {
      const { value, compare } = reponses.valeur?.reponse ?? {}
      if (!Array.isArray(value) || compare == null) continue
      const facteurs = value[0].match(/\\frac\{1\}\{(.*)\}/)[1].split('\\times')
      const base = facteurs[0].replace(/[()-]/g, '')
      const nombre = facteurs.length
      const signe = nombre % 2 === 0 ? '' : '-'
      const denominateur = produitSimple(base, nombre)
      const comparer = compare as unknown as Compare
      expect(comparer(`${signe}\\frac{1}{${denominateur}}`).isOk).toBe(true)
      expect(
        comparer(`${signe ? '' : '-'}\\frac{1}{${denominateur}}`).isOk,
      ).toBe(false)
      expect(
        comparer(`${signe}\\frac{1}{${produitSimple(base, nombre + 1)}}`).isOk,
      ).toBe(false)
      nbTestees++
    }
    expect(nbTestees).toBeGreaterThan(0)
  })
})

describe('4C33-0 : exposants 1 et -1', () => {
  it('accepte la valeur simplifiée de -(-5)^{-1} et -(-5)^1 avec un feedback', () => {
    seedrandom('produit-equivalent-exposants-1', { global: true })
    const exercice = new NotationPuissance()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nbQuestions = 40
    exercice.classe = 2
    exercice.sup = 1
    exercice.sup2 = 2 // base négative
    exercice.sup3 = 3
    exercice.sup4 = 2 // signe - devant
    exercice.nouvelleVersion()
    let inverses = 0
    let simples = 0
    for (const reponses of exercice.autoCorrection) {
      const { value, compare } = reponses.valeur?.reponse ?? {}
      if (!Array.isArray(value) || compare == null) continue
      const comparer = compare as unknown as Compare
      const attendue = value[0] as string
      const inverse = attendue.match(/^-\\frac\{1\}\{-(\d+)\}$/)
      const simple = attendue.match(/^-\(-(\d+)\)$/)
      if (inverse != null) {
        // -(-b)^{-1} = 1/b
        expect(comparer(attendue)).toEqual({ isOk: true, feedback: '' })
        const result = comparer(`\\frac{1}{${inverse[1]}}`)
        expect(result.isOk).toBe(true)
        expect(result.feedback).toContain('pas celle qui était attendue')
        expect(comparer(`-\\frac{1}{${inverse[1]}}`).isOk).toBe(false)
        inverses++
      } else if (simple != null) {
        // -(-b)^1 = b
        const result = comparer(simple[1])
        expect(result.isOk).toBe(true)
        expect(result.feedback).toContain('pas celle qui était attendue')
        expect(comparer(`-${simple[1]}`).isOk).toBe(false)
        simples++
      }
    }
    expect(inverses).toBeGreaterThan(0)
    expect(simples).toBeGreaterThan(0)
  })
})
