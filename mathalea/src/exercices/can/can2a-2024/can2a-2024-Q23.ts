/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un coefficient directeur'
export const interactifReady = true

export const uuid = '32d90'
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
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '-2'
      this.question =
        'Coefficient directeur de la droite d’équation $y=-2x+3$<br>'
      this.correction = `L'équation de la droite est de la forme $y=mx+p$.<br>
     Le coefficient directeur est $m$ et l'ordonnée à l'origine est $p$. <br>
    Le coefficient directeur de la droite est donc $m=${miseEnEvidence('-2')}$.`
    } else {
      const a = randint(-9, 9, 0)
      const b = randint(-9, 9, 0)
      const choix = choice([true, false])
      this.reponse = a
      this.question = `Coefficient directeur de la droite d’équation ${choix ? `$y=${rienSi1(a)}x${ecritureAlgebrique(b)}$` : `$y=${b}${ecritureAlgebriqueSauf1(a)}x$`}`
      this.correction = `L'équation de la droite est de la forme $y=mx+p$.<br>
       Le coefficient directeur est $m$ et l'ordonnée à l'origine est $p$. <br>
      Le coefficient directeur de la droite est donc $m=${miseEnEvidence(this.reponse)}$.`
    }
  }
}
