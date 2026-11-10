import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Déterminer un nombre manquant dans une somme'
export const interactifReady = true

export const uuid = '6bub1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q6 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = this.quotaRandint('a', 41, 59, [50])
      b = this.quotaRandint('b', 7, 9) * 10
    }
    this.reponse = b - a
    this.question = `$${a} + \\text{?} = ${b}$`
    this.correction = `Pour trouver le nombre manquant, on peut calculer $${b}-${a}=${miseEnEvidence(texNombre(b - a, 0))}$.`

    this.canReponseACompleter = `? $= \\ldots$`
    if (this.interactif) {
      this.question += '<br> ? $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(54, 80)
    else this.enonce()
  }
}
