import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Nombre de dizaines'
export const interactifReady = true

export const uuid = 'f3a3e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N6Q2 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 9) * choice([1, 10])
      b = choice([10, 100])
      c = b * 10
    }
    const premierMot = b === 10 ? 'dizaines' : 'centaines'
    const deuxiemeMot = c === 100 ? 'centaines' : 'milliers'
    this.reponse = String(a * 10)
    this.question = `Combien y a-t-il de ${premierMot} dans $${a}$ ${deuxiemeMot} ?`
    if (this.interactif) {
      this.question += '<br>'
    }
    this.correction = `$${a} \\times ${texNombre(c)} =${texNombre(a * c, 0)}= ${a * 10} \\times ${b}$<br>
    Il y a $${miseEnEvidence(a * 10)}$ ${premierMot} dans $${a}$ ${deuxiemeMot}.`

    this.canReponseACompleter = `$\\ldots$ ${premierMot}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 10, 100)
    else this.enonce()
  }
}
