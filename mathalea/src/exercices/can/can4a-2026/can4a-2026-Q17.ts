import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un arrondi au dixième ou centième près'
export const interactifReady = true

export const uuid = 'zx5gn'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(a?: number, b?: number, c?: number, precision?: string) {
    let val = 25.465
    if (a == null || b == null || c == null || precision == null) {
      a = randint(1, 9) * 10 + randint(1, 9) + randint(1, 8) / 10
      b = randint(1, 9, 5)
      c = randint(1, 9, 5)
      val = a + b / 100 + c / 1000
      precision = choice(['dixième', 'centième'])
    }

    this.question = `L'arrondi au ${precision} près de $${texNombre(val, 3)}$ est `
    if (precision === 'dixième') {
      this.correction = `Le chiffre des centièmes est ${b > 5 ? 'supérieur' : 'inférieur'} à $5$, donc l'arrondi au dixième de $${texNombre(val, 3)}$ est $${miseEnEvidence(texNombre(arrondi(val, 1), 1))}$.`
      this.reponse = val.toFixed(1)
    } else {
      this.correction = `Le chiffre des millièmes est ${c > 5 ? 'supérieur' : 'inférieur'} à $5$, donc l'arrondi au centième de $${texNombre(val, 3)}$ est $${miseEnEvidence(texNombre(arrondi(val, 2), 2))}$.`
      this.reponse = val.toFixed(2)
    }

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(25.4, 6, 5, 'dixième')
    else this.enonce()
  }
}
