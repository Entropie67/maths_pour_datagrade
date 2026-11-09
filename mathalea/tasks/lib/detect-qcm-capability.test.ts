import { describe, expect, it } from 'vitest'
import { isQcmExercise, offersNonQcmFormat } from './detect-qcm-capability.js'

describe('isQcmExercise', () => {
  it('détecte un appel moderne au builder QCM', () => {
    expect(
      isQcmExercise('/tmp/qcm-builder.ts', `buildQcmForExercise(this, 0, {})`),
    ).toBe(true)
  })

  it('détecte un format interactif QCM sans compter les propositions', () => {
    expect(
      isQcmExercise(
        '/tmp/qcm-format.ts',
        `this.autoCorrection[0] = { formatInteractif: 'mathalea-qcm' }`,
      ),
    ).toBe(true)
  })

  it('ignore les mentions QCM placées uniquement dans des commentaires', () => {
    expect(
      isQcmExercise(
        '/tmp/not-qcm.ts',
        `// propositionsQcm(this, 0)\nexport default class Exercice {}`,
      ),
    ).toBe(false)
  })

  it('suit un héritage local sur plusieurs fichiers', () => {
    expect(isQcmExercise('src/exercices/3e/3A10-0.ts')).toBe(true)
    expect(isQcmExercise('src/exercices/1e/1A-C09-3.ts')).toBe(true)
  })

  it('détecte les réponses dynamiques des classes ExerciceQcm', () => {
    expect(isQcmExercise('src/exercices/1e/1A-C01-1.ts')).toBe(true)
  })
})

describe('offersNonQcmFormat', () => {
  it('reconnaît un champ de saisie appelé dans le fichier', () => {
    expect(
      offersNonQcmFormat(
        '/tmp/hybride.ts',
        `propositionsQcm(this, 0)\najouteChampTexteMathLive(this, 0, '')`,
      ),
    ).toBe(true)
  })

  it('ignore les mentions placées uniquement dans des commentaires', () => {
    expect(
      offersNonQcmFormat(
        '/tmp/commentaire.ts',
        `// ajouteChampTexteMathLive(this, 0, '')\npropositionsQcm(this, 0)`,
      ),
    ).toBe(false)
  })

  it('reconnaît une saisie courte héritée de ExerciceQcmACourt', () => {
    expect(offersNonQcmFormat('src/exercices/1e/1A-F02-10.ts')).toBe(true)
  })

  it('considère un QCM sans saisie comme uniquement QCM', () => {
    expect(offersNonQcmFormat('src/exercices/1e/1A-C01-1.ts')).toBe(false)
  })
})
