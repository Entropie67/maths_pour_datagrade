import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Trouver un nombre connaissant le nombre de dizaines et les unités'
export const interactifReady = true

export const uuid = '4d92a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q17 extends ExerciceCan {
  enonce(nbLapins?: number) {
    if (nbLapins == null) {
      nbLapins = randint(15, 25)
    }

    this.reponse = nbLapins * 2
    this.question = `À la ferme, il y a $${nbLapins}$ lapins.<br>Combien comptes-tu d'oreilles ?`
    this.correction = `Chaque lapin a $2$ oreilles.<br>
    Pour $${nbLapins}$ lapins, il y a donc : $${nbLapins}\\times 2=${miseEnEvidence(texNombre(this.reponse, 0))}$ oreilles.`
    this.canEnonce =
      "À la ferme, il y a $20$ lapins.<br>Combien comptes-tu d'oreilles ?"
    this.canReponseACompleter = '$\\ldots$ oreilles.'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' oreilles.' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(20)
    else this.enonce()
  }
}
