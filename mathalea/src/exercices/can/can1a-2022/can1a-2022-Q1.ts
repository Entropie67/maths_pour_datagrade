import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier deux décimaux'
export const interactifReady = true

export const uuid = '57117'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q1 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: Decimal) {
    if (a == null || b == null) {
      a = randint(3, 9)
      b = new Decimal(randint(6, 9)).div(10)
    }

    this.reponse = texNombre(b.mul(a), 1)
    this.question = `$${texNombre(a, 1)} \\times ${texNombre(b, 1)}$ `
    this.correction = `$${texNombre(a, 1)} \\times${texNombre(b, 1)}=${miseEnEvidence(this.reponse)}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, new Decimal(0.6))
    else this.enonce()
  }
}
