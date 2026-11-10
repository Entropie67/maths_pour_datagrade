import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une dérivée'
export const interactifReady = true

export const uuid = '6d56a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ22 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.lycee
    this.optionsChampTexte = { texteAvant: ' <br>' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 2 : randint(1, 9)
    this.reponse = `e^{2x}-${a ** 2}`
    this.question = `Simplifier au maximum $(\\mathrm{e}^x+${a})(\\mathrm{e}^x-${a})$.`
    this.correction = `On développe en utilisant l'égalité remarquable $(a-b)(a+b)=a^2-b^2$ avec $a=\\mathrm{e}^x$ et $b=${a}$.<br>
    $(\\mathrm{e}^x+${a})(\\mathrm{e}^x-${a})=${miseEnEvidence(`\\mathrm{e}^{2x}-${a ** 2}`)}$`
  }
}
