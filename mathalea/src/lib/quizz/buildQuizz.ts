import ExerciceSimple from '../../exercices/ExerciceSimple'
import {
  mathaleaFormatExercice,
  mathaleaGenerateSeed,
  mathaleaGetExercicesFromParams,
  mathaleaHandleExerciceSimple,
} from '../mathalea'
import type { IExercice, IExerciceStatique, InterfaceParams } from '../types'
import type {
  Quizz,
  QuizzParams,
  QuizzQuestion,
  QuizzQuestionType,
} from '../../modules/quizz/types'
import { QUIZZ_DEFAULT_TIME, timeForExercise } from './quizzParams'

export const QUIZZ_MAX_ANSWERS = 4
export const QUIZZ_MIN_ANSWERS = 2

export type QuizzCompatibilityStatus = 'ok' | 'partial' | 'incompatible'

export interface ExerciseQuizzCompatibility {
  /** Indice de l'exercice dans exercicesParams. */
  index: number
  /** Référence affichée (id type '1A-C01-3', sinon uuid). */
  ref: string
  titre: string
  status: QuizzCompatibilityStatus
  /** Indices des questions retenues pour le quizz. */
  keptQuestions: number[]
  /** Nombre de questions écartées (propositions absentes ou > 4). */
  droppedCount: number
  /** Motif d'incompatibilité, le cas échéant. */
  reason?: string
  /** Vrai si l'exercice possède une version QCM activable (ExerciceSimple). */
  convertible: boolean
}

export interface BuildQuizzResult {
  quizz: Quizz
  report: ExerciseQuizzCompatibility[]
}

function isIExercice(
  exercice: IExercice | IExerciceStatique,
): exercice is IExercice {
  return (
    'autoCorrection' in exercice && Array.isArray(exercice.autoCorrection)
  )
}

/**
 * Génère le contenu d'un exercice en suivant le pattern de la CAN :
 * mathaleaHandleExerciceSimple pour les exercices simples,
 * nouvelleVersionWrapper pour les classiques.
 */
function generateExercice(exercice: IExercice, index: number): void {
  exercice.numeroExercice = index
  if (exercice.typeExercice === 'simple') {
    mathaleaHandleExerciceSimple(exercice, exercice.interactif, index)
  } else if (exercice.nouvelleVersionWrapper !== undefined) {
    exercice.nouvelleVersionWrapper(index)
  }
}

/**
 * Analyse la compatibilité d'un exercice généré avec le format quizz :
 * chaque question doit proposer entre 2 et 4 propositions de QCM.
 */
export function analyseExerciceQuizz(
  exercice: IExercice | IExerciceStatique,
  index: number,
): ExerciseQuizzCompatibility {
  const ref = isIExercice(exercice)
    ? (exercice.id ?? exercice.uuid)
    : exercice.uuid
  const titre = isIExercice(exercice) ? exercice.titre : 'Exercice statique'
  const base = { index, ref, titre, keptQuestions: [], droppedCount: 0 }
  if (!isIExercice(exercice)) {
    return {
      ...base,
      status: 'incompatible',
      reason: 'Exercice statique (pas de QCM interactif)',
      convertible: false,
    }
  }
  const convertible =
    exercice instanceof ExerciceSimple &&
    exercice.versionQcmDisponible === true
  const kept: number[] = []
  let dropped = 0
  for (let i = 0; i < exercice.listeQuestions.length; i++) {
    const propositions = exercice.autoCorrection[i]?.propositions
    if (
      propositions != null &&
      propositions.length >= QUIZZ_MIN_ANSWERS &&
      propositions.length <= QUIZZ_MAX_ANSWERS
    ) {
      kept.push(i)
    } else {
      dropped++
    }
  }
  if (kept.length === 0) {
    return {
      ...base,
      status: 'incompatible',
      reason: convertible
        ? 'Activez la version QCM pour cet exercice'
        : 'Aucune question sous forme de QCM (2 à 4 propositions)',
      keptQuestions: kept,
      droppedCount: dropped,
      convertible,
    }
  }
  return {
    ...base,
    status: dropped > 0 ? 'partial' : 'ok',
    keptQuestions: kept,
    droppedCount: dropped,
    convertible,
  }
}

/**
 * Extrait une question de quizz d'une question d'exercice généré.
 * L'énoncé est construit comme dans la CAN : consigne et introduction en
 * tête de la première question de l'exercice, puis l'énoncé de la question.
 */
function extractQuestion(
  exercice: IExercice,
  questionIndex: number,
  exerciceIndex: number,
  params: QuizzParams,
): QuizzQuestion | null {
  const autoCorrection = exercice.autoCorrection[questionIndex]
  const propositions = autoCorrection?.propositions
  if (
    propositions == null ||
    propositions.length < QUIZZ_MIN_ANSWERS ||
    propositions.length > QUIZZ_MAX_ANSWERS
  ) {
    return null
  }
  let enonce = autoCorrection.enonce ?? ''
  if (enonce.length === 0) {
    // Repli : la question sans le composant interactif <mathalea-qcm>
    enonce = exercice.listeQuestions[questionIndex].split('<div class="my-3">')[0]
  }
  if (questionIndex === 0) {
    const consigne = exercice.consigne ?? ''
    const introduction = exercice.introduction ?? ''
    if (consigne.length > 0) enonce = `${consigne}<br>\n${enonce}`
    if (introduction.length > 0) enonce = `${enonce}<br>\n${introduction}`
  }
  const solutions: number[] = []
  propositions.forEach((proposition, k) => {
    if (proposition.statut) solutions.push(k)
  })
  const type: QuizzQuestionType =
    autoCorrection.options?.radio === true || solutions.length === 1
      ? 'single'
      : 'multi'
  return {
    type,
    question: mathaleaFormatExercice(enonce.replaceAll(/&nbsp;/g, ' ')),
    answers: propositions.map((proposition) =>
      mathaleaFormatExercice(proposition.texte ?? ''),
    ),
    solutions,
    correction: mathaleaFormatExercice(
      exercice.listeCorrections[questionIndex] ?? '',
    ),
    cooldown: params.cooldown,
    time: timeForExercise(params, exerciceIndex) || QUIZZ_DEFAULT_TIME,
    sourceRef: exercice.id ?? exercice.uuid,
  }
}

/**
 * Construit le quizz complet à partir des paramètres d'exercices de l'URL.
 * Les exercices sont chargés, paramétrés (graine `alea` incluse) puis générés ;
 * seules les questions compatibles QCM (2 à 4 propositions) sont retenues.
 */
export async function buildQuizz(
  params: InterfaceParams[],
  quizzParams: QuizzParams,
  subject: string,
): Promise<BuildQuizzResult> {
  const exercices = await mathaleaGetExercicesFromParams(params)
  const report: ExerciseQuizzCompatibility[] = []
  const questions: QuizzQuestion[] = []
  for (const [index, exercice] of exercices.entries()) {
    if (isIExercice(exercice)) {
      generateExercice(exercice, index)
    }
    const compatibility = analyseExerciceQuizz(exercice, index)
    report.push(compatibility)
    if (!isIExercice(exercice)) continue
    for (const questionIndex of compatibility.keptQuestions) {
      const question = extractQuestion(exercice, questionIndex, index, quizzParams)
      if (question != null) questions.push(question)
    }
  }
  return { quizz: { subject, questions }, report }
}

/**
 * Fige les graines : attribue une graine `alea` à chaque exercice de la
 * sélection qui n'en possède pas, afin que le lien partagé produise
 * exactement le même quizz pour tout le monde (mode `seedMode: 'fixed'`).
 * Renvoie vrai si au moins une graine a été ajoutée.
 */
export function freezeSeeds(params: InterfaceParams[]): boolean {
  let modified = false
  for (const param of params) {
    if (param.alea == null || param.alea.length === 0) {
      param.alea = mathaleaGenerateSeed()
      modified = true
    }
  }
  return modified
}
