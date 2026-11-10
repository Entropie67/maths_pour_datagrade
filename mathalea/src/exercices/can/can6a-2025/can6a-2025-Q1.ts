import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Sommes de nombres entiers'
export const interactifReady = true

export const uuid = 'f343g'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N6Q1 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      const paire = shuffle(
        choice([
          [6, 7],
          [8, 9],
          [6, 8],
          [7, 9],
          [6, 9],
          [7, 8],
        ]),
      )
      const dizaine = choice([1, 2, 3, 4, 5]) * 10
      a = dizaine + paire[0]
      b = paire[1]
    }
    this.reponse = String(a + b)
    this.question = `$${a}+${b}$ `
    this.correction = `$${a}+${b}=${miseEnEvidence(this.reponse)}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(17, 8)
    else this.enonce()
  }
}
