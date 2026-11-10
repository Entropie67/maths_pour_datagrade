import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = 'dcb8d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ1 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = this.quotaChoice('a', [6, 7, 8, 9])
      b = choice([6, 7, 8, 9], [a])
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = a * b
    this.question = `$${a} \\times ${b}$ `
    this.correction = `$${a}\\times${b}=${miseEnEvidence(texNombre(this.reponse, 0))}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 7)
    else this.enonce()
  }
}
