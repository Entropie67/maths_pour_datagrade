import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Additionner des m et des cm'
export const interactifReady = true

export const uuid = '2b446'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(m?: number, cm?: number) {
    if (m == null || cm == null) {
      m = randint(2, 6)
      cm = randint(5, 20)
    }

    this.reponse = texNombre(m * 100 + cm, 2)

    this.question = `$${texNombre(m, 0)}\\text{ m}+${texNombre(cm, 0)}\\text{ cm}=$`
    if (!this.interactif) {
      this.question += ` $\\ldots\\text{ cm}$ `
    }
    this.correction = `$${texNombre(m, 0)}\\text{ m}+${texNombre(cm, 0)}\\text{ cm}=${texNombre(m * 100, 0)}\\text{ cm}+${texNombre(cm, 0)}\\text{ cm}$<br>
    Donc $${texNombre(m, 0)}\\text{ m}+${texNombre(cm, 0)}\\text{ cm}=${miseEnEvidence(texNombre(m * 100 + cm, 2))}\\text{ cm}$.`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${texNombre(m, 0)}\\text{ m}+${texNombre(cm, 0)}\\text{ cm}= \\ldots \\text{ cm}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(3, 5)
    else this.enonce()
  }
}
