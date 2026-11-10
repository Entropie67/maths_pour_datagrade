import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/outils/texNombre'

import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un prix total'
export const interactifReady = true

export const uuid = 'ybdfv'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q3 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(nbStylos?: number, prixUnitaire?: number) {
    if (nbStylos == null || prixUnitaire == null) {
      nbStylos = choice([4, 6])
      prixUnitaire = choice([1.5, 2.5, 3.5])
    }

    this.reponse = nbStylos * prixUnitaire

    // Conversion du prix en format "X € 50"
    const euros = Math.floor(prixUnitaire)
    const prixFormate = `$${euros}$ € $50$`

    this.question = `J'ai acheté $${nbStylos}$ stylos à ${prixFormate} chacun.<br>Combien vais-je payer ?`

    this.correction = `Le prix total est donné par : $${nbStylos}\\times ${texPrix(prixUnitaire)}=${miseEnEvidence(texPrix(this.reponse))}$ €.`

    this.canReponseACompleter = `$\\ldots$ €`

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 2.5)
    else this.enonce()
  }
}
