import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme de décimaux'
export const interactifReady = true

export const uuid = 'admww'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q3 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a =
        this.quotaRandint('a1', 2, 5) * 0.1 +
        this.quotaRandint('a2', 1, 9) * 0.01
      b = this.quotaRandint('b', 1, 4) * 0.1
    }

    this.reponse = (a + b).toFixed(2)
    this.question = `$${texNombre(a, 2)} + ${texNombre(b, 2)}$ `
    this.correction = `$${texNombre(a, 2)} + ${texNombre(b, 2)}=${miseEnEvidence(texNombre(a + b, 2))}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.7, 0.13)
    else this.enonce()
  }
}
