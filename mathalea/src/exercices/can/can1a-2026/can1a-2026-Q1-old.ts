import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier deux décimaux'
export const interactifReady = true

export const uuid = 'e371b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q1 extends ExerciceCan {
  enonce(a?: Decimal, b?: Decimal) {
    if (a == null || b == null) {
      a = new Decimal(randint(2, 9)).div(10)
      b = new Decimal(randint(2, 9)).div(10)
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(a.mul(b), 3)
    this.question = `$${texNombre(a, 1)} \\times ${texNombre(b, 1)}$ `
    this.correction = `$${texNombre(a, 1)} \\times${texNombre(b, 1)}=${miseEnEvidence(this.reponse)}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(new Decimal(0.3), new Decimal(0.4))
    else this.enonce()
  }
}
