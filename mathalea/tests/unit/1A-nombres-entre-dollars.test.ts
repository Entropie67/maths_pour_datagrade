import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import P03_1 from '../../src/exercices/1e/1A-P03-1'
import P03_2 from '../../src/exercices/1e/1A-P03-2'
import S02_2 from '../../src/exercices/1e/1A-S02-2'
import S02_4 from '../../src/exercices/1e/1A-S02-4'
import S04_8 from '../../src/exercices/1e/1A-S04-8'

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
  exercice.nbQuestions = 4
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

describe('1A : les nombres des textes sont écrits entre $', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [code, Classe] of [
    ['1A-P03-1', P03_1],
    ['1A-P03-2', P03_2],
    ['1A-S02-2', S02_2],
    ['1A-S02-4', S02_4],
    ['1A-S04-8', S04_8],
  ] as const) {
    for (const versionQcm of [false, true]) {
      it(`${code} (${versionQcm ? 'QCM' : 'saisie libre'}) : aucun chiffre hors $ dans l'énoncé, la correction et les propositions`, () => {
        for (let graine = 1; graine <= 30; graine++) {
          const exercice = genere(Classe, `${code}-${graine}`, versionQcm)
          exercice.listeQuestions.forEach((question, i) => {
            expect(chiffresHorsDollars(question), `${code} q${i}`).toEqual([])
            expect(
              chiffresHorsDollars(exercice.listeCorrections[i]),
              `${code} correction ${i}`,
            ).toEqual([])
            const propositions = question.match(/propositions="([^"]*)"/)
            if (propositions) {
              for (const { texte } of JSON.parse(
                propositions[1].replaceAll('&quot;', '"'),
              ) as { texte: string }[]) {
                expect(chiffresHorsDollars(texte), texte).toEqual([])
              }
            }
          })
        }
      })
    }
  }
})
