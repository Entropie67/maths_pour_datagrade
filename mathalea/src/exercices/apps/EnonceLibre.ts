import { listeQuestionsToContenuSansNumero } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Écrire un exercice personnalisé'
export const dateDePublication = '14/09/2026'
export const uuid = '58d39'
// pas de `refs` : exercice technique support du bouton « + Exercice » de la
// vue Typst (voir `insertFreeExercise` dans `Typst.svelte`), non proposé
// dans la recherche ni les référentiels.

/**
 * Exercice-support de l'insertion « Exercice » de la palette de mise en page
 * Typst : un exercice numéroté normalement (badge « Exercice N », zone de
 * correction) dont l'énoncé ci-dessous n'est qu'un texte de départ, aussitôt
 * remplacé par une surcharge de code Typst portant ce que le professeur a
 * écrit dans le panneau d'insertion.
 */
export default class EnonceLibre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.listeQuestions[0] = 'Énoncé à écrire.'
    this.listeCorrections[0] = ''
    listeQuestionsToContenuSansNumero(this)
  }
}
