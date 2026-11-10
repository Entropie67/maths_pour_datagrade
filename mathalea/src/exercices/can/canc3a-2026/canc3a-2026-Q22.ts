import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
import { aQ21, bQ21, coeffQ21 } from './canc3a-2026-Q21'

export const titre = 'Calculer un produit'
export const interactifReady = true

export const uuid = 'e8254'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2026CM2Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a: number, b: number, coeff: number) {
    const nouveauA = a * coeff
    const resultat = nouveauA * b

    this.reponse = texNombre(resultat, 0)
    if (this.interactif) {
      this.question = `$${nouveauA}\\times${b}=$`
    } else {
      this.question = `$${nouveauA}\\times${b}=\\ldots$`
    }

    this.correction = `$${nouveauA}\\times${b}=${coeff}\\times\\underbrace{${a}\\times${b}}_{${a * b}}=${miseEnEvidence(texNombre(resultat, 0))}$`

    this.canEnonce = `$${nouveauA}\\times${b}$`
  }

  nouvelleVersion() {
    this.enonce(aQ21, bQ21, coeffQ21)
  }
}
