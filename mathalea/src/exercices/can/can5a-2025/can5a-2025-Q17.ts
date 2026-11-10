import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Conversion de longueurs'
export const interactifReady = true

export const uuid = 'a343w'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q17 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(2, 8) / 10 + randint(1, 9)
      b = choice([1000, 100, 10])
    }
    const prefixe = b === 1000 ? 'k' : b === 100 ? 'h' : 'da'
    this.reponse = a * b
    this.question = `$${texNombre(a, 1)}\\text{ ${prefixe}m} =$`
    this.correction = `$1\\text{ ${prefixe}m} = ${texNombre(b, 0)}\\text{ m}$, 
    donc $${texNombre(a, 1)}\\text{ ${prefixe}m} =${texNombre(a, 1)} \\times ${texNombre(b, 0)}\\text{ m}=${miseEnEvidence(`${texNombre(a * b, 0)}`)} \\text{ m}$.`

    this.canReponseACompleter = '$\\ldots\\text{ m}$'
    this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
    if (context.isHtml && !this.interactif) {
      this.question += ' $\\ldots\\text{ m}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3.5, 1000)
    else this.enonce()
  }
}
