/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une racine carrée'
export const interactifReady = true

export const uuid = '71105'
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
      this.reponse = 6
      this.question = '$\\sqrt{36}$ '
      this.correction = `$\\sqrt{36}=${miseEnEvidence(6)}$`
    } else {
      const carre = randint(4, 12)
      this.reponse = carre
      this.question = `$\\sqrt{${carre ** 2}}$ `
      this.correction = `$\\sqrt{${carre ** 2}}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
