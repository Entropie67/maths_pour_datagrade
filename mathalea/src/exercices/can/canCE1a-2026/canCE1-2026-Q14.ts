import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Trouver un nombre connaissant le nombre de dizaines et les unités'
export const interactifReady = true

export const uuid = '3224b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q14 extends ExerciceCan {
  enonce(dizaines?: number, unites?: number) {
    if (dizaines == null || unites == null) {
      dizaines = randint(10, 15)
      unites = randint(0, 9)
    }

    this.reponse = dizaines * 10 + unites
    this.question = `Mon nombre de dizaines est $${dizaines}$.<br>
    Mon chiffre des unités est $${unites}$.<br>
    Qui suis-je ?`
    this.correction = `Le nombre cherché a $${dizaines}$ dizaines et $${unites}$ unités.<br>
    C'est donc le nombre $${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    this.canEnonce = `Mon nombre de dizaines est $12$.<br>
    Mon chiffre des unités est $0$.<br>
    Qui suis-je ?`

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 0)
    else this.enonce()
  }
}
