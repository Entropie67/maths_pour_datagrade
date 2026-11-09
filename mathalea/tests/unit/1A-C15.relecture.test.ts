import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import C15_2 from '../../src/exercices/1e/1A-C15-2'
import C15_3 from '../../src/exercices/1e/1A-C15-3'
import C15_4 from '../../src/exercices/1e/1A-C15-4'
import C15_5 from '../../src/exercices/1e/1A-C15-5'
import C15_8 from '../../src/exercices/1e/1A-C15-8'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Reponse = {
  value: string
  compare?: (saisie: string, reponse: string) => { isOk: boolean }
}

function genere(
  Classe: new () => Exercice,
  graine: string,
  versionQcm: boolean,
  nbQuestions = 4,
) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = nbQuestions
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

const reponse = (exercice: Exercice, i: number) =>
  (exercice.autoCorrection[i] as unknown as { valeur: { reponse: Reponse } })
    .valeur.reponse

const propositions = (question: string) =>
  JSON.parse(
    question.match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
  ) as { texte: string; statut: boolean }[]

describe('1A-C15 : relecture', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const [code, Classe] of [
    ['1A-C15-2', C15_2],
    ['1A-C15-3', C15_3],
    ['1A-C15-4', C15_4],
    ['1A-C15-8', C15_8],
  ] as const) {
    it(`${code} : le clavier propose la touche fraction`, () => {
      for (let graine = 1; graine <= 10; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`, false)
        exercice.listeQuestions.forEach((question) => {
          expect(question).toContain('class-name="clavierDeBaseAvecFraction"')
        })
      }
    })
  }

  it('1A-C15-2, 3 : la fraction attendue est acceptée sous la forme saisie avec la touche fraction', () => {
    for (const [code, Classe] of [
      ['1A-C15-2', C15_2],
      ['1A-C15-3', C15_3],
    ] as const) {
      for (let graine = 1; graine <= 10; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`, false)
        const { value, compare } = reponse(exercice, 0)
        const saisie = value.replace('\\dfrac', '\\frac')
        expect(compare!(saisie, value).isOk, `${code} : ${saisie}`).toBe(true)
      }
    }
  })

  it('1A-C15-5 : la réponse libre est un nombre, mis en évidence tel quel dans la correction', () => {
    for (let graine = 1; graine <= 30; graine++) {
      const exercice = genere(C15_5, `c15-5-${graine}`, false)
      exercice.listeQuestions.forEach((_, i) => {
        const { value } = reponse(exercice, i)
        expect(value).toMatch(/^\d+(,\d+)?$/)
        expect(fonctionComparaison(value, value, { nombreDecimalSeulement: true }).isOk).toBe(true)
        expect(exercice.listeCorrections[i]).toContain(miseEnEvidence(value))
      })
    }
  })

  it('1A-C15-5 : les propositions du QCM sont bien formées, avec le bon pluriel', () => {
    let centimes = 0
    for (let graine = 1; graine <= 30; graine++) {
      const exercice = genere(C15_5, `c15-5-${graine}`, true)
      exercice.listeQuestions.forEach((question) => {
        for (const { texte } of propositions(question)) {
          expect(texte, texte).not.toContain('$$')
          expect(texte.match(/\$/g)?.length ?? 0, texte).toBeLessThanOrEqual(2)
          const m = texte.match(/^\$(\d+(?:,\d+)?)\$ centimes? d'euro$/)
          if (m) {
            centimes++
            const nombre = Number(m[1].replace(',', '.'))
            expect(texte.includes('centimes'), texte).toBe(nombre > 1)
          }
        }
      })
    }
    expect(centimes).toBeGreaterThan(0)
  })

  it('1A-C15-5 : les corrections du QCM ont des $ équilibrés', () => {
    for (let graine = 1; graine <= 40; graine++) {
      const exercice = genere(C15_5, `c15-5-${graine}`, true)
      exercice.listeCorrections.forEach((correction) => {
        expect((correction.match(/\$/g) ?? []).length % 2, correction).toBe(0)
      })
    }
  })

  it('1A-C15-8 : aucune proposition du QCM ne vaut la bonne réponse ni une autre proposition', () => {
    const valeur = (texte: string) => {
      const m = texte.match(/\\dfrac\{(\d+)\}\{(\d+)\}/)!
      return Number(m[1]) / Number(m[2])
    }
    for (let graine = 1; graine <= 60; graine++) {
      const exercice = genere(C15_8, `c15-8-${graine}`, true)
      exercice.listeQuestions.forEach((question) => {
        const valeurs = propositions(question).map((p) => valeur(p.texte))
        expect(new Set(valeurs.map((v) => v.toFixed(9))).size, `${graine}`).toBe(4)
      })
    }
  })
})
