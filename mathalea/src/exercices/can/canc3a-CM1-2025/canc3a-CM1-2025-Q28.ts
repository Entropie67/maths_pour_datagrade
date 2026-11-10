import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer d'un entier avec un décimal"
export const interactifReady = true

export const uuid = '48568'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q28 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(3, 9)
    const b = this.canOfficielle ? 8 : randint(6, 9)
    this.reponse = a * b * 10
    this.question = `$${a}\\times ${b}$  dizaines `

    this.correction = `$${b}$  dizaines $= ${texNombre(b * 10, 0)}$<br>
     $${a}\\times ${b}$  dizaines $=${a}\\times ${texNombre(b * 10, 0)}=${miseEnEvidence(texNombre(a * b * 10, 0))}$`
  }
}
