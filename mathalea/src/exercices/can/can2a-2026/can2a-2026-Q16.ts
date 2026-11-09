import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Trouver la solution positive d'une équation produit nul"
export const interactifReady = true

export const uuid = 'no7j5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(2, 9)
      b = randint(2, 9, a) // différent de a
      // S'assurer que a < b pour que b soit la solution positive
      if (a > b) {
        ;[a, b] = [b, a]
      }
    }

    const solutionPositive = b

    this.reponse = solutionPositive.toString()

    this.question = `Solution positive de $(x+${a})(x-${b})=0$`

    this.correction = `Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul.<br>
    Donc : $x+${a}=0$ ou $x-${b}=0$.<br>
    D'où : $x=${-a}$ ou $x=${b}$.<br>
    La solution positive est $x=${miseEnEvidence(solutionPositive)}$.`

    this.canEnonce = `Solution positive de $(x+${a})(x-${b})=0$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, 4)
    else this.enonce()
  }
}
