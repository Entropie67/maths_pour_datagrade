import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Trouver la moitié d'un nombre"
export const interactifReady = true

export const uuid = '63ec7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q17 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(3, 9)
    }

    this.reponse = 4 * a
    this.question = `Dans un champ, il y a $${a}$ vaches.<br>
    Combien comptes-tu de pattes ?`
    this.correction = `Une vache a $4$ pattes.<br>
    $${a}\\times 4=${4 * a}$<br>
    Il y a donc $${miseEnEvidence(4 * a)}$ pattes.`

    this.canReponseACompleter = ' $\\ldots$  pattes'
    if (this.interactif) {
      this.question += '<br>'
    }
    this.optionsChampTexte = { texteApres: ' pattes.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6)
    else this.enonce()
  }
}
