import { describe, expect, it, vi } from 'vitest'
import DecomposerUnNombreDecimal from '../exercices/6e/6N1A'
import DeterminerLeNombre from '../exercices/can/6e/can6N22-02'
import { buildKutsumQuestionsFromAutoCorrection } from './kutsum'
import type { AutoCorrection, IExercice } from './types'

vi.mock('./renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('./components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

/** Un exercice minimal dont on ne pilote que l'autoCorrection. */
function fakeExercise(
  autoCorrection: AutoCorrection[],
  formatInteractif?: string,
): IExercice {
  return {
    consigne: '',
    introduction: '',
    listeQuestions: autoCorrection.map(() => ''),
    autoCorrection,
    autoCorrectionAMC: [],
    formatInteractif,
  } as unknown as IExercice
}

const qcmPropositions = [
  { texte: '$1,2$', statut: true },
  { texte: '$120$', statut: false },
  { texte: '$0,12$', statut: false },
]

describe('buildKutsumQuestionsFromAutoCorrection', () => {
  // Régression : `propositionsQcm()` écrit 'mathalea-qcm' et `handleAnswers()`
  // 'mathalea-mathfield'. Tant que l'export testait les anciens noms ('qcm',
  // 'mathlive'), il ne remontait quasiment aucun exercice du catalogue.
  it.each([
    ['mathalea-qcm', 'nom courant'],
    ['qcm', 'ancien nom'],
  ])('reconnaît un QCM au format %s (%s)', (format) => {
    const questions = buildKutsumQuestionsFromAutoCorrection(
      fakeExercise([
        {
          enonce: 'Quel est le nombre égal à $12$ dixièmes ?',
          formatInteractif: format,
          propositions: qcmPropositions,
        } as unknown as AutoCorrection,
      ]),
    )
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({
      questionType: 'singleChoice',
      answerOptions: ['$1,2$', '$120$', '$0,12$'],
      correctAnswers: [true, false, false],
    })
  })

  it.each([
    ['mathalea-mathfield', 'nom courant'],
    ['mathlive', 'ancien nom'],
    ['calcul', 'ancien nom'],
  ])('reconnaît une saisie numérique au format %s (%s)', (format) => {
    const questions = buildKutsumQuestionsFromAutoCorrection(
      fakeExercise([
        {
          enonce: 'Combien de dixièmes ?',
          formatInteractif: format,
          valeur: { reponse: { value: '12.5' } },
        } as unknown as AutoCorrection,
      ]),
    )
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({
      questionType: 'numeric',
      correctAnswer: 12.5,
    })
  })

  it('émet une question `math` quand une option de comparaison est active', () => {
    const questions = buildKutsumQuestionsFromAutoCorrection(
      fakeExercise([
        {
          enonce: 'Donne une fraction égale à $\\dfrac12$',
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: { value: '\\dfrac12', options: { fractionEgale: true } },
          },
        } as unknown as AutoCorrection,
      ]),
    )
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({
      questionType: 'math',
      targetLatex: '\\dfrac12',
      validationConfig: ['fractionEgale'],
    })
  })

  it('hérite du formatInteractif de l’exercice quand la question n’en porte pas', () => {
    const questions = buildKutsumQuestionsFromAutoCorrection(
      fakeExercise(
        [{ enonce: 'Combien ?', valeur: { reponse: { value: '3' } } } as unknown as AutoCorrection],
        'mathalea-mathfield',
      ),
    )
    expect(questions).toHaveLength(1)
    expect(questions[0].questionType).toBe('numeric')
  })

  it.each(['fill-in-the-blank', 'tableau-mathlive', 'clique-figure'])(
    'ignore le format non supporté %s',
    (format) => {
      const questions = buildKutsumQuestionsFromAutoCorrection(
        fakeExercise([
          {
            enonce: 'Complète',
            formatInteractif: format,
            valeur: { reponse: { value: '3' } },
            propositions: qcmPropositions,
          } as unknown as AutoCorrection,
        ]),
      )
      expect(questions).toEqual([])
    },
  )
})

/**
 * Garde-fou de bout en bout : ces deux exercices sont générés pour de vrai puis
 * passés à l'export. Si les noms de `formatInteractif` produits par
 * `propositionsQcm()` / `handleAnswers()` changent à nouveau sans que
 * `kutsum.ts` suive, ce test échoue au lieu d'un export silencieusement vide.
 */
describe('export Kutsum sur de vrais exercices', () => {
  it('remonte les QCM de can6N22-02 (uuid dcf22)', () => {
    const exercice = new DeterminerLeNombre() as unknown as IExercice
    exercice.nbQuestions = 3
    exercice.seed = '43rE'
    exercice.nouvelleVersionWrapper(0)

    const questions = buildKutsumQuestionsFromAutoCorrection(exercice)
    expect(questions).toHaveLength(3)
    for (const question of questions) {
      expect(question.questionType).toBe('singleChoice')
      expect(question).toHaveProperty('answerOptions')
      if ('correctAnswers' in question) {
        expect(question.correctAnswers.filter(Boolean)).toHaveLength(1)
      }
    }
  })

  it('remonte les saisies numériques de 6N1A (uuid 6ea89)', () => {
    const exercice = new DecomposerUnNombreDecimal() as unknown as IExercice
    exercice.nbQuestions = 3
    exercice.seed = 'pdw7'
    exercice.sup = '2'
    exercice.sup3 = '3'
    exercice.nouvelleVersionWrapper(0)

    const questions = buildKutsumQuestionsFromAutoCorrection(exercice)
    expect(questions.length).toBeGreaterThan(0)
    for (const question of questions) {
      expect(['numeric', 'math']).toContain(question.questionType)
    }
  })
})
