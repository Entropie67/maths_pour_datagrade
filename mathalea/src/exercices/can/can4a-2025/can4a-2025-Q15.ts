import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Arrondir un nombre décimal'
export const interactifReady = true

export const uuid = '3ed97'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q15 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, precision?: string) {
    let val = 24.286
    if (a == null || b == null || c == null || precision == null) {
      a = randint(1, 9) * 10 + randint(1, 9) + randint(1, 8) / 10
      b = randint(1, 9, 5)
      c = randint(1, 9, 5)
      val = a + b / 100 + c / 1000
      precision = choice(['dixième', 'centième'])
    }

    this.question = `Arrondi de $${texNombre(val, 3)}$ au ${precision} `
    if (precision === 'dixième') {
      this.correction = `Le chiffre des centièmes est ${b > 5 ? 'supérieur' : 'inférieur'} à $5$, donc l'arrondi au dixième de $${texNombre(val, 3)}$ est $${miseEnEvidence(texNombre(arrondi(val, 1), 1))}$`
      this.reponse = val.toFixed(1)
    } else {
      this.correction = `Le chiffre des millièmes est ${c > 5 ? 'supérieur' : 'inférieur'} à $5$, donc l'arrondi au centième de $${texNombre(val, 3)}$ est $${miseEnEvidence(texNombre(arrondi(val, 2), 2))}$`
      this.reponse = val.toFixed(2)
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(24.2, 8, 6, 'centième')
    else this.enonce()
  }
}
