import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Résoudre un problème de soustraction'
export const interactifReady = true

export const uuid = '1d4c6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q12 extends ExerciceCan {
  enonce(total?: number, donnees?: number) {
    if (total == null || donnees == null) {
      total = randint(25, 35)
      donnees = randint(12, total - 5)
    }

    this.reponse = total - donnees
    this.question = `Mila a $${total}$ cartes. Elle donne $${donnees}$ cartes à sa sœur. <br>
    Combien lui reste-t-il de cartes maintenant ?`
    this.correction = `Mila avait $${total}$ cartes et en a donné $${donnees}$.<br>Il lui reste donc : $${total}-${donnees}=${miseEnEvidence(texNombre(this.reponse, 0))}$ cartes.`
    this.canEnonce =
      'Mila a $30$ cartes. Elle donne $17$ cartes à sa sœur. Combien lui reste-t-il de cartes maintenant ?'
    this.canReponseACompleter = '$\\ldots$ cartes.'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' cartes.' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(30, 17)
    else this.enonce()
  }
}
