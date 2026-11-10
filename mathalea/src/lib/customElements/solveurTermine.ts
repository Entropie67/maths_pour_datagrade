import type { IExercice } from '../types'

const tagSolveur = 'mathalea-solveur'

/**
 * Évènement émis (il remonte dans le DOM) lorsque l'élève ne peut plus rien
 * saisir dans un solveur : équation résolue ou, en mode `evaluation`, étape
 * fausse.
 *
 * Ce fichier est volontairement indépendant de `MathaleaSolveurElement` pour
 * que les vues des exercices n'embarquent pas le solveur dans le bundle commun.
 */
export const evenementSolveurTermine = 'solveur-termine'

/**
 * Indique si toutes les questions de l'exercice sont des solveurs terminés.
 * L'exercice interactif peut alors être vérifié sans que l'élève ait à cliquer
 * sur le bouton de vérification.
 * @param container élément du DOM qui contient les questions de l'exercice
 */
export function tousLesSolveursSontTermines(
  exercice: IExercice,
  container: ParentNode,
): boolean {
  const questions = exercice.autoCorrection.filter(
    (autoCorrection) => autoCorrection != null,
  )
  const solveurs = [
    ...container.querySelectorAll<HTMLElement & { interactivityOn: boolean }>(
      tagSolveur,
    ),
  ]
  return (
    solveurs.length > 0 &&
    solveurs.length === questions.length &&
    questions.every(
      (autoCorrection) => autoCorrection.formatInteractif === tagSolveur,
    ) &&
    solveurs.every((solveur) => !solveur.interactivityOn)
  )
}

/**
 * Action Svelte : appelle `rappel` avec l'élément observé à chaque fois qu'un
 * solveur qu'il contient est terminé.
 */
export function ecouteSolveursTermines(
  node: HTMLElement,
  rappel: (conteneur: HTMLElement) => void,
) {
  const ecouteur = () => rappel(node)
  node.addEventListener(evenementSolveurTermine, ecouteur)
  return {
    destroy() {
      node.removeEventListener(evenementSolveurTermine, ecouteur)
    },
  }
}
