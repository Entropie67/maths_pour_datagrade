import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiple simple'
export const interactifReady = true

export const uuid = '8a20a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q5 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([2, 3])
      b =
        a === 2
          ? randint(1, 4) * 10 + randint(1, 4)
          : randint(1, 3) * 10 + randint(1, 3)
    }
    const terme = a === 2 ? 'double' : 'triple'
    this.reponse = a * b
    this.question = `Le ${terme} de $${b}$`
    this.correction = `Le ${terme} de $${b}$, c'est : $${a}\\times ${b}=${miseEnEvidence(a * b)}$.`

    if (this.interactif) {
      this.question += ' est  : '
    }
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 45)
    else this.enonce()
  }
}
