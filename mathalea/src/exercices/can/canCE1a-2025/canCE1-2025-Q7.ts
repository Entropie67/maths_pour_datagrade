import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Trouver un nombre'
export const interactifReady = true

export const uuid = '5aa67'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q7 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, chiffreC?: number) {
    if (a == null || b == null || c == null || chiffreC == null) {
      chiffreC = randint(1, 8)
      a = chiffreC * 100 + randint(6, 9) * 10 + randint(0, 9)
      b = randint(1, 5)
      c = randint(1, 9)
    }

    this.reponse = (chiffreC + 1) * 100 + b * 10 + c
    this.question = `Écris le nombre qui a $${b}$ pour chiffre des dizaines, $${c}$ pour chiffre des unités et qui vient après $${a}$.`
    this.correction = `Puisque le chiffre des dizaines est $${b}$ et celui des unités est $${c}$, le nombre cherché se termine par $${b}${c}$.<br>
    Le nombre doit être supérieur à $${a}$, c'est donc $${miseEnEvidence((chiffreC + 1) * 100 + b * 10 + c)}$.`

    if (this.interactif) {
      this.question += ' <br> '
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(396, 1, 1, 3)
    else this.enonce()
  }
}
