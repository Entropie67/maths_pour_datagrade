import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un produit'
export const interactifReady = true

export const uuid = '95d37'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export let aQ21 = 2
export let bQ21 = 25
export let coeffQ21 = 4

/**
 * @author Jean-claude Lhote

*/
export default class Can2026CM1Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number, b?: number, coeff?: number) {
    if (a == null || b == null || coeff == null) {
      a = choice([2, 4])
      b = 25
      coeff = choice([2, 3, 4])
    }

    aQ21 = a
    bQ21 = b
    coeffQ21 = coeff

    this.reponse = texNombre(a * b, 0)
    if (this.interactif) {
      this.question = `$${a}\\times${b}=$`
    } else {
      this.question = `$${a}\\times${b}=\\ldots$`
    }

    this.correction = `$${a}\\times${b}=${miseEnEvidence(texNombre(a * b, 0))}$`

    this.canEnonce = `$${a}\\times${b}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2, 25, 6)
    else this.enonce()
  }
}
