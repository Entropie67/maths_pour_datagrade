import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = 'd3b8b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q1 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  enonce(a?: Decimal, b?: number) {
    if (a == null || b == null) {
      a = new Decimal(randint(2, 9)).div(10)
      b = randint(5, 9)
    }

    this.reponse = texNombre(a.mul(b), 1)
    this.question = `$${texNombre(a, 1)} \\times ${b}$ `
    this.correction = `$${texNombre(a, 1)} \\times ${b}=${miseEnEvidence(this.reponse)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(new Decimal(0.6), 9)
    else this.enonce()
  }
}
