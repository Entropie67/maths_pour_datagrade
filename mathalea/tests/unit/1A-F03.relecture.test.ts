import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import F03_5 from '../../src/exercices/1e/1A-F03-5'
import F03_6 from '../../src/exercices/1e/1A-F03-6'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function genere(
  Classe: new () => Exercice,
  graine: string,
  versionQcm: boolean,
) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 4
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

const propositions = (question: string) =>
  JSON.parse(
    question.match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
  ) as { texte: string; statut: boolean }[]

describe('1A-F03-5 et 1A-F03-6 : mise en évidence', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [code, Classe] of [
    ['1A-F03-5', F03_5],
    ['1A-F03-6', F03_6],
  ] as const) {
    it(`${code} : en QCM, la proposition « f(x)=… » est mise en évidence en entier`, () => {
      for (let graine = 1; graine <= 20; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`, true)
        exercice.listeQuestions.forEach((question, i) => {
          const bonne = propositions(question).find((p) => p.statut)!
          expect(exercice.listeCorrections[i], bonne.texte).toContain(
            miseEnEvidence(bonne.texte.replace(/^\$|\$$/g, '')),
          )
        })
      }
    })
  }

  // 1A-F03-5 n'existe plus qu'en QCM
  it("1A-F03-6 : en saisie libre, seule l'expression attendue est mise en évidence", () => {
    for (let graine = 1; graine <= 20; graine++) {
      const exercice = genere(F03_6, `1A-F03-6-${graine}`, false)
      exercice.listeQuestions.forEach((question, i) => {
        expect(question).toContain('$f(x)=$')
        const { value } = (
          exercice.autoCorrection[i] as unknown as {
            valeur: { reponse: { value: string } }
          }
        ).valeur.reponse
        expect(exercice.listeCorrections[i], value).toContain(
          `f(x)=${miseEnEvidence(value)}`,
        )
        expect(exercice.listeCorrections[i]).not.toContain(
          miseEnEvidence(`f(x)=${value}`),
        )
      })
    }
  })
})
