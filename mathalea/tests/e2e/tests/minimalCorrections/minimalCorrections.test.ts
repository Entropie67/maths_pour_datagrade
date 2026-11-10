/** Régression #9651 et contrôle des exercices modifiés, sur trois graines. */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import '../../helpers/setupExerciseGeneration'
import {
  getShortAnswer,
  reponsesMisesEnEvidence,
} from '../../../../src/components/setup/typst/minimalCorrection'
import { extraitLettresQcm } from '../../../../src/components/setup/diaporama/answersTable'
import ExerciceSimple from '../../../../src/exercices/ExerciceSimple'
import type { IExercice } from '../../../../src/lib/types'
import {
  combinaisonsParametres,
  installeGardeDeBoucle,
} from '../../helpers/empreinteExercice'

const { mathaleaLoadExerciceFromUuid, mathaleaHandleExerciceSimple } =
  await import('../../../../src/lib/mathalea')
const catalogue: Record<string, string> = JSON.parse(
  readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../src/json/uuidsToUrlFR.json',
    ),
    'utf8',
  ),
)

// Cas du ticket : série initiale, couleurs pédagogiques, corrections partielles,
// QCM et exemples de réponses qui nécessitent un tableau ou une construction.
const corpus = new Set([
  '9b4e6',
  'cd464',
  'ae913',
  'da0c1',
  'a2bbc',
  '1a706',
  '4b11f',
  '031f0',
  '1abca',
  'e4a1f',
  ...Object.entries(catalogue)
    .filter(([, path]) =>
      /^(?:4e\/(?:4C10-3|4C10-10|4G12)|6e\/(?:6G7B-8|6G0-6)|5e\/(?:5G3A-11|5N2A-1|5G6F-1)|3e\/3F10-1|2e\/(?:2G21-1|2F21-8|2F42-2|2L14-4|2L30-1|2P10-4)|1e\/(?:1AL20-3|1A-R01-1|1A-R01-2)|1eTec\/1Tec-F201|can\/1e\/(?:can1D3-05|can1SD12-03)|can\/2e\/can2F3-06|PE\/PEG20)\.ts$/.test(
        path,
      ),
    )
    .map(([uuid]) => uuid),
])
const changed = new Set(
  (process.env.CHANGED_FILES ?? '')
    .split(/[\s,]+/)
    .map((path) => path.replace(/^.*?src\/exercices\//, '')),
)
const filter = process.env.CORRECTIONS_FILTER
const targets = Object.entries(catalogue).filter(([uuid, path]) => {
  if (!path.endsWith('.ts')) return false
  if (/old\d*\.ts$/i.test(path) && !corpus.has(uuid)) return false
  if (/^(apps|ressources|profs|modèlesExos|beta)\//.test(path)) return false
  if (filter) return path.includes(filter) || uuid === filter
  return corpus.has(uuid) || changed.has(path)
})
const originalSeeds: Record<string, string> = {
  '9b4e6': 'W1iD',
  cd464: 'ezSj',
  ae913: 'rIN0',
  da0c1: 'jQDZ',
  a2bbc: 'NhzN',
  '1a706': 'QtIP',
  '4b11f': '8eK7',
  '031f0': 'uzpe',
  '1abca': 'YWIV',
  e4a1f: 'Q8sP',
}
const guard = installeGardeDeBoucle()

async function load(uuid: string): Promise<IExercice> {
  const exercise = await mathaleaLoadExerciceFromUuid(uuid)
  expect(exercise.titre).not.toMatch(/^Erreur -|^L'exercice n'existe pas/)
  exercise.numeroExercice = 1
  exercise.interactif = false
  if (exercise.nbQuestionsModifiable !== false) exercise.nbQuestions = 3
  return exercise
}

describe(`Réponses courtes (${targets.length} exercices)`, () => {
  it('conserve chaque réponse simple et efface celle du tirage précédent', () => {
    class Simple extends ExerciceSimple {
      turn = 0
      nouvelleVersion() {
        this.question = `Question ${this.turn}`
        this.correction = `Correction ${this.turn}`
        if (this.turn++ === 0) this.reponseCourteExplicite = '$42$'
      }
    }
    const exercise = new Simple()
    exercise.nbQuestions = 2
    mathaleaHandleExerciceSimple(exercise, false)
    expect(exercise.listeReponsesCourtes).toEqual(['$42$', undefined])
    mathaleaHandleExerciceSimple(exercise, false)
    expect(exercise.listeReponsesCourtes).toEqual([undefined, undefined])
  })

  it('sélectionne au moins un exercice', () =>
    expect(targets.length).toBeGreaterThan(0))
  for (const [uuid, path] of targets) {
    it(path, async () => {
      const model = await load(uuid)
      const combinations = combinaisonsParametres(
        [
          {
            numerique: model.besoinFormulaireNumerique,
            texte: model.besoinFormulaireTexte,
            caseACocher: model.besoinFormulaireCaseACocher,
          },
          {
            numerique: model.besoinFormulaire2Numerique,
            texte: model.besoinFormulaire2Texte,
            caseACocher: model.besoinFormulaire2CaseACocher,
          },
          {
            numerique: model.besoinFormulaire3Numerique,
            texte: model.besoinFormulaire3Texte,
            caseACocher: model.besoinFormulaire3CaseACocher,
          },
        ],
        [model.sup, model.sup2, model.sup3],
      )
      model.destroy?.()
      const missing: string[] = []
      for (const { cle, valeurs } of combinations) {
        for (const seed of [
          originalSeeds[uuid] ?? '9651-a',
          '9651-b',
          '9651-c',
        ]) {
          const exercise = await load(uuid)
          exercise.seed = seed
          if (valeurs[0] !== undefined) exercise.sup = valeurs[0]
          if (valeurs[1] !== undefined) exercise.sup2 = valeurs[1]
          if (valeurs[2] !== undefined) exercise.sup3 = valeurs[2]
          guard.demarre()
          try {
            if (exercise.typeExercice === 'simple')
              mathaleaHandleExerciceSimple(exercise, false)
            else exercise.nouvelleVersionWrapper()
            expect(
              exercise.listeQuestions.length,
              `${path}, ${seed}, ${cle}`,
            ).toBeGreaterThan(0)
            for (let i = 0; i < exercise.listeQuestions.length; i++) {
              const answer = getShortAnswer(exercise, i)
              if (
                answer === null ||
                answer?.trim() ||
                extraitLettresQcm(exercise, i).length > 0
              )
                continue
              if (
                reponsesMisesEnEvidence(exercise.listeCorrections[i] ?? '')
                  .length === 0
              ) {
                missing.push(`${seed}, ${cle || 'défaut'}, question ${i + 1}`)
              }
            }
          } finally {
            guard.arrete()
            exercise.destroy?.()
          }
        }
      }
      expect(
        missing,
        'Mettre la réponse finale en évidence, fournir listeReponsesCourtes ou déclarer explicitement l’absence de réponse courte.',
      ).toEqual([])
    })
  }
})
