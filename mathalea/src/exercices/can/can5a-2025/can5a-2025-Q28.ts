import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir un volume'
export const interactifReady = true

export const uuid = 'a3f3b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q26 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(1, 9) / 10
    }
    this.reponse = a * 1000
    this.question = `$${texNombre(a, 1)}$ L $=$ `
    this.correction = `$1\\text{ L}=${texNombre(1, 0)}\\text{ dm}^3=${texNombre(1000, 0)}\\text{ cm}^3$<br>
    Ainsi, $${texNombre(a, 1)}\\text{ L}=${texNombre(a, 1)}\\times ${texNombre(1000)} \\text{ cm}^3 =${miseEnEvidence(texNombre(a * 1000, 0))}\\text{ cm}^3$.`
    this.optionsChampTexte = { texteApres: ' $\\text{ cm}^3$' }

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'
    if (!this.interactif && context.isHtml) {
      this.question += '$\\ldots\\text{ cm}^3$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.5)
    else this.enonce()
  }
}
