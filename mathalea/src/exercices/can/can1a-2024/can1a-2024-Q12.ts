import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
export const titre = 'Factoriser avec un facteur commun'
export const interactifReady = true

export const uuid = 'b4205'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Fatorisation1 extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '(2x-1)(2x-5)'
      this.question = ' Factoriser $(2x-1)^2-4(2x-1)$.<br>' //
      this.correction = `$(2x-1)$ est un facteur commun.<br>
    $\\begin{aligned}
    (2x-1)^2-4(2x-1)&=(2x-1)((2x-1)-4)\\\\
    &=${miseEnEvidence('(2x-1)(2x-5)')}
    \\end{aligned}$`
    } else {
      const a = randint(2, 3)
      const b = randint(-6, 6, 0)
      const c = randint(-5, 5, [0, 1, b, -b, -1])
      const choix = choice([true, false])
      this.reponse = `(${reduireAxPlusB(a, b)})(${a}x${ecritureAlgebrique(b + c)})`
      this.question = ` Factoriser ${
        choix
          ? `$(${reduireAxPlusB(a, b)})^2${ecritureAlgebrique(c)}(${reduireAxPlusB(a, b)})$.<br>`
          : `$${c}(${reduireAxPlusB(a, b)})+(${reduireAxPlusB(a, b)})^2$.<br>`
      }` //
      this.correction = `$(${reduireAxPlusB(a, b)})$ est un facteur commun.<br>
      $\\begin{aligned}${
        choix
          ? `(${reduireAxPlusB(a, b)})^2${ecritureAlgebrique(c)}(${reduireAxPlusB(a, b)})`
          : `${c}(${reduireAxPlusB(a, b)})+(${reduireAxPlusB(a, b)})^2`
      }&=${
        choix
          ? `(${reduireAxPlusB(a, b)})((${reduireAxPlusB(a, b)})${ecritureAlgebrique(c)})`
          : `(${reduireAxPlusB(a, b)})(${c}+(${reduireAxPlusB(a, b)}))`
      }\\\\
      &=${miseEnEvidence(`(${reduireAxPlusB(a, b)})(${a}x${ecritureAlgebrique(b + c)})`)}\\end{aligned}$`
    }
  }
}
