import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Trouver le complément à $1$ avec des dixièmes'
export const interactifReady = true

export const uuid = 'fb8ad'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CM1Q28 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = {
      texteAvant: '$\\dfrac{5}{10} + $',
      texteApres: '$= 1$',
    }
  }

  enonce(n?: number) {
    if (n == null) {
      n = randint(1, 9)
    }

    const complement = 10 - n
    this.reponse = `\\dfrac{${complement}}{10}`
    this.optionsChampTexte = {
      texteAvant: `$\\dfrac{${n}}{10} + $`,
      texteApres: '$= 1$',
    }

    this.question = `Complète.<br>
`
    if (!this.interactif) {
      this.question += `$\\dfrac{${n}}{10} + \\ldots = 1$`
    }

    this.correction = `$\\dfrac{${n}}{10} + ${miseEnEvidence(`\\dfrac{${complement}}{10}`)} = \\dfrac{10}{10} = 1$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$\\dfrac{${n}}{10} + \\ldots = 1$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(5)
    else this.enonce()
  }
}
