import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme avec des décimaux'
export const interactifReady = true

export const uuid = 't2ctj'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q14 extends ExerciceCan {
  constructor() {
    super()
    this.enonce()
    this.optionsChampTexte = { texteAvant: '$~=~$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(11, 19) * 10 + randint(1, 5) * 0.01
      b = randint(1, 4) * 0.1
    }

    this.reponse = texNombre(a + b, 2)
    this.question = `$${texNombre(a, 2)}+${texNombre(b, 1)}$`

    this.correction = `$${texNombre(a, 2)}+${texNombre(b, 1)}=${texNombre(a, 2)}+${texNombre(b, 2, true)}=${miseEnEvidence(texNombre(a + b, 2))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(180.05, 0.2)
    else this.enonce()
  }
}
