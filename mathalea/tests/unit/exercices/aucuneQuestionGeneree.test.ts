import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it } from 'vitest'
import SimplifierFractions3e from '../../../src/exercices/3e/3A11-0'
import SimplifierFractions from '../../../src/exercices/4e/4C24'
import ProprietesParallelesPerpendiculaires from '../../../src/exercices/5e/5G4A-4'
import NombreDecimalOraliseDeDifferentesManieres from '../../../src/exercices/6e/6N1B'
import LeCompteEstBon from '../../../src/exercices/enigmes-jeux/EN-le-compte-est-bon'
import { pgcd } from '../../../src/lib/outils/primalite'
import { setOutputHtml } from '../../../src/modules/context'

type Reglages = Record<string, string | number | boolean>
type ExerciceTestable = {
  numeroExercice?: number
  listeQuestions: string[]
  listeCorrections: string[]
  nouvelleVersion: () => void
}

const GRAINES = ['a', 'b', 'c', 'd', 'e', 'f']

function generer(
  ClasseExercice: new () => object,
  reglages: Reglages,
  graine: string,
) {
  seedrandom(graine, { global: true })
  const exercice = new ClasseExercice() as ExerciceTestable
  Object.assign(exercice, reglages)
  exercice.numeroExercice = 0
  exercice.nouvelleVersion()
  return exercice
}

function fractions(exercice: ExerciceTestable): [number, number][] {
  return exercice.listeQuestions.map((question) => {
    // Les grands nombres contiennent une espace fine : 161\,051.
    const resultat = question
      .replaceAll('\\,', '')
      .match(/\\dfrac\{(\d+)\}\{(\d+)\}/)
    expect(resultat).not.toBeNull()
    return [Number(resultat?.[1]), Number(resultat?.[2])]
  })
}

function nombreDeFacteursPremiers(n: number): number {
  let reste = n
  let compteur = 0
  for (let p = 2; p <= reste; p++) {
    while (reste % p === 0) {
      compteur++
      reste /= p
    }
  }
  return compteur
}

beforeEach(() => setOutputHtml())

describe('#9978 : chaque combinaison de réglages produit au moins une question', () => {
  describe.each([
    ['4C24', SimplifierFractions],
    ['3A11-0', SimplifierFractions3e],
  ])('%s avec un seul facteur premier', (_, ClasseExercice) => {
    it.each([1, 2, 3, 4, 5, 23])(
      'garde le nombre de facteurs communs demandé avec sup2=%s',
      (sup2) => {
        for (const sup of [1, 2, 3, 4]) {
          for (const graine of GRAINES) {
            const exercice = generer(ClasseExercice, { sup, sup2 }, graine)
            expect(exercice.listeQuestions.length).toBeGreaterThan(0)
            for (const [numerateur, denominateur] of fractions(exercice)) {
              expect(numerateur).not.toBe(denominateur)
              expect(
                nombreDeFacteursPremiers(pgcd(numerateur, denominateur)),
              ).toBe(sup)
            }
          }
        }
      },
    )
  })

  it.each([
    [3, 3, false],
    [3, 3, true],
    [4, 1, false],
    [4, 1, true],
    [4, 3, false],
    [4, 3, true],
    ['3-4', 3, false],
    [4, '1-3', true],
  ])(
    '5G4A-4 avec sup=%s, sup4=%s et sup5=%s',
    (sup, sup4, sup5) => {
      for (const graine of GRAINES) {
        const exercice = generer(
          ProprietesParallelesPerpendiculaires,
          { sup, sup4, sup5, sup3: false },
          graine,
        )
        expect(exercice.listeQuestions).toHaveLength(3)
      }
    },
  )

  it.each([
    [4, 1],
    [4, 2],
    [5, 1],
    [5, 2],
    [7, 1],
    [7, 2],
    ['5-6', 1],
    ['5-6', 2],
  ])('6N1B « Que depuis l\'unité » avec sup=%s et sup2=%s', (sup, sup2) => {
    for (const sup3 of [true, false]) {
      for (const graine of GRAINES) {
        const exercice = generer(
          NombreDecimalOraliseDeDifferentesManieres,
          { sup, sup2, sup3, sup4: true },
          graine,
        )
        expect(exercice.listeQuestions.length).toBeGreaterThan(0)
      }
    }
  })

  it.each([
    [1, 1, 1],
    [1, 5, 1],
    [5, 5, 5],
  ])(
    'EN-CompteBon avec une solution exacte et une cible entre %s et %s',
    (sup, sup2, sup3) => {
      const exercice = generer(
        LeCompteEstBon,
        { sup, sup2, sup3, sup4: true, sup5: true },
        'a',
      )
      expect(exercice.listeQuestions).toHaveLength(1)
      expect(exercice.listeCorrections[0]).toContain('Une solution exacte est')
    },
  )
})
