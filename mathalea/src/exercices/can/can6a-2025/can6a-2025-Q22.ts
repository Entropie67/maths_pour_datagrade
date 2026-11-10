import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Effectuer une multiplication avec $25$'
export const interactifReady = true

export const uuid = 'b8fc6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N6Q22 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 32 : randint(3, 9) * 4
    this.reponse = a * 25
    this.question = `$${a}\\times 25$ `

    this.correction = `On peut décomposer $${a}$ en $${texNombre(a / 4, 0)}\\times 4$.<br>
    $\\begin{aligned}
    ${a}\\times 25 &= ${texNombre(a / 4, 0)}\\times 4\\times 25\\\\
    &=${texNombre(a / 4, 0)}\\times 100\\\\
    &=${miseEnEvidence(a * 25)}
    \\end{aligned}$`
  }
}
