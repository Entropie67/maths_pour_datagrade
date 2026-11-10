import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Effectuer une multiplication avec $50$'
export const interactifReady = true

export const uuid = '57201'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q22 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 12 : randint(7, 9) * 2
    this.reponse = a * 50
    this.question = `$${a}\\times 50$ `

    this.correction = `On décompose $${a}$ en $${texNombre(a / 2, 0)}\\times 2$.<br>
    $\\begin{aligned}
    ${a}\\times 50 &= ${texNombre(a / 2, 0)}\\times 2\\times 50\\\\
    &=${texNombre(a / 2, 0)}\\times 100\\\\
    &=${miseEnEvidence(a * 50)}
    \\end{aligned}$`
  }
}
