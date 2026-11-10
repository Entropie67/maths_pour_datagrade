import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une expression littérale pour une valeur donnée'
export const interactifReady = true

export const uuid = 'ch2pn'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ20 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number, v?: number) {
    if (a == null || b == null || v == null) {
      a = randint(2, 9)
      b = randint(2, 9)
      v = choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    }

    const reponse = a * (v - b)

    this.question = `Calculer $${a}(v-${b})$ pour $v=${v}$.`

    this.correction = `Pour $v=${v}$ :<br>
    $\\begin{aligned}
    ${a}(v-${b})&=${a}(${v}-${b})\\\\
    &=${a}\\times ${ecritureParentheseSiNegatif(v - b)}\\\\
    &=${miseEnEvidence(reponse)}
    \\end{aligned}$`

    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 4, -1)
    else this.enonce()
  }
}
