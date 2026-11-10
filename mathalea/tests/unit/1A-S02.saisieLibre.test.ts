import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'
import Exercice from '../../src/exercices/Exercice'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const modules = import.meta.glob('../../src/exercices/1e/1A-S02-[2-59].ts', {
  eager: true,
}) as Record<string, { default: new () => Exercice }>

const exercices = Object.entries(modules).map(([chemin, module]) => ({
  code: chemin.match(/1A-S02-\d/)![0],
  Classe: module.default,
}))

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
      compare: compare ?? ((saisie: string, reponse: string) =>
        fonctionComparaison(saisie, reponse)),
    }
  })
}

describe('1A-S02-2 à 5 et 9 : version non QCM par défaut', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('compte les 5 exercices', () => {
    expect(exercices).toHaveLength(5)
  })

  for (const { code, Classe } of exercices) {
    it(`${code} : la saisie libre est acceptée, sans libellé ni unité, et l'énoncé n'est plus une question à choix`, () => {
      for (let graine = 1; graine <= 40; graine++) {
        const exercice = genere(Classe, `${code}-${graine}`)
        expect(exercice.autoCorrection).toHaveLength(4)
        reponses(exercice).forEach(({ value, compare }, i) => {
          const cas = `${code} graine ${graine} : ${value}`
          expect(value, cas).not.toMatch(/[$%°]|text|circ|x=/)
          const enonce = exercice.listeQuestions[i]
          expect(enonce, cas).toContain('mathalea-mathfield')
          expect(enonce, cas).not.toContain('Parmi ces propositions')
          expect(enonce, cas).not.toMatch(/(est|:)\s*(<[^>]+>\s*)*$/)
          if (!value.startsWith('[')) {
            expect(compare(value, value).isOk, cas).toBe(true)
            expect(exercice.listeCorrections[i], cas).toContain(
              miseEnEvidence(value.replace('.', ',')),
            )
          }
        })
      }
    })

    it(`${code} : la case « Version QCM » rétablit les propositions`, () => {
      const exercice = genere(Classe, `${code}-qcm`, true)
      expect(exercice.besoinFormulaire3CaseACocher).toBeDefined()
      expect(exercice.listeQuestions[0]).not.toContain('mathalea-mathfield')
    })
  }

  it('1A-S02-4 : la valeur de x est demandée, y compris quand elle dépasse 20', () => {
    const Classe = exercices.find(({ code }) => code === '1A-S02-4')!.Classe
    let impossibles = 0
    for (let graine = 1; graine <= 80; graine++) {
      const exercice = genere(Classe, `impossible-${graine}`)
      reponses(exercice).forEach(({ value }, i) => {
        expect(exercice.listeQuestions[i]).toContain('Déterminer la valeur de $x$')
        if (Number(value) > 20) {
          impossibles++
          expect(exercice.listeCorrections[i]).toContain('impossible')
        }
      })
    }
    expect(impossibles).toBeGreaterThan(0)
  })

  it('1A-S02-9 : toute note comprise entre 0 et la médiane voulue est acceptée', () => {
    const Classe = exercices.find(({ code }) => code === '1A-S02-9')!.Classe
    for (let graine = 1; graine <= 40; graine++) {
      const exercice = genere(Classe, `mediane-${graine}`)
      reponses(exercice).forEach(({ value, compare }, i) => {
        const m = Number(value.match(/^\[0;(\d+)\]$/)![1])
        const cas = `${value} : ${exercice.listeQuestions[i]}`
        for (const note of [0, m / 2, m - 1, m]) {
          expect(compare(String(note).replace('.', ','), value).isOk, `${cas} : ${note}`).toBe(true)
        }
        for (const note of [-1, m + 1, m + 0.5, 20]) {
          expect(compare(String(note).replace('.', ','), value).isOk, `${cas} : ${note}`).toBe(false)
        }
        expect(exercice.listeCorrections[i]).toContain(`Toute note comprise entre $0$ et $${m}$ convient`)
      })
    }
  })
})
