import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer, de manières différentes, des images par une fonction'

/**
 * 3F12 Notion de fonction - Vocabulaire
 * Déterminer à partir de plusieurs modes de représentation l'image d'un nombre
 * @author Sébastien LOZANO
 */
export const uuid = '02116'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class FonctionsCalculsDImages extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Règle à travailler',
      "Nombres séparés par des tirets :\n1 : À partir d'un programme de calcul\n2 : À partir de l'expression algébrique sous forme f(x) = ...\n3 : À partir de l'expression algébrique sous forme f : x --> ...\n4 : À partir d'un diagramme\n5 : Mélange",
    ]
    // pas de différence entre la version html et la version latex pour la consigne

    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 4

    this.sup = 5
    this.reponseCourteDisponible = false // Exercice retiré : il n'affiche qu'un message.
  }

  nouvelleVersion() {
    this.listeQuestions[0] =
      "Cet exercice n'a pas pu être conservé pour des raisons techniques. Vous trouverez dans la section 3F1 ne nombreux exercices de calcul d'image"

    listeQuestionsToContenu(this)
  }
}
