import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une différence'
export const interactifReady = true

export const uuid = '9nw10'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q9 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([50, 150, 250])
      b = randint(2, 4) * 10 - 1
    }

    this.question = `$${a}-${b}$`
    this.reponse = a - b
    if (this.interactif) {
      this.question += ` $=$`
    }

    this.correction = `$${a}-${b}=${miseEnEvidence(texNombre(a - b))}$`

    this.canReponseACompleter = ``
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(150, 39)
    else this.enonce()
  }
}
