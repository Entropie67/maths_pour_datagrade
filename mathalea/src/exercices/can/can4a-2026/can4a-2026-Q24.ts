import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Question $24$'
export const interactifReady = true

export const uuid = '3wx9f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ24 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      b = randint(3, 9)
      a = -b * randint(3, 10) // Pour avoir un résultat entier
    }

    const resultat = a / b

    this.question = `$${a}\\div ${b}=$`

    this.correction = `$${a}\\div ${b}=${miseEnEvidence(resultat)}$<br>
    Le quotient de deux nombres de signes contraires est négatif.`

    this.reponse = resultat

    if (!this.interactif) {
      this.question += '<br>$\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(-42, 6)
    else this.enonce()
  }
}
