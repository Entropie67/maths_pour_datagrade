import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CESpeQ7 from '../../src/exercices/EAMPremiere/EAM-CESpe-2026-Q7'
import FMnonSpeQ2 from '../../src/exercices/EAMPremiere/EAM-FMnonSpe-2026-Q2'
import FMnonSpeQ5 from '../../src/exercices/EAMPremiere/EAM-FMnonSpe-2026-Q5'
import Exercice from '../../src/exercices/Exercice'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

/** Chiffres écrits hors mode mathématique (figures et composants exclus). */
function chiffresHorsDollars(html: string): string[] {
  const texte = html
    .replaceAll('&quot;', '"')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<div[^>]*divLatex[^>]*>[\s\S]*?<\/div>/g, ' ')
    .replace(/<(mathalea-[a-z-]+|tableau-mathlive|table)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<mathalea-[^>]*>/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
  return [...texte.matchAll(/\S*\d\S*/g)].map((m) => m[0])
}

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

describe('annales : les nombres des textes sont écrits entre $', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [nom, Classe] of [
    ['EAM-CESpe-2026-Q7', CESpeQ7],
    ['EAM-FMnonSpe-2026-Q2', FMnonSpeQ2],
    ['EAM-FMnonSpe-2026-Q5', FMnonSpeQ5],
  ] as const) {
    for (const versionQcm of [false, true]) {
      it(`${nom} (${versionQcm ? 'QCM' : 'saisie libre'}) : aucun chiffre hors $`, () => {
        for (let graine = 1; graine <= 25; graine++) {
          const exercice = genere(Classe, `${nom}-${graine}`, versionQcm)
          exercice.listeQuestions.forEach((question, i) => {
            expect(chiffresHorsDollars(question), `${nom} q${i}`).toEqual([])
            expect(
              chiffresHorsDollars(exercice.listeCorrections[i]),
              `${nom} correction ${i}`,
            ).toEqual([])
          })
        }
      })
    }
  }

  it('EAM-CESpe-2026-Q7 : la question de la saisie libre est bien reformulée', () => {
    const exercice = genere(CESpeQ7, 'reformulation', false)
    exercice.listeQuestions.forEach((question) => {
      expect(question).toContain('La probabilité que ce soit un élève')
      expect(question).not.toMatch(/ans est :/)
    })
  })
})
