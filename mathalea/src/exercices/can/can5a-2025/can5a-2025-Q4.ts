import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Complément à $100$'
export const interactifReady = true

export const uuid = 'a343j'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q4 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = this.quotaRandint('a1', 2, 8) * 10 + this.quotaRandint('a2', 1, 9)
    }
    this.reponse = 100 - a
    this.question = `$${a} + \\text{?} = 100$`
    this.correction = `Pour trouver le nombre manquant, on peut calculer $100-${a}=${miseEnEvidence(texNombre(100 - a, 0))}$.`
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${a} + \\ldots\\ldots = 100$`
    if (this.interactif) {
      this.question += '<br> ? $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(67)
    else this.enonce()
  }
}
