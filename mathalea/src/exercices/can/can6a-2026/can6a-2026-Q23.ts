import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en secondes'
export const interactifReady = true

export const uuid = 'htbe7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class Can20266Q23 extends ExerciceCan {
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

  enonce(minutes?: number, secondes?: number) {
    if (secondes == null || minutes == null) {
      minutes = randint(1, 5)
      secondes = randint(1, 5) * 10
    }

    this.question = `Complète.<br>
  $${minutes}\\text{ min et }${secondes}\\text{ s} = $`
    if (!this.interactif) {
      this.question += ` $\\ldots \\text{ s}$`
    }

    this.reponse = minutes * 60 + secondes

    this.correction = `$${minutes}\\text{ min et }${secondes}\\text{ s} = (${minutes}\\times 60)\\text{ s}+${secondes}\\text{ s} = ${miseEnEvidence(texNombre(minutes * 60 + secondes, 0))} \\text{ s}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${minutes}\\text{ min et }${secondes}\\text{ s} = \\ldots \\text{ s}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2, 10)
    else this.enonce()
  }
}
