import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Connaître les carrés parfaits'
export const dateDePublication = '29/10/2025'
export const dateDeModifImportante = '02/09/2026'

export const interactifReady = true

export const uuid = '75b05'
export const refs = {
  'fr-fr': ['3AutoN08-1', '5N4B'],
  'fr-ch': ['9R1NO5B-2', '9R2NO5B-2', '9R3NO5B-2', '10CTNO6A-2', '10LCNO6A-2', '10LSNO6A-2', 'PRQNO07A-5'],
}

/**
 * @author Elodie SAVARY
 */

export default class CarreDesPremiersEntiers extends ExerciceSimple {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      "Aller au-delà de 12, jusqu'à 16",
      false,
    ]
    this.sup = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    this.consigne = ''
    const max = this.sup ? 16 : 12 // si sup cochée on va jusqu'à 16

    const a = randint(2, max)
    this.question = `Quel est le carré de $${a}$ ?`
    this.reponse = a * a
    this.correction = `Le carré d'un nombre est ce nombre multiplié par lui-même : $${a}\\times${a}=${miseEnEvidence(this.reponse)}$.`
  }
}
