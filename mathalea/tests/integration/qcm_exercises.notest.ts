import { describe, expect, it, vi } from 'vitest'
import ExerciceQcm from '../../src/exercices/ExerciceQcm.js'
import { aLeBonNombreDePropsDifferentes } from '../../src/lib/interactif/qcm.js'
import { mathaleaLoadExerciceFromUuid } from '../../src/lib/mathalea.js'
import { findStatic, findUuid } from '../e2e/helpers/filter.js'

vi.mock('../../../../src/lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    }
  },
})

// Options de comparaison par défaut (adapter si besoin)

// Utilitaire pour détecter un QCM (présence de reponses ou distracteurs non vide)
function isQcmExercice(exercice: any) {
  return (
    (Array.isArray(exercice.reponses) && exercice.reponses.length > 0) ||
    (Array.isArray(exercice.distracteurs) && exercice.distracteurs.length > 0)
  )
}

// Calcule le nombre de réponses attendues pour l'exercice
function getExpectedCount(exercice: any) {
  if (Array.isArray(exercice.reponses) && exercice.reponses.length > 0) {
    return exercice.reponses.length
  }
  if (
    Array.isArray(exercice.distracteurs) &&
    exercice.distracteurs.length > 0
  ) {
    return exercice.distracteurs.length + 1 // +1 pour la bonne réponse
  }
  return 0
}

// Fonction principale de test
async function testQcmExercice(uuid: string) {
  const exercice = await mathaleaLoadExerciceFromUuid(uuid)
  if (!isQcmExercice(exercice)) {
    // Pas un QCM, on ignore
    return true
  }
  if (typeof exercice.nouvelleVersion === 'function') {
    exercice.nouvelleVersion()
  }
  let reponses: string[] = []
  if (exercice instanceof ExerciceQcm) {
    reponses = exercice.reponses
  } else {
    reponses = [
      String(exercice.reponse),
      ...(exercice as any).distracteurs.map(String),
    ]
  }
  const expected = getExpectedCount(exercice)

  const ok = aLeBonNombreDePropsDifferentes(exercice, expected, true)
  if (!ok) {
    // Pour debug :
    console.error(
      `Exercice uuid=${uuid} n'a pas le bon nombre de réponses différentes (attendu: ${expected})`,
      `Chercher le ou les doublons dans ${JSON.stringify(reponses)}`,
    )
  }
  expect(ok, `uuid=${uuid} doit avoir ${expected} réponses différentes`).toBe(
    true,
  )
  return ok
}

// Fonction pour lancer les tests sur une liste d'UUIDs
async function runQcmTests(filter: string) {
  const uuids = filter.includes('dnb')
    ? await findStatic(filter)
    : await findUuid(filter)
  const filteredUuids = uuids.filter(([uuid]) => !!uuid)
  describe(`QCM exercises for filter '${filter}'`, () => {
    for (const [uuid, name] of filteredUuids) {
      it(`QCM uuid=${uuid} (${name})`, async () => {
        await testQcmExercice(uuid)
      })
    }
  })
}

// Modifier ici le filtre pour cibler les exercices souhaités
runQcmTests('1')
// runQcmTests('2')
// runQcmTests('3')
// runQcmTests('4')
// runQcmTests('5')
// runQcmTests('6')
// runQcmTests('T')
// runQcmTests('QCMBac')
// runQcmTests('QCMBrevet')
runQcmTests('QCMStatiques')
