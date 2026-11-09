import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import S01_8 from '../../src/exercices/1e/1A-S01-8'
import AGTechnoQ10 from '../../src/exercices/EAMPremiere/EAM-AGTechno-2026-Q10'
import AGnonSpeQ2 from '../../src/exercices/EAMPremiere/EAM-AGnonSpe-2026-Q2'
import ANSpeQ5 from '../../src/exercices/EAMPremiere/EAM-ANSpe-2026-Q5'
import FMTechnoQ12 from '../../src/exercices/EAMPremiere/EAM-FMTechno-2026-Q12'
import PolynesieSpeQ5 from '../../src/exercices/EAMPremiere/EAM-PolynesieSpe-2026-Q5'
import Exercice from '../../src/exercices/Exercice'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Proposition = { texte: string; statut: boolean }

function genere(Classe: new () => Exercice, graine: string, versionQcm: boolean) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 3
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

const propositions = (question: string) =>
  JSON.parse(
    question.match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
  ) as Proposition[]

/** Contenu des \boldsymbol{…} d'une correction (accolades équilibrées). */
function misesEnEvidence(correction: string): string[] {
  const resultat: string[] = []
  let i = correction.indexOf('\\boldsymbol{')
  while (i !== -1) {
    let j = i + '\\boldsymbol{'.length
    let profondeur = 1
    let contenu = ''
    while (j < correction.length && profondeur > 0) {
      if (correction[j] === '{') profondeur++
      else if (correction[j] === '}') profondeur--
      if (profondeur > 0) contenu += correction[j]
      j++
    }
    resultat.push(contenu)
    i = correction.indexOf('\\boldsymbol{', j)
  }
  return resultat
}

const sansEspaces = (texte: string) =>
  texte.replace(/\\(?:,|!|;|:| )|\s/g, '').replace(/^\$|\$$/g, '')

describe('QCM : la bonne réponse est mise en évidence, la saisie libre garde la sienne', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [nom, Classe] of [
    ['EAM-ANSpe-2026-Q5', ANSpeQ5],
    ['EAM-PolynesieSpe-2026-Q5', PolynesieSpeQ5],
    ['EAM-FMTechno-2026-Q12', FMTechnoQ12],
    ['EAM-AGTechno-2026-Q10', AGTechnoQ10],
    ['EAM-AGnonSpe-2026-Q2', AGnonSpeQ2],
  ] as const) {
    it(`${nom} : en QCM, la bonne proposition est mise en évidence`, () => {
      for (let graine = 1; graine <= 20; graine++) {
        const exercice = genere(Classe, `${nom}-${graine}`, true)
        exercice.listeQuestions.forEach((question, i) => {
          const bonne = sansEspaces(
            propositions(question).find((p) => p.statut)!.texte,
          )
          const mises = misesEnEvidence(exercice.listeCorrections[i]).map(
            sansEspaces,
          )
          expect(mises.length, `${nom} q${i}`).toBeGreaterThan(0)
          expect(
            mises.some((m) => bonne.includes(m) || m.includes(bonne)),
            `${nom} q${i} : bonne « ${bonne} », mises en évidence « ${mises.join(' ; ')} »`,
          ).toBe(true)
        })
      }
    })

    it(`${nom} : en saisie libre, une seule mise en évidence, celle de la réponse attendue`, () => {
      for (let graine = 1; graine <= 20; graine++) {
        const exercice = genere(Classe, `${nom}-${graine}`, false)
        exercice.listeQuestions.forEach((_, i) => {
          const mises = misesEnEvidence(exercice.listeCorrections[i])
          expect(mises, `${nom} q${i}`).toHaveLength(1)
        })
      }
    })
  }

  it('1A-S01-8 : la correction du QCM donne l’affirmation vraie, en évidence', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const exercice = genere(S01_8, `s01-8-${graine}`, true)
      exercice.listeQuestions.forEach((question, i) => {
        const bonne = propositions(question).find((p) => p.statut)!.texte
        expect(exercice.listeCorrections[i]).toContain(
          "L'affirmation vraie est donc",
        )
        expect(exercice.listeCorrections[i]).toContain(bonne)
      })
    }
  })
})
