/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une proportion'
export const interactifReady = true

export const uuid = 'c5768'
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
    const a = this.canOfficielle ? 31 : choice([19, 23, 29, 31])
    const b = this.canOfficielle ? 12 : randint(5, 15)
    const f = new FractionEtendue(a - b, a)
    this.reponse = { reponse: { value: f.texFraction } }
    this.question = `Dans une classe de $${a}$ élèves, $${b}$ viennent au lycée à vélo. <br>
      La proportion d’élèves de cette classe qui ne viennent pas à vélo est : `
    this.correction = `$${b}$ viennent au lycée à vélo, donc $${a - b}$ ne viennent pas au lycée à vélo.<br>
      La proportion d’élèves de cette classe qui ne viennent pas à vélo est donc $${miseEnEvidence(f.texFraction)}$.`

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
