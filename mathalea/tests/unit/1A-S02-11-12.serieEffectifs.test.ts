import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import {
  effectifTotal,
  medianeSerie,
  moyenneSerie,
  sommeSerie,
} from '../../src/lib/outils/serieEffectifs'
import MoyenneTableau from '../../src/exercices/1e/1A-S02-11'
import MedianeTableau from '../../src/exercices/1e/1A-S02-12'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function genere(Classe: new () => ExerciceSimple, graine: string) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 8
  exercice.seed = graine
  mathaleaHandleExerciceSimple(exercice, true, 0)
  return exercice
}

describe('serieEffectifs', () => {
  const serie = { valeurs: [2, 4, 7, 9], effectifs: [3, 1, 2, 2] }
  it('somme exacte en entiers', () => {
    expect(sommeSerie({ valeurs: [1, 2, 4, 5], effectifs: [4, 4, 2, 1] })).toBe(
      25,
    )
  })
  it('calcule effectif, moyenne et médiane', () => {
    expect(effectifTotal(serie)).toBe(8)
    expect(moyenneSerie(serie)).toBe(5.25)
    expect(medianeSerie(serie)).toBe(5.5)
    expect(medianeSerie({ valeurs: [1, 5], effectifs: [2, 3] })).toBe(5)
  })
})

describe('1A-S02-11 et 1A-S02-12', () => {
  beforeEach(() => {
    seedrandom('init', { global: true })
  })
  for (const graine of ['a', 'b', 'c', 'd']) {
    it(`11 : tableau, réponse entière (graine ${graine})`, () => {
      const exo = genere(MoyenneTableau, graine)
      expect(exo.listeQuestions).toHaveLength(8)
      for (const q of exo.listeQuestions) expect(q).toContain('Effectif')
      for (const c of exo.listeCorrections) expect(c).toContain('moyenne')
    })
    it(`12 : tableau, médiane (graine ${graine})`, () => {
      const exo = genere(MedianeTableau, graine)
      expect(exo.listeQuestions).toHaveLength(8)
      for (const q of exo.listeQuestions) expect(q).toContain('Effectif')
    })
  }
})

describe('1A-S02-11 : moyenne entière ou décimale simple', () => {
  it('donne une moyenne entière ou décimale, jamais une fraction', () => {
    for (const graine of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const exo = genere(MoyenneTableau, graine)
      expect(exo.listeQuestions).toHaveLength(8)
      for (const correction of exo.listeCorrections) {
        // dernier dénominateur écrit : 2, 4 ou 5 (ou total simplifié en nombre décimal)
        const denominateurs = [
          ...correction.matchAll(/dfrac\{[\d\s{}\\,]+\}\{(\d+)\}/g),
        ].map((m) => Number(m[1]))
        expect(denominateurs.length).toBeGreaterThan(0)
        expect(correction).toMatch(/=\s*[^=]*\d\$/)
        expect(correction).not.toMatch(/\$\\dfrac\{\d+\}\{\d+\}\$\.$/)
      }
    }
  })
  it('accepte la saisie décimale et refuse une valeur fausse', async () => {
    const { fonctionComparaison } =
      await import('../../src/lib/interactif/comparisonFunctions')
    expect(fonctionComparaison('2,75', '2,75').isOk).toBe(true)
    expect(fonctionComparaison('2,7', '2,75').isOk).toBe(false)
  })
})

describe('1A-S02-12 : effectif et parité', () => {
  it('une classe compte de 20 à 25 élèves, sinon de 9 à 13, avec les deux parités', () => {
    const parites = new Set<number>()
    let classes = 0
    for (const graine of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const exo = genere(MedianeTableau, graine)
      exo.listeQuestions.forEach((q, i) => {
        const total = Number(
          /L'effectif total est \$(\d+)\$/.exec(exo.listeCorrections[i])![1],
        )
        parites.add(total % 2)
        if (q.includes('classe')) {
          classes++
          expect(total).toBeGreaterThanOrEqual(20)
          expect(total).toBeLessThanOrEqual(25)
        } else {
          expect(total).toBeGreaterThanOrEqual(9)
          expect(total).toBeLessThanOrEqual(13)
        }
      })
    }
    expect(classes).toBeGreaterThan(0)
    expect(parites.size).toBe(2)
  })
})

describe('1A-S02-12 : plusieurs valeurs médianes', () => {
  it('accepte tout nombre compris entre les deux valeurs centrales', async () => {
    const { fonctionComparaison } =
      await import('../../src/lib/interactif/comparisonFunctions')
    const options = { estDansIntervalle: true }
    for (const saisie of ['4', '5', '6', '4,5'])
      expect(fonctionComparaison(saisie, '[4;6]', options).isOk).toBe(true)
    for (const saisie of ['3', '7', '6,5'])
      expect(fonctionComparaison(saisie, '[4;6]', options).isOk).toBe(false)
  })
  it('génère la même formulation « une valeur médiane » partout', () => {
    const exo = genere(MedianeTableau, 'm')
    expect(
      exo.listeQuestions.every((q) => !q.includes('Le nombre médian')),
    ).toBe(true)
    expect(
      exo.listeCorrections.some((c) => c.includes('est une valeur médiane')),
    ).toBe(true)
  })
})

describe('1A-S02-12 : conclusion de la correction', () => {
  it("reprend le sujet de l'énoncé", () => {
    const exo = genere(MedianeTableau, 'k')
    for (const c of exo.listeCorrections) {
      expect(c).toMatch(/[Ll]e nombre médian|[Uu]n nombre médian/)
      expect(c).not.toContain('Une valeur médiane')
    }
  })
})
