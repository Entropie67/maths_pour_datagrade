/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Additionner des relatifs'
export const interactifReady = true

export const uuid = 'ba553'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ' $=$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 0
      this.question = ' $50-55+5$'
      this.correction = `$50-55+5=-5+5=${miseEnEvidence(0)}$`
    } else {
      const a = choice([35, 45, 55, 65])
      const b = a + choice([5, 10])
      const c = randint(5, 10)
      this.reponse = a - b + c
      this.question = ` $${a}-${b}+${c}$`
      this.correction = `$${a}-${b}+${c}=${a - b}+${c}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
