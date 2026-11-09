import seedrandom from 'seedrandom'
import {
  getExercisesFromExercicesParams,
  mathaleaHandleExerciceSimple,
} from './mathalea'
import {
  type IExercice,
  type InteractivityType,
  interactivityTypeToCustomElementFormat,
  isInteractivityType,
} from './types'

const KUTSUM_API_URL = 'https://app.kutsum.org/api/v1/external-drafts'
const KUTSUM_IMPORT_URL = 'https://app.kutsum.org/import'

type KutsumSingleChoiceQuestion = {
  questionType: 'singleChoice'
  text: string
  answerOptions: string[]
  correctAnswers: boolean[]
}

type KutsumMultipleChoiceQuestion = {
  questionType: 'multipleChoice'
  text: string
  answerOptions: string[]
  correctAnswers: boolean[]
}

type KutsumNumericQuestion = {
  questionType: 'numeric'
  text: string
  correctAnswer: number
  tolerance: number
  unit: string | null
}

type KutsumMathQuestion = {
  questionType: 'math'
  text: string
  targetLatex: string
  validationConfig: string[]
}

type KutsumQuestion =
  | KutsumSingleChoiceQuestion
  | KutsumMultipleChoiceQuestion
  | KutsumNumericQuestion
  | KutsumMathQuestion

type KutsumExercise = {
  id: string
  title: string
  questions: KutsumQuestion[]
}

type KutsumPayload = {
  source: string
  title: string
  gradeLevel: string
  discipline: string
  themes: string[]
  exercises: KutsumExercise[]
}

/**
 * Kutsum éclate les exercices en questions autonomes, affichées une par une :
 * la consigne générale et l'introduction de l'exercice doivent donc être
 * répétées dans le texte de chaque question, sinon l'énoncé est incompréhensible
 * (« $007621661$ » sans « Écrire les nombres en chiffres… »).
 * C'est ce que fait déjà l'affichage « une question par page » côté élève.
 */
function buildKutsumQuestionText(
  exercise: IExercice,
  questionText: string,
): string {
  return [exercise.consigne, exercise.introduction, questionText]
    .filter((part) => typeof part === 'string' && part.trim() !== '')
    .join('<br>')
}

/**
 * Les formats d'interactivité ont été renommés vers les noms des custom elements
 * qui les vérifient : `propositionsQcm()` écrit désormais 'mathalea-qcm' et
 * `handleAnswers()` retombe sur 'mathalea-mathfield'. Les anciens noms ('qcm',
 * 'mathlive', 'calcul'…) ne subsistent que dans une poignée d'exercices : sans
 * cette normalisation, l'export ignore silencieusement presque tout le catalogue.
 */
function normaliseFormatInteractif(value: unknown): InteractivityType | null {
  if (typeof value !== 'string') return null
  // 'calcul' n'est traité par aucun des deux helpers de types.ts.
  if (value.toLowerCase() === 'calcul') return 'mathalea-mathfield'
  return (
    interactivityTypeToCustomElementFormat(value) ??
    (isInteractivityType(value) ? value : null)
  )
}

export function buildKutsumQuestionsFromAutoCorrection(
  exercise: IExercice,
): KutsumQuestion[] {
  const questions: KutsumQuestion[] = []
  for (const [index, autoCorrection] of exercise.autoCorrection.entries()) {
    const autoCorrectionAMC = exercise.autoCorrectionAMC?.[index]
    const formatInteractif = normaliseFormatInteractif(
      autoCorrection.formatInteractif ?? exercise.formatInteractif,
    )
    const text = buildKutsumQuestionText(
      exercise,
      autoCorrection.enonce || exercise.listeQuestions[index] || '',
    )

    if (
      formatInteractif === 'mathalea-qcm' &&
      autoCorrection.propositions &&
      autoCorrection.propositions.length >= 2
    ) {
      const choices = autoCorrection.propositions
        .filter(
          (p): p is { texte: string; statut?: boolean | string | number } =>
            p.texte != null,
        )
        .map((p) => ({
          text: p.texte ?? '',
          isCorrect: p.statut === true || p.statut === 1,
        }))
      if (choices.length < 2) continue
      const nbCorrect = choices.filter((c) => c.isCorrect).length
      const isRadio = autoCorrection.options?.radio === true || nbCorrect <= 1
      questions.push({
        questionType: isRadio ? 'singleChoice' : 'multipleChoice',
        text,
        answerOptions: choices.map((c) => c.text),
        correctAnswers: choices.map((c) => c.isCorrect),
      })
    } else if (
      formatInteractif === 'mathalea-mathfield' ||
      formatInteractif === 'possible-multi-lines-answer' ||
      formatInteractif === 'mathalea-textfield'
    ) {
      const options = autoCorrection.valeur?.reponse?.options
      const comparisons: string[] = []
      if (options && typeof options === 'object') {
        for (const [key, value] of Object.entries(
          options as Record<string, unknown>,
        )) {
          if (value === true) comparisons.push(key)
        }
      }
      const valeur = autoCorrection.valeur
      let targetLatex = ''
      if (
        valeur &&
        typeof valeur === 'object' &&
        'reponse' in valeur &&
        valeur.reponse
      ) {
        const rep = valeur.reponse.value
        targetLatex = Array.isArray(rep) ? String(rep[0]) : String(rep)
      } else if (typeof valeur === 'number') {
        targetLatex = String(valeur)
      } else if (typeof valeur === 'string') {
        targetLatex = valeur
      }
      if (!targetLatex) continue
      const numericValue = Number(targetLatex)
      if (
        !isNaN(numericValue) &&
        isFinite(numericValue) &&
        comparisons.length === 0
      ) {
        questions.push({
          questionType: 'numeric',
          text,
          correctAnswer: numericValue,
          tolerance:
            autoCorrectionAMC?.reponse?.param?.approx != null &&
            typeof autoCorrectionAMC.reponse.param.approx === 'number'
              ? autoCorrectionAMC.reponse.param.approx
              : 0,
          unit: null,
        })
      } else {
        questions.push({
          questionType: 'math',
          text,
          targetLatex,
          validationConfig: comparisons,
        })
      }
    }
  }

  return questions
}

export function buildKutsumPayload(exercises: IExercice[]): KutsumPayload {
  const kutsumExercises: KutsumExercise[] = []

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i]
    // Reproduire exactement la même graine que lors de l'affichage dans la vue élève,
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercise, false, i)
    } else if (
      typeof (
        exercise as IExercice & { nouvelleVersionWrapper?: (i: number) => void }
      ).nouvelleVersionWrapper === 'function'
    ) {
      ;(
        exercise as IExercice & { nouvelleVersionWrapper: (i: number) => void }
      ).nouvelleVersionWrapper(i)
    }
    const questions = buildKutsumQuestionsFromAutoCorrection(exercise)
    if (questions.length > 0) {
      kutsumExercises.push({
        id: exercise.uuid,
        title: exercise.titre,
        questions,
      })
    }
  }

  return {
    source: 'mathalea',
    title: 'Export MathALÉA',
    gradeLevel: 'Autre',
    discipline: 'Mathematiques',
    themes: [],
    exercises: kutsumExercises,
  }
}

export async function sendToKutsum(payload: KutsumPayload): Promise<string> {
  console.log('[Kutsum] Payload envoyé :', JSON.stringify(payload, null, 2))

  const response = await fetch(KUTSUM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const message = errorData?.message ?? `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  const data = await response.json()
  if (!data.draftId)
    throw new Error('Réponse inattendue de Kutsum (pas de draftId)')
  return data.draftId
}

export async function exportKutsum(): Promise<void> {
  // Ouvrir l'onglet de façon synchrone, avant tout await, pour ne pas être
  // bloqué par le filtre anti-popup de Safari (qui rejette window.open après
  // un appel asynchrone car il n'est plus dans le contexte du geste utilisateur).
  const tab = window.open('', '_blank')

  try {
    const exercises = await getExercisesFromExercicesParams()
    if (exercises.length === 0) {
      tab?.close()
      alert("Aucun exercice sélectionné pour l'export vers Kutsum")
      return
    }

    const payload = buildKutsumPayload(exercises)

    if (payload.exercises.length === 0) {
      tab?.close()
      alert(
        'Aucun exercice compatible avec Kutsum parmi les exercices sélectionnés (seuls les QCM et les exercices interactifs sont supportés)',
      )
      return
    }

    const draftId = await sendToKutsum(payload)

    if (tab) {
      tab.location.href = `${KUTSUM_IMPORT_URL}?draftId=${draftId}`
    }
  } catch (e) {
    tab?.close()
    alert(
      `Impossible de contacter Kutsum : ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}
