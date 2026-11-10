import seedrandom from 'seedrandom'
import katex from 'katex'
import { afterEach, expect, it, vi } from 'vitest'
import Geometrie from '../../src/exercices/geodyn/geoElements1'
import Calculer from '../../src/exercices/5e/5N1B-1'
import Liste from '../../src/exercices/modèlesExos/ExempleListeDeroulante'
import { ListeDeroulanteElement } from '../../src/lib/customElements/ListeDeroulanteElement'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

afterEach(() => {
  document.body.innerHTML = ''
})

it('5N1B-1 : les corrections restent en mathématiques en ligne pour les quinze opérations', () => {
  for (const decimals of [1, 2]) {
    for (const relatifs of [false, true]) {
      const e = new Calculer()
      e.nbQuestions = 15
      e.sup = '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15'
      e.sup2 = decimals
      e.sup3 = relatifs
      seedrandom('audit-10038', { global: true })
      e.nouvelleVersion()
      expect(e.listeCorrections).toHaveLength(15)
      for (const correction of e.listeCorrections) {
        expect(correction).not.toContain('$$')
        expect(correction.match(/\$/g)!.length % 2).toBe(0)
        for (const [, math] of correction.matchAll(/\$([^$]+)\$/g)) {
          expect(() =>
            katex.renderToString(math, { throwOnError: true }),
          ).not.toThrow()
        }
      }
    }
  }
})

it('addd5 : afficher et actualiser le choix de chaque instance, à un numéro non nul', async () => {
  const frame = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((fn) => {
      fn(0)
      return 0
    })
  try {
    const exercices = [2, 7].map((numero) => {
      const e = new Liste()
      e.numeroExercice = numero
      e.interactif = true
      e.nouvelleVersion()
      return e
    })
    for (const e of exercices) {
      const container = document.createElement('div')
      document.body.append(container)
      container.innerHTML = e.listeQuestions[0] + e.listeCorrections[0]
      const liste = container.querySelector(
        'liste-deroulante',
      ) as ListeDeroulanteElement
      liste.value = 'phi'
      liste.dispatchEvent(new Event('change'))
      expect(
        container.querySelector('span[id^="choixEffectue"]')?.textContent,
      ).toBe('phi')
      liste.value = 'soleil'
      liste.dispatchEvent(new Event('change'))
      expect(
        container.querySelector('span[id^="choixEffectue"]')?.textContent,
      ).toBe('soleil')
    }
  } finally {
    document.body.innerHTML = ''
    frame.mockRestore()
  }
})

it('elements1 : inclure les crochets et parenthèses dans les formules des trois traits', () => {
  seedrandom('audit-10038', { global: true })
  const e = new Geometrie()
  e.numeroExercice = 3
  e.nouvelleVersion()
  expect(e.traits).toHaveLength(3)
  for (const trait of e.traits) {
    expect(trait.notation).toMatch(/^\$[[(][A-Z]{2}[)\]]\$$/)
    expect(trait.wrongFeedback).toContain(trait.notation)
    expect(e.question).toContain(trait.notation)
  }
})
