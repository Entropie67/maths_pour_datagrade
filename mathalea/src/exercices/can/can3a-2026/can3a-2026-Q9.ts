import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer une expression avec des priorités d'opérations"
export const interactifReady = true

export const uuid = 'ctc94'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q9 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = this.quotaRandint('a', 2, 4)
      b = randint(5, 9 - a)
      c = this.quotaRandint('c', 5, 9)
    }

    this.reponse = a + b * c
    this.question = `$${a} + ${b}\\times ${c}$`
    this.correction = `La multiplication est prioritaire sur l'addition, donc :<br> $${a} + ${b}\\times ${c}=${a} + ${b * c} = ${miseEnEvidence(texNombre(a + b * c, 0))}$.`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 5, 6)
    else this.enonce()
  }
}
