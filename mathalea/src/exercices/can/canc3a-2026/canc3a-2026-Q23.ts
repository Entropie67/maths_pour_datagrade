import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en secondes'
export const interactifReady = true

export const uuid = 'ff431'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class Can2026CM2Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = {
      texteApres: ' $\\text{s}$',
    }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(minutes?: number) {
    if (minutes == null) {
      minutes = randint(2, 10)
    }

    this.reponse = (minutes * 60).toString()
    this.question = `Complète.<br>
  $${minutes}\\text{ min} = $`
    if (!this.interactif) {
      this.question += ' $\\ldots \\text{ s}$'
    }

    this.correction = `$${minutes}\\text{ min} = ${minutes}\\times 60\\text{ s} = ${miseEnEvidence(texNombre(minutes * 60, 0))}\\text{ s}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${minutes}\\text{ min} = \\ldots \\text{ s}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2)
    else this.enonce()
  }
}
