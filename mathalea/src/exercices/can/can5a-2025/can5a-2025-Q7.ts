import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Conversion en minutes décimales'
export const interactifReady = true

export const uuid = 'a343m'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q7 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = this.quotaRandint('a', 2, 9)
      b = this.quotaChoice('b', [15, 30, 45])
    }
    this.reponse = a + b / 60
    this.question = `$${a}$ min $${b}$ s`
    this.correction = `$${b}$ s $=${new FractionEtendue(b, 60).simplifie().texFraction}$ min $=${texNombre(b / 60, 2)}$ min.<br>
    
    
    Ainsi, $${a}$ min $${b}$ s $=$ $${a}$ min $ + $ $${texNombre(b / 60, 2)}$ min $=${miseEnEvidence(texNombre(a + b / 60, 2))}$ min.`

    this.optionsChampTexte = { texteApres: ' min' }
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}$ min $${b}$ s $=\\ldots\\ldots$ min`
    if (this.interactif) {
      this.question += ' $=$ '
    } else {
      this.question += ' $=\\ldots$ min'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 30)
    else this.enonce()
  }
}
