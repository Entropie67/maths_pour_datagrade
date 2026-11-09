import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Additionner des kg et des g'
export const interactifReady = true

export const uuid = 'dvd8q'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '$\\text{ kg}$' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(nbKilos?: number, nbGrammes?: number) {
    if (nbKilos == null || nbGrammes == null) {
      nbKilos = randint(21, 59, [30, 40, 50]) / 10
      nbGrammes = randint(2, 9) * 100
    }

    this.reponse = texNombre(nbKilos + nbGrammes / 1000, 1)

    this.question = `$${texNombre(nbKilos, 1)}\\text{ kg}+${texNombre(nbGrammes, 0)}\\text{ g}=$`

    this.correction = `$${texNombre(nbGrammes, 0)}\\text{ g}=${texNombre(nbGrammes / 1000, 1)}\\text{ kg}$.<br>
    Donc $${texNombre(nbKilos, 1)}+${texNombre(nbGrammes / 1000, 1)}=${miseEnEvidence(texNombre(nbKilos + nbGrammes / 1000, 1))}\\text{ kg}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${texNombre(nbKilos, 1)}\\text{ kg}+${texNombre(nbGrammes, 0)}\\text{ g}= \\ldots \\text{ kg}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(3.2, 300)
    else this.enonce()
  }
}
