/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec des puissances de 10'
export const interactifReady = true

export const uuid = '847a9'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '100.1'
      this.question = '$10^{-1}+10^{2}$'
      this.correction = `$\\begin{aligned}
      10^{-1}+10^{2}&=${texNombre(0.1)} +${texNombre(100)}\\\\
      &=${miseEnEvidence(texNombre(100.1))}
      \\end{aligned}$`
    } else {
      const n1 = randint(2, 4)
      const n2 = randint(-3, 0)
      const choix = choice([true, false])
      this.reponse = arrondi(10 ** n1 + 10 ** n2, 3)
      this.question = `${choix ? `$10^{${n1}}+10^{${n2}}$ ` : `$10^{${n2}}+10^{${n1}}$ `}`
      this.correction = `$\\begin{aligned}
      ${choix ? `10^{${n1}}+10^{${n2}}&=${texNombre(10 ** n1, 0)} +${texNombre(10 ** n2, 3)}` : `10^{${n2}}+10^{${n1}}&=${texNombre(10 ** n2, 3)} +${texNombre(10 ** n1, 0)}`}\\\\
      &=${miseEnEvidence(texNombre(this.reponse, 3))}
      \\end{aligned}$`
    }
  }
}
