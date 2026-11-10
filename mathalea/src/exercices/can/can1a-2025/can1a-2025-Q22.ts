import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Donner le nombre d'antécédent(s) par la fonction carré"
export const interactifReady = true

export const uuid = 'a9046'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q22 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' <br>' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -4 : randint(-5, 5, 0)

    this.reponse = a > 0 ? 2 : 0
    this.question = `Donner le nombre d'antécédent(s) de $${a}$ par la fonction carré. `
    this.correction = `Comme $${a > 0 ? `${a} > 0` : `${a} < 0`}$, l'équation $x^2=${a}$  ${a > 0 ? ' a deux solutions ' : "n'a aucune solution"}. <br>
    Ainsi, $${a}$ a ${a > 0 ? `$${miseEnEvidence(2)}$ antécédents` : `$${miseEnEvidence(0)}$ antécédent`} par la fonction carré.`
  }
}
