import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Développer et réduire un produit de deux binômes du 1er degré'
export const interactifReady = true

export const uuid = '3mq4t'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q3 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      a = randint(1, 5)
      b = randint(-3, 3, 0)
      c = randint(1, 5)
      d = randint(-5, 5, [0, b])
    }

    this.question = `Développer et réduire l'expression $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$.`
    this.correction = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}$`
    this.reponse = [
      reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d),
    ]
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, -1, 3, 2)
    else this.enonce()
  }
}
