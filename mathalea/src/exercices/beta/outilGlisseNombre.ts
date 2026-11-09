import Exercice from '../Exercice'
import { listeQuestionsToContenu } from '../../modules/outils'
import { glisseNombreInteractif } from '../../lib/apps/glisse_nombre_interactif'
export const titre = "Glisse-nombre"

export const dateDePublication = '03/09/2025'

export const uuid = 'fe783'
export const refs = {
  'fr-fr': ['6N2autoE'],
  'fr-ch': [],
}

/**
 * @author Rémi Angot

 */
export default class GlisseNombre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const question1 = glisseNombreInteractif({ number: 1})
    const correction1 = ''


    this.listeQuestions.push(question1)
    this.listeCorrections.push(correction1)

    listeQuestionsToContenu(this)
  }
}
