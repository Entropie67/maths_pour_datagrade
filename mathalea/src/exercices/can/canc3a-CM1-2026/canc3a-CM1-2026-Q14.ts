import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une somme astucieusement'
export const interactifReady = true

export const uuid = '9f722'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q14 extends ExerciceCan {
  enonce(a?: number, b?: number, d?: number) {
    if (a == null || b == null || d == null) {
      d = choice([10, 100, 1000])
      a = randint(2, 8)
      b = randint(1, 9)
    }
    const result = a * d + b
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.consigne = 'Complète.'

    this.reponse = {
      champ1: {
        value: result,
        compare: seq([fromOptions({ nombreDecimalSeulement: true })]),
      },
    }

    this.question = `${a} + \\dfrac{${b}}{${texNombre(d)}} = \\dfrac{%{champ1}}{${texNombre(d)}}`

    this.correction = `$\\begin{aligned}
    ${a} + \\dfrac{${b}}{${texNombre(d)}} &= \\dfrac{${texNombre(a * d, 0)}}{${texNombre(d)}} + \\dfrac{${b}}{${texNombre(d)}}\\\\
     &= \\dfrac{${miseEnEvidence(texNombre(result, 0))}}{${texNombre(d)}}
    \\end{aligned}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a} + \\dfrac{${b}}{${texNombre(d)}} = \\dfrac{\\ldots}{${texNombre(d)}}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 2, 100)
    else this.enonce()
  }
}
