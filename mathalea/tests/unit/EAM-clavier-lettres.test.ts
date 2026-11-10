import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ANnonSpeQ10 from '../../src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q10'
import CENonSpeQ10 from '../../src/exercices/EAMPremiere/EAM-CENonSpe-2026-Q10'
import PolynesieSpeQ4 from '../../src/exercices/EAMPremiere/EAM-PolynesieSpe-2026-Q4'
import Exercice from '../../src/exercices/Exercice'
import { touchesDeLaReponse } from '../../src/lib/interactif/claviers/touchesDeLaReponse'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

describe('touchesDeLaReponse', () => {
  it('donne les lettres de la réponse, sans les commandes LaTeX', () => {
    expect(touchesDeLaReponse('\\dfrac{2E}{v^2}')).toEqual(['E', 'v'])
  })

  it('ajoute la racine carrée et le ℓ quand la réponse en contient', () => {
    expect(touchesDeLaReponse('\\sqrt{\\dfrac{2E}{m}}')).toEqual([
      'E',
      'm',
      'SQRT',
    ])
    expect(touchesDeLaReponse('2\\ell')).toEqual(['\\ell'])
  })

  it('ajoute la touche indice quand la réponse en contient', () => {
    expect(touchesDeLaReponse('\\dfrac{F\\times R^2}{m_1\\times m_2}')).toEqual([
      'F',
      'R',
      'm',
      'INDICE',
    ])
    expect(touchesDeLaReponse('\\dfrac{2E_C}{v^2}')).toContain('INDICE')
    expect(touchesDeLaReponse('x+1')).not.toContain('INDICE')
  })
})

describe('annales : le clavier propose les lettres de la réponse', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [nom, Classe] of [
    ['EAM-ANnonSpe-2026-Q10', ANnonSpeQ10],
    ['EAM-CENonSpe-2026-Q10', CENonSpeQ10],
    ['EAM-PolynesieSpe-2026-Q4', PolynesieSpeQ4],
  ] as const) {
    it(`${nom} : chaque lettre à saisir est une touche du champ`, () => {
      const reponsesVues = new Set<string>()
      for (let graine = 1; graine <= 30; graine++) {
        seedrandom(`${nom}-${graine}`, { global: true })
        const exercice: Exercice = new Classe()
        exercice.interactif = true
        exercice.numeroExercice = 0
        exercice.nbQuestions = 4
        exercice.sup3 = false
        exercice.nouvelleVersion()
        exercice.listeQuestions.forEach((question, i) => {
          const { value } = (
            exercice.autoCorrection[i] as unknown as {
              valeur: { reponse: { value: string } }
            }
          ).valeur.reponse
          reponsesVues.add(value)
          const cles = JSON.parse(
            question.match(/data-keys="([^"]*)"/)![1].replaceAll('&quot;', '"'),
          ).flat() as string[]
          for (const lettre of value
            .replace(/\\[a-zA-Z]+/g, '')
            .match(/[a-zA-Z]/g) ?? []) {
            expect(cles, `${value} : ${lettre}`).toContain(lettre)
          }
          if (value.includes('_')) expect(cles).toContain('INDICE')
        })
      }
      expect(reponsesVues.size).toBeGreaterThan(1)
    })
  }
})
