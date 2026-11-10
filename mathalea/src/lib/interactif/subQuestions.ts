import { context } from '../../modules/context'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../customElements/MultiMathfield'
import { createList } from '../format/lists'
import type { AnswerType, IExercice, Valeur } from '../types'
import { toutAUnPoint } from './fonctionsBaremes'
import { handleAnswers } from './gestionInteractif'

/** Noms des champs du `multi-mathfield`, attribués dans l'ordre des réponses. */
const FIELD_NAMES = [
  'field0',
  'field1',
  'field2',
  'field3',
  'field4',
  'field5',
  'field6',
  'field7',
  'field8',
] as const

type FieldOptions = NonNullable<DataOptionsMultiMathfield['field0']>

export type SubQuestion = {
  /**
   * Énoncé de la sous-question, sans son repère « a) » ajouté par la liste.
   * Avec plusieurs réponses, `%{0}`, `%{1}`… placent les champs dans l'énoncé
   * (ex. `$q=$ %{0}\quad $r=$ %{1}`) ; sans repère, ils sont ajoutés à la
   * suite. Hors interactivité, chaque repère devient des points de suspension.
   */
  question: string
  /** Correction de la sous-question, affichée sous le même repère. */
  correction: string
  /**
   * Réponse attendue, ou liste de réponses pour une sous-question à plusieurs
   * champs. Sans réponse, la sous-question n'a pas de champ.
   */
  answer?: AnswerType | AnswerType[]
  /**
   * Options du champ (clavier, texte après, liste déroulante, QCM…), ou liste
   * d'options dans l'ordre des réponses.
   */
  field?: FieldOptions | FieldOptions[]
}

/** Repère `%{k}` du k-ième champ d'une sous-question. */
const PLACEHOLDER = /%\{(\d+)\}/g

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

export type SubQuestionsOptions = {
  /**
   * Barème de la question. Par défaut, un point par sous-question à
   * réponse : le total ne doit pas dépendre du tirage.
   */
  bareme?: (listePoints: number[]) => [number, number]
  /**
   * Repères a), b), c)… devant les sous-questions (`true` par défaut).
   * Avec `false`, la liste n'a pas de repère : chaque item se présente
   * comme un paragraphe.
   */
  labels?: boolean
}

/**
 * Numérote les sous-questions a), b), c)… d'une question, place les champs de
 * chacune dans son item et sa correction sous le même repère.
 *
 * Toutes les réponses forment une seule question interactive
 * (`multi-mathfield`) : la question `questionIndex` garde son numéro et son
 * barème est fixe.
 * @returns l'énoncé et la correction, à ajouter à ceux de la question
 * @see documentation/developpement/auteurs-exercices/complements/sous-questions.md
 */
export function createSubQuestions(
  exercice: IExercice,
  questionIndex: number,
  subQuestions: SubQuestion[],
  { bareme = toutAUnPoint, labels = true }: SubQuestionsOptions = {},
): { question: string; correction: string } {
  const style = 'alpha'
  const answers: Valeur = {}
  const dataOptions: DataOptionsMultiMathfield = {}
  // Le premier champ de la sous-question k s'appelle `field<k>` ; les champs
  // supplémentaires prennent les noms suivants, après ceux des sous-questions.
  let nextExtra = subQuestions.length
  const namesBySubQuestion = subQuestions.map(({ answer, field }, k) => {
    const fieldOptions = toArray(field)
    return toArray(answer).flatMap((reponse, j) => {
      const name = FIELD_NAMES[j === 0 ? k : nextExtra++]
      if (name == null) {
        window.notify(
          `createSubQuestions() gère au plus ${FIELD_NAMES.length} champs`,
          { exercice: exercice.uuid },
        )
        return []
      }
      answers[name] = reponse
      dataOptions[name] = fieldOptions[j] ?? {}
      return [name]
    })
  })
  const hasAnswers = Object.keys(answers).length > 0
  const isInteractive =
    hasAnswers && exercice.interactif && context.isHtml && !context.isTypst

  /** Énoncé de la sous-question k, avec ses champs ou des points de suspension. */
  const withFields = (question: string, k: number): string => {
    const names = namesBySubQuestion[k]
    if (!isInteractive) return question.replace(PLACEHOLDER, '$\\ldots$')
    let used = 0
    const text = question.replace(PLACEHOLDER, (_match, index: string) => {
      const name = names[Number(index)]
      used++
      return name == null ? '' : `%{${name}}`
    })
    // Sans repère dans l'énoncé, les champs suivent le texte.
    return used > 0 ? text : [text, ...names.map((n) => `%{${n}}`)].join(' ')
  }

  // Sans repères, les items se suivent à la ligne au lieu de former une liste.
  const toList = (items: string[]) =>
    labels ? createList({ items, style }) : items.join('<br>')
  const questionItems = subQuestions.map(({ question }, k) =>
    withFields(question, k),
  )
  const question = isInteractive
    ? addMultiMathfield(exercice, questionIndex, {
        dataTemplate: toList(questionItems),
        dataOptions,
      })
    : toList(questionItems)

  if (hasAnswers) {
    handleAnswers(
      exercice,
      questionIndex,
      { ...answers, bareme },
      { formatInteractif: 'multi-mathfield' },
    )
  }

  return {
    question,
    correction: toList(subQuestions.map(({ correction }) => correction)),
  }
}
