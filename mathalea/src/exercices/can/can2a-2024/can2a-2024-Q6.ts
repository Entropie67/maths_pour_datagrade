/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier deux décimaux'
export const interactifReady = true

export const uuid = '9379b'
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
      this.reponse = '0,06'
      this.question = '$0,2\\times 0,3$'
      this.correction =
        'On décompose le calcul pour le rendre plus simple mentalement :<br>'
      this.correction +=
        ' $\\begin{aligned} 0,2\\times 0,3 &=2\\times 0,1\\times 3\\times 0,1\\\\'
      this.correction += ' &= 6\\times 0,01\\\\'
      this.correction += `\n&= ${miseEnEvidence('0,06')}`
      this.correction += '\n\\end{aligned}$'
    } else {
      const a = randint(1, 9) / 10
      const b = randint(1, 9) / 10
      this.reponse = (a * b).toFixed(2)
      this.question = `$${texNombre(a, 1)}\\times${texNombre(b, 1)}$`
      this.correction =
        'On décompose le calcul pour le rendre plus simple mentalement :<br><br>'
      this.correction += `$\\begin{aligned} ${texNombre(a, 1)}\\times${texNombre(b, 1)} &=${texNombre(a * 10, 0)}\\times 0,1\\times ${texNombre(b * 10, 0)}\\times 0,1\\\\`
      this.correction += `&= ${texNombre(a * b * 100, 0)}\\times 0,01\\\\`
      this.correction += `&= ${miseEnEvidence(texNombre(a * b, 2))}`
      this.correction += '\\end{aligned}$'
    }
  }
}
