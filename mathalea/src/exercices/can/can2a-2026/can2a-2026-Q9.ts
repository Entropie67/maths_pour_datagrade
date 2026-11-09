import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Développer et réduire un carré'
export const interactifReady = true

export const uuid = 'tpykz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q9 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number): void {
    if (a == null) {
      a = randint(2, 9)
    }
    this.reponse = [
      `x^2-${2 * a}x+${a * a}`,
      `${a * a}+x^2-${2 * a}x`,
      `${a * a}-${2 * a}x+x^2`,
      `-${2 * a}x+${a * a}+x^2`,
      `-${2 * a}x+x^2+${a * a}`,
      `x^2+${a * a}-${2 * a}x`,
    ]
    this.question = `Développer et réduire $(x-${a})^2$.`
    this.correction = `On utilise l'identité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=x$ et $b=${a}$.<br>
$\\begin{aligned}(x-${a})^2&=x^2-2\\times x\\times ${a}+${a}^2\\\\
&=${miseEnEvidence(`x^2-${2 * a}x+${a * a}`)}\\end{aligned}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3)
    else this.enonce()
  }
}
