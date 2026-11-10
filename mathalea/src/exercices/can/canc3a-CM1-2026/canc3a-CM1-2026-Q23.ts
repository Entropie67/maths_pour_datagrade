import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en minutes'
export const interactifReady = true

export const uuid = '2e77f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora
 */
export default class Can2026CM1Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = {
      texteApres: ' $\\text{min}$',
    }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(numerateur?: number, denominateur?: number) {
    if (numerateur == null || denominateur == null) {
      const fraction = choice([
        [1, 2],
        [1, 4],
        [3, 4],
      ])
      numerateur = fraction[0]
      denominateur = fraction[1]
    }

    const minutes = (numerateur * 60) / denominateur
    this.reponse = minutes.toString()
    this.question = `Complète.<br>
$\\dfrac{${numerateur}}{${denominateur}}\\text{ h} = $`
    if (!this.interactif) {
      this.question += ' $\\ldots \\text{ min}$'
    }

    this.correction = `$\\dfrac{${numerateur}}{${denominateur}}\\text{ h} = \\dfrac{${numerateur}}{${denominateur}}\\times 60\\text{ min} = ${miseEnEvidence(minutes)}\\text{ min}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$\\dfrac{${numerateur}}{${denominateur}}\\text{ h} = \\ldots \\text{ min}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(1, 4)
    else this.enonce()
  }
}
