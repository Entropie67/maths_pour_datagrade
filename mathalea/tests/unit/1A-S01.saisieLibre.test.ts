import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const modules = {
  ...import.meta.glob('../../src/exercices/1e/1A-S01-[2368].ts', {
    eager: true,
  }),
  ...import.meta.glob('../../src/exercices/2e/2A-S1-5.ts', { eager: true }),
} as Record<string, { default: new () => Exercice }>

const exercices = Object.entries(modules).map(([chemin, module]) => ({
  code: chemin.match(/1A-S01-\d|2A-S1-5/)![0],
  Classe: module.default,
}))
const classe = (code: string) => exercices.find((e) => e.code === code)!.Classe

type Compare = (saisie: string, reponse: string) => { isOk: boolean }

/** Instancie l'exercice avec une graine donnée, en version interactive. */
function genere(Classe: new () => Exercice, graine: string, versionQcm = false) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 4
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

/** Réponse attendue et fonction de comparaison de chaque question en saisie libre. */
function reponses(exercice: Exercice) {
  return exercice.autoCorrection.map((autoCorrection) => {
    const { value, compare } = (
      autoCorrection as unknown as {
        valeur: { reponse: { value: string; compare?: Compare } }
      }
    ).valeur.reponse
    return {
      value: String(value),
      compare:
        compare ??
        ((saisie: string, reponse: string) =>
          fonctionComparaison(saisie, reponse)),
    }
  })
}

/** Textes mis en évidence dans une correction, sans espaces fines ni accolades de la virgule. */
const misesEnEvidence = (correction: string) =>
  [...correction.matchAll(/\\boldsymbol\{([^}]*(?:\{,\}[^}]*)*)\}/g)].map(
    ([, texte]) =>
      texte.replace(/\\,/g, '').replace(/\{,\}/g, ',').replace(/\\%/g, ''),
  )

describe('1A-S01-2, 3, 6, 7 (2A-S1-5) et 8 : version non QCM par défaut', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('compte les 5 exercices', () => {
    expect(exercices).toHaveLength(5)
  })

  for (const { code, Classe } of exercices) {
    it(`${code} : la saisie libre est acceptée, sans libellé ni unité, et mise en évidence dans la correction`, () => {
      for (let graine = 1; graine <= 40; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`)
        expect(exercice.autoCorrection).toHaveLength(4)
        reponses(exercice).forEach(({ value, compare }, i) => {
          const cas = `${code} graine ${graine} : ${value}`
          expect(value, cas).toMatch(/^\d+(,\d+)?$/)
          expect(compare(value, value).isOk, cas).toBe(true)
          const enonce = exercice.listeQuestions[i]
          expect(enonce, cas).toContain('mathalea-mathfield')
          expect(enonce, cas).not.toMatch(/Parmi|laquelle|Quelle affirmation/)
          expect(misesEnEvidence(exercice.listeCorrections[i]), cas).toContain(
            value,
          )
        })
      }
    })

    it(`${code} : la case « Version QCM » est visible et rétablit les propositions`, () => {
      const exercice = genere(Classe, `${code}-qcm`, true)
      expect(Array.isArray(exercice.besoinFormulaire3CaseACocher)).toBe(true)
      expect(exercice.listeQuestions[0]).not.toContain('mathalea-mathfield')
    })
  }

  it('1A-S01-2 : la saisie libre est le réglage par défaut', () => {
    const exercice = new (classe('1A-S01-2'))()
    expect(exercice.sup3).toBe(false)
    expect(exercice.besoinFormulaire3CaseACocher).toEqual(['Version QCM', false])
  })

  it('1A-S01-6 : le nombre d’habitants par carreau est écrit en mode mathématique', () => {
    const exercice = genere(classe('1A-S01-6'), 'habitants')
    expect(exercice.listeQuestions[0]).toContain('\\text{ habitants}')
    expect(exercice.listeQuestions[0]).toContain('Calculer $t$.')
  })

  it('1A-S01-8 : la grandeur demandée dépend de l’affirmation vraie du QCM', () => {
    const grandeurs = new Set<string>()
    for (let graine = 1; graine <= 60; graine++) {
      const exercice = genere(classe('1A-S01-8'), `moustaches-${graine}`)
      exercice.listeQuestions.forEach((question) => {
        const [, grandeur] = question.match(
          /Déterminer (la médiane|le minimum|l'étendue|le premier quartile|le troisième quartile) de cette série\./,
        )!
        grandeurs.add(grandeur)
      })
    }
    expect([...grandeurs].sort()).toEqual(
      [
        'la médiane',
        'le minimum',
        "l'étendue",
        'le premier quartile',
        'le troisième quartile',
      ].sort(),
    )
  })

  it('2A-S1-5 (1A-S01-7) : médiane lue, ou nombre d’individus au plus / au-delà du seuil', () => {
    const questions = new Set<string>()
    for (let graine = 1; graine <= 60; graine++) {
      const exercice = genere(classe('2A-S1-5'), `cumules-${graine}`)
      exercice.listeQuestions.forEach((question) => {
        const [, type] = question.match(
          /(Lire graphiquement la médiane de cette série\.|Déterminer le nombre d'?e? ?\S+ dont la \S+ est (?:inférieure ou égale|strictement supérieure))/,
        )!
        questions.add(type.startsWith('Lire') ? 'mediane' : type.includes('strictement') ? 'superieur' : 'inferieur')
      })
    }
    expect([...questions].sort()).toEqual(['inferieur', 'mediane', 'superieur'])
  })
})
