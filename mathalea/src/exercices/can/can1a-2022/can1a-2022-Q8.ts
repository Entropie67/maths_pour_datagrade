import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une image'
export const interactifReady = true

export const uuid = 'qixng'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q8 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(x?: number, b?: number, c?: number) {
    if (x == null || b == null || c == null) {
      x = randint(-3, -1)
      b = randint(-6, 6, 0)
      c = randint(-5, 5, 0)
    }

    const reponse = x ** 2 + b * x + c

    this.question = `Calculer l'expression  $${reduirePolynomeDegre3(0, 1, b, c)}$ pour $x=${x}$.`
    this.correction = `Pour $x=${x}$, on obtient :<br> $${reduirePolynomeDegre3(0, 1, b, c)}=(${x})^2${ecritureAlgebrique(b)}\\times (${x})${ecritureAlgebrique(c)}=${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(-1, -1, 1)
    else this.enonce()
  }
}
