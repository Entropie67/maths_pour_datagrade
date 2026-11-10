import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
import { aQ21, bQ21 } from './can6a-2026-Q21'

export const titre = 'Calculer un produit'
export const interactifReady = true

export const uuid = 'q3sjw'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a: number, b: number) {
    this.reponse = (a * b * 4).toString()
    if (this.interactif) {
      this.question = `$${a * 4}\\times${b}=$`
    } else {
      this.question = `$${a * 4}\\times${b}=\\ldots$`
    }

    this.correction = `$${a * 4}\\times${b} =${miseEnEvidence(texNombre(a * b * 4, 0))}$`

    this.canEnonce = ''
  }

  nouvelleVersion() {
    this.enonce(aQ21, bQ21)
  }
}
