import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Intersection from '../../../../src/exercices/TSpe/TSP1-10'
import Conditionnelle from '../../../../src/exercices/TSpe/TSP1-11'
import * as outils from '../../../../src/modules/outils'

afterEach(() => {
  seedrandom('apres-TSP1-10-11', { global: true })
  vi.restoreAllMocks()
})

function valeur(tex: string): number {
  const fraction = tex.match(/\\dfrac\{(\d+)\}\{(\d+)\}/)
  if (fraction) return Number(fraction[1]) / Number(fraction[2])
  return Number(tex.replaceAll('$', ''))
}

describe.each([
  ['TSP1-10', Intersection, 7 / 25],
  ['TSP1-11', Conditionnelle, 1 / 3],
] as const)('%s', (code, Classe, originale) => {
  it('ne tire aucune valeur dans le constructeur et conserve le sujet original', () => {
    const random = vi.spyOn(outils, 'randint')
    const exercice = new Classe()
    expect(random).not.toHaveBeenCalled()
    expect(valeur(exercice.reponses[0])).toBeCloseTo(originale)
  })

  it('varie les données et propose une seule bonne réponse pour 100 graines reproductibles', () => {
    const enonces = new Set<string>()
    for (let seed = 0; seed < 100; seed++) {
      const generer = () => {
        seedrandom(`${code}-${seed}`, { global: true })
        const exercice = new Classe()
        exercice.nouvelleVersion()
        return exercice
      }
      const exercice = generer()
      const copie = generer()
      expect(exercice.listeQuestions).toEqual(copie.listeQuestions)
      expect(exercice.listeCorrections).toEqual(copie.listeCorrections)
      const fractions = [
        ...exercice.enonce.matchAll(/est (?:égale à|de) \$(.*?)\$/g),
      ].map((match) => valeur(match[1]))
      expect(fractions).toHaveLength(3)
      const [pA, pGa, pG] = fractions
      const pGb = (pG - pA * pGa) / (1 - pA)
      expect(pGb).toBeGreaterThan(0)
      expect(pGb).toBeLessThan(1)
      expect(valeur(exercice.reponses[0])).toBeCloseTo(
        code === 'TSP1-10' ? pA * pGa : pGb,
      )
      const valeurs = exercice.reponses.map(valeur)
      expect(new Set(valeurs).size).toBe(4)
      expect(valeurs.every((p) => p > 0 && p < 1)).toBe(true)
      expect(
        exercice.autoCorrection[0].propositions?.filter((p) => p.statut),
      ).toHaveLength(1)
      enonces.add(exercice.enonce)
    }
    expect(enonces.size).toBeGreaterThan(20)
  })
})
