import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Expression à calculer'
export const interactifReady = true

export const uuid = 'a343y'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q25 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 5)
      b = randint(2, 6)
      c = randint(8, 12, 10) - b
    }
    this.reponse = a * (b + c)
    this.question = `Le produit de $${a}$ par la somme de $${b}$ et $${c}$`
    this.correction = `On calcule : $${a}\\times (${b}+${c})=${a}\\times ${b + c}= ${miseEnEvidence(a * (b + c))}$.`

    this.optionsChampTexte = { texteApres: '.' }
    if (this.interactif) {
      this.question += ' est : '
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 2, 9)
    else this.enonce()
  }
}
