import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une suite logique'
export const interactifReady = true

export const uuid = 'fct3t'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  enonce(denom?: number, forceSens?: boolean) {
    if (denom == null) {
      denom = randint(2, 5)
    }

    const sens = forceSens !== undefined ? forceSens : choice([true, false])

    if (sens) {
      // Suite croissante : 1/denom, 1, denom, denom², ?
      const terme5 = denom ** 3

      this.question = `Compléter la suite logique :<br>
      $\\dfrac{1}{${denom}}~;~1~;~${denom}~;~${denom ** 2}~;~?$`

      this.correction = `On multiplie chaque terme par $${denom}$ pour obtenir le terme suivant :<br>
      $\\begin{aligned}
      \\dfrac{1}{${denom}}\\times ${denom}&=1\\\\
      1\\times ${denom}&=${denom}\\\\
      ${denom}\\times ${denom}&=${denom ** 2}\\\\
      ${denom ** 2}\\times ${denom}&=${miseEnEvidence(terme5)}
      \\end{aligned}$`

      this.canReponseACompleter = `$?=\\ldots$`
      this.reponse = terme5
    } else {
      // Suite décroissante : denom³, denom², denom, 1, ?
      const terme1 = denom ** 3
      const terme5 = `\\dfrac{1}{${denom}}`

      this.question = `Compléter la suite logique :<br>
      $${terme1}~;~${denom ** 2}~;~${denom}~;~1~;~?$`

      this.correction = `On divise chaque terme par $${denom}$ pour obtenir le terme suivant :<br>
      $\\begin{aligned}
      ${terme1}\\div ${denom}&=${denom ** 2}\\\\
      ${denom ** 2}\\div ${denom}&=${denom}\\\\
      ${denom}\\div ${denom}&=1\\\\
      1\\div ${denom}&=${miseEnEvidence(`\\dfrac{1}{${denom}}`)}
      \\end{aligned}$`

      this.canReponseACompleter = `$?=\\ldots$`
      this.reponse = terme5
    }
    if (!this.interactif) {
      this.question += `<br>$?=\\ldots$`
    } else {
      this.question += `<br>$?=$`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, true)
    else this.enonce()
  }
}
