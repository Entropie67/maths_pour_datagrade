import type { IExercice, ResultOfExerciceInteractif } from '../../lib/types'
import { orangeMathalea } from '../../lib/colors'
import { coeffBaremeExercice } from './baremeExercice'

const CLASSES_ALERTE_UNITE_MANQUANTE = [
  'italic',
  'text-coopmaths-warn-darkest',
  'dark:text-coopmathsdark-warn-darkest',
]

export function afficheScore(
  exercice: IExercice,
  nbBonnesReponses: number,
  nbMauvaisesReponses: number,
  divScore?: HTMLDivElement,
  divButton?: HTMLButtonElement,
  perQuestionIsOk: boolean[] = [],
): ResultOfExerciceInteractif {
  if (divButton != null) {
    divButton.classList.add(
      'cursor-not-allowed',
      'opacity-50',
      'pointer-events-none',
    )
  }
  // Le coefficient de barème choisi dans les paramètres de l'exercice
  // multiplie la note obtenue comme la note maximale.
  const coeff = coeffBaremeExercice(exercice)
  const numberOfPoints = nbBonnesReponses * coeff
  const numberOfQuestions = (nbBonnesReponses + nbMauvaisesReponses) * coeff
  if (divScore != null) {
    divScore.classList.remove(...CLASSES_ALERTE_UNITE_MANQUANTE)
    divScore.innerHTML = `${numberOfPoints} / ${numberOfQuestions}`
    divScore.style.color = orangeMathalea
    divScore.style.fontWeight = 'bold'
    divScore.style.fontSize = 'x-large'
    divScore.style.display = 'inline'
  }
  return {
    numberOfPoints,
    numberOfQuestions,
    perQuestionIsOk,
  }
}

/**
 * Affiche un message invitant l'élève à ajouter l'unité manquante, sans corriger l'exercice.
 * Utilisé pour bloquer la première vérification quand une réponse attendant une unité n'en a pas.
 */
export function afficheAlerteUniteManquante(divScore?: HTMLDivElement): void {
  if (divScore == null) return
  divScore.style.color = ''
  divScore.style.fontWeight = ''
  divScore.style.fontSize = ''
  divScore.style.display = 'inline'
  divScore.classList.add(...CLASSES_ALERTE_UNITE_MANQUANTE)
  divScore.innerHTML =
    'Il manque au moins une unité dans une réponse. Ajoutez-la puis cliquez de nouveau sur « Vérifier ».'
}
