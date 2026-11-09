import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'
import Exercice from '../../src/exercices/Exercice'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const modules = import.meta.glob('../../src/exercices/1e/1A-S04-[1-8].ts', {
  eager: true,
}) as Record<string, { default: new () => Exercice }>

const exercices = Object.entries(modules).map(([chemin, module]) => ({
  code: chemin.match(/1A-S04-\d/)![0],
  Classe: module.default,
}))

/** Instancie l'exercice avec une graine donnée, en version interactive. */
function genere(Classe: new () => Exercice, graine: string, versionQcm = false) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 3
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

describe('1A-S04-1 à 8 : version non QCM par défaut', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('compte les 8 exercices', () => {
    expect(exercices).toHaveLength(8)
  })

  for (const { code, Classe } of exercices) {
    it(`${code} : la réponse attendue est un nombre saisissable, mis en évidence dans la correction`, () => {
      for (let graine = 1; graine <= 40; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`)
        expect(exercice.autoCorrection).toHaveLength(3)
        exercice.autoCorrection.forEach((autoCorrection, i) => {
          const value = String(
            (autoCorrection as unknown as {
              valeur: { reponse: { value: string } }
            }).valeur.reponse.value,
          )
          expect(value, `${code} graine ${graine}`).not.toMatch(/[$%°]|text|circ/)
          expect(
            fonctionComparaison(value, value).isOk,
            `${code} graine ${graine} : ${value}`,
          ).toBe(true)
          expect(
            exercice.listeCorrections[i],
            `${code} graine ${graine}`,
          ).toContain(miseEnEvidence(value))
        })
        expect(exercice.listeQuestions[0]).toContain('mathalea-mathfield')
      }
    })

    it(`${code} : la case « Version QCM » rétablit les 4 propositions`, () => {
      const exercice = genere(Classe, `${code}-qcm`, true)
      expect(exercice.besoinFormulaire3CaseACocher).toBeDefined()
      expect(exercice.listeQuestions[0]).not.toContain('mathalea-mathfield')
    })
  }
})
