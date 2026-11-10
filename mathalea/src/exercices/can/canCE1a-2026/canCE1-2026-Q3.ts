import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = '5a981'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q3 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(25, 39, [30, 31, 32, 33, 34]) * 10 + randint(1, 9)
      b = randint(5, 7) * 10
    }

    this.reponse = a + b
    this.question = `$${a} + ${b} = \\ldots$`
    this.correction = `$${a}+${b}=${miseEnEvidence(texNombre(a + b, 0))}$`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a} + ${b} = \\ldots$`
    this.formatChampTexte = KeyboardType.clavierDeBase
    if (this.interactif) {
      this.question = `$${a}${sp()}+${sp()}${b}${sp()}=$`
      this.optionsChampTexte = { texteApres: '' }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(259, 50)
    else this.enonce()
  }
}
