import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Développer une expression du type $(ax - b)^2$'
export const interactifReady = true

export const uuid = 'nq187'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q24 extends ExerciceCan {
  constructor() {
    super()

    this.optionsDeComparaison = { developpementEgal: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(2, 4)
      b = randint(1, 4, a)
    }

    // (ax - b)² = a²x² - 2abx + b²
    const a2 = a * a
    const deuxab = 2 * a * b
    const b2 = b * b

    this.reponse = `${a2}x^2-${deuxab}x+${b2}`

    this.question = `Développer $(${a}x-${b})^2$`

    this.correction = `On utilise l'identité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=${a}x$ et $b=${b}$.<br>
$\\begin{aligned}(${a}x-${b})^2&=(${a}x)^2-2\\times ${a}x\\times ${b}+${b}^2\\\\
&=${miseEnEvidence(`${a2}x^2-${deuxab}x+${b2}`)}\\end{aligned}$`

    this.canEnonce = `Développer $(${a}x-${b})^2$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, 1)
    else this.enonce()
  }
}
