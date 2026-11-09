// Application des réglages émis par le panneau `Settings` de la vue prof
// (événement `settings`) à un exercice et à ses paramètres d'URL.
import ExerciceSimple from '../../exercices/ExerciceSimple'
import { mathaleaHandleSup } from '../mathalea'
import type { IExercice, InterfaceParams } from '../types'

/**
 * Reporte les réglages saisis dans le panneau `Settings` sur l'exercice (objet
 * vivant) et sur ses paramètres (portés par l'URL). Le contenu de l'exercice
 * n'est pas régénéré : c'est à l'appelant de le faire.
 * @param {IExercice} exercise exercice concerné
 * @param {InterfaceParams} params paramètres de cet exercice
 * @param {Record<string, unknown>} detail contenu de l'événement `settings`
 */
export function applyExerciceSettings(
  exercise: IExercice,
  params: InterfaceParams,
  detail: Record<string, unknown>,
): void {
  if (detail.nbQuestions != null) {
    exercise.nbQuestions = detail.nbQuestions as number
    params.nbQuestions = exercise.nbQuestions
  }
  if (detail.duration != null) {
    exercise.duration = detail.duration as number
    params.duration = exercise.duration
  }
  const supKeys = ['sup', 'sup2', 'sup3', 'sup4', 'sup5'] as const
  for (const key of supKeys) {
    if (detail[key] !== undefined) {
      exercise[key] = detail[key] as boolean | number | string
      params[key] = mathaleaHandleSup(
        exercise[key] as boolean | number | string,
      )
    }
  }
  if (detail.versionQcm !== undefined && exercise instanceof ExerciceSimple) {
    exercise.versionQcm = detail.versionQcm as boolean
    params.versionQcm = exercise.versionQcm ? '1' : '0'
  }
  if (detail.alea !== undefined) {
    exercise.seed = detail.alea as string
    params.alea = exercise.seed
  }
  if (detail.correctionDetaillee !== undefined) {
    exercise.correctionDetaillee = detail.correctionDetaillee as boolean
    params.cd = exercise.correctionDetaillee ? '1' : '0'
  }
}
