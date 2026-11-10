import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le résultat d'une division par $3$ ou $4$"
export const interactifReady = true

export const uuid = 'fec31'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q30 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const b = this.canOfficielle ? 11 : choice([11, 22])
    const a = this.canOfficielle ? 3 : randint(3, 4)
    this.question = ` $${b * a} \\div ${a}$`
    this.correction = `$${b * a} \\div ${a} =${miseEnEvidence(b)}$`

    this.reponse = b
  }
}
