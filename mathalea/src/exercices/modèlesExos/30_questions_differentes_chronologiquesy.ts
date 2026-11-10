import Exercice from '../Exercice'
import { listeQuestionsToContenu } from '../../modules/outils'
export const titre = "Nom de l'exercice"

export const dateDePublication = '4/5/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'a309b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Ce model est prévu pour les exercice où le nombre de questions est fixe
 * et où on ne demande pas la même chose à toutes les questions
 * @author

*/
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'Consigne'
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    let question1 = 'Question 1'
    question1 += '<br>'
    let correction1 = 'Correction 1'
    correction1 += '<br>'

    let question2 = 'Question 2'
    question2 += '<br>'
    let correction2 = 'Correction 2'
    correction2 += '<br>'

    let question3 = 'Question 3'
    question3 += '<br>'
    let correction3 = 'Correction 3'
    correction3 += '<br>'

    this.listeQuestions.push(question1, question2, question3)
    this.listeCorrections.push(correction1, correction2, correction3)

    listeQuestionsToContenu(this)
  }
}
