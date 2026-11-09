import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../../src/exercices/Exercice'
import { context } from '../../modules/context'
import { buildQcmForExercise } from './qcmBuilder'

describe('buildQcmForExercise', () => {
  beforeEach(() => {
    context.isHtml = true
    context.isAmc = false
  })

  it('ajoute le message de bonne reponse pour un QCM simple non interactif', () => {
    const exercice = new Exercice()
    exercice.interactif = false
    exercice.numeroExercice = 0

    const qcmData = buildQcmForExercise(exercice, 0, {
      question: 'Question',
      correction: 'Correction',
      propositions: [
        { texte: 'Bonne', statut: true },
        { texte: 'Mauvaise 1', statut: false },
        { texte: 'Mauvaise 2', statut: false },
      ],
    })

    expect(qcmData.question).toContain('Bonne')
    expect(qcmData.correction).toContain('Correction')
    expect(qcmData.correction).toContain('La bonne réponse est la réponse')
  })

  it('gere les corrections detaillees et les bonnes reponses multiples', () => {
    const exercice = new Exercice()
    exercice.interactif = false
    exercice.numeroExercice = 1

    const qcmData = buildQcmForExercise(exercice, 0, {
      question: 'Question',
      propositions: [
        { texte: 'Bonne 1', statut: true, correction: 'Explication 1' },
        { texte: 'Bonne 2', statut: true, correction: 'Explication 2' },
        { texte: 'Mauvaise', statut: false, correction: 'Explication 3' },
      ],
      messageMode: 'multiple',
    })

    expect(qcmData.correction).toContain('réponse')
    expect(qcmData.correction).toContain('Explication 1')
    expect(qcmData.correction).toContain('Explication 2')
    expect(qcmData.correction).toContain(
      'Les bonnes réponses sont les réponses',
    )
  })

  it('reserve Je ne sais pas en derniere position quand l option est activee', () => {
    const exercice = new Exercice()
    exercice.interactif = false
    exercice.numeroExercice = 2

    buildQcmForExercise(exercice, 0, {
      question: 'Question',
      propositions: [
        { texte: 'Bonne', statut: true },
        { texte: 'Mauvaise 1', statut: false },
        { texte: 'Mauvaise 2', statut: false },
      ],
      options: { dontKnow: true },
    })

    const propositions = exercice.autoCorrection[0].propositions ?? []
    expect(propositions.at(-1)?.texte).toBe('Je ne sais pas')
    expect(exercice.autoCorrection[0].options?.lastChoice).toBe(
      propositions.length - 2,
    )
  })

  it('ajoute le qcm corrige quand ajouteQcmCorr est active', () => {
    const exercice = new Exercice()
    exercice.interactif = false
    exercice.numeroExercice = 3

    const qcmData = buildQcmForExercise(exercice, 0, {
      question: 'Question',
      correction: 'Correction',
      propositions: [
        { texte: 'Bonne', statut: true },
        { texte: 'Mauvaise 1', statut: false },
        { texte: 'Mauvaise 2', statut: false },
      ],
      ajouteQcmCorr: true,
    })

    expect(qcmData.correction).toContain('Mauvaise 1')
    expect(qcmData.correction).toContain('Mauvaise 2')
    expect(qcmData.correction).toContain('La bonne réponse est la réponse')
  })

  it('permet un affichage interactif compact avec cases et lettres', () => {
    const exercice = new Exercice()
    exercice.interactif = true
    exercice.numeroExercice = 4

    const qcmData = buildQcmForExercise(exercice, 0, {
      question: 'Question',
      propositions: [
        { texte: 'Bonne', statut: true },
        { texte: 'Mauvaise', statut: false },
      ],
      options: { radio: true, format: 'caseLettre', compact: true },
    })

    expect(qcmData.question).toContain('Question<br><mathalea-qcm')
    expect(qcmData.question).not.toContain('Question<br><br>')
    expect(qcmData.question).toContain('format="caseLettre"')
  })

  it('rapproche les propositions contenant une figure mathalea2d de la question', () => {
    const exercice = new Exercice()
    const qcmData = buildQcmForExercise(exercice, 0, {
      question: 'Question',
      propositions: [
        { texte: '<svg class="mathalea2d"></svg>', statut: true },
        { texte: '<svg class="mathalea2d" id="autre"></svg>', statut: false },
      ],
    })

    expect(qcmData.question).toContain('Question<br><mathalea-qcm')
  })
})
