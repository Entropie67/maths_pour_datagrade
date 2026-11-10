/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier par 1,5 ou 2,5 ou ...'
export const interactifReady = true

export const uuid = '8d837'
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
      this.reponse = 10
      this.question = '$4\\times 2,5$ '
      this.correction = `$4\\times 2,5=${miseEnEvidence(10)}$`
      this.canEnonce = '$4\\times 2,5$'
    } else {
      const couple = choice([
        [4, 25],
        [2, 15],
        [4, 15],
        [2, 55],
        [2, 65],
        [4, 5],
        [4, 35],
        [2, 75],
      ])
      const a = couple[0]
      const b = couple[1] / 10
      this.reponse = new Decimal(a).mul(b)
      this.question = `$${a} \\times ${texNombre(b, 1)}$ `
      this.correction = `$${a} \\times ${texNombre(b, 1)}=${miseEnEvidence(texNombre(a * b, 1))}$`
      this.canEnonce = `$${a} \\times ${texNombre(b, 1)}$`
    }
  }
}
