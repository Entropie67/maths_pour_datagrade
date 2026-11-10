import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un produit (table de multiplication)'
export const interactifReady = true

export const uuid = '45105'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q1 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = this.quotaChoice('a', [4, 6, 7, 8])
      b = choice([4, 6, 7, 8], [a])
    }

    this.reponse = a * b
    this.question = `$${a} \\times ${b}$ `
    this.correction = `$${a}\\times${b}=${miseEnEvidence(texNombre(this.reponse, 0))}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 7)
    else this.enonce()
  }
}
