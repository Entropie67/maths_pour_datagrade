import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Appliquer $25\\,\\%$ sur un nombre'
export const interactifReady = true

export const uuid = 'c9016'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class AppliquerPourcentage extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 20
      this.question = '$25\\,\\%$ de $80$'
      this.correction = `$25\\,\\%$ de $80 = ${miseEnEvidence(20)}$`
      this.correction += `<br>Prendre $25\\,\\%$  de $80$ revient à prendre le quart de $80$.<br>
      Ainsi, $25\\,\\%$ de $80$ est égal à $80\\div 4 =20$.
   `
    } else {
      const a = choice([randint(2, 9) * 4, randint(1, 5) * 40])
      const p = 25
      this.reponse = a / 4
      this.question = `$${p}\\,\\%$ de $${a}$`

      this.correction = `$${p}\\,\\%$ de $${a} = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += `<br> Prendre $25\\,\\%$  de $${a}$ revient à prendre le quart de $${a}$.<br>
      Ainsi, $25\\,\\%$ de $${a}$ est égal à $${a}\\div 4 =${a / 4}$.
     `
    }
  }
}
