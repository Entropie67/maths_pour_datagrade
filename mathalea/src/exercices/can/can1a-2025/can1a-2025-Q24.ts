import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une différence de deux carrés'
export const interactifReady = true

export const uuid = '83b36'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q24 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 2025 : randint(1, 5) * 100 + 25
    const b = a - 1
    this.reponse = texNombre(2 * a - 1, 0)
    this.question = `$${texNombre(a, 0)}^2-${texNombre(b, 0)}^2$ `
    this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a+b)(a-b)$ avec $a=${texNombre(a, 0)}$ et $b=${texNombre(b, 0)}$.<br>
    $\\begin{aligned}
    ${texNombre(a, 0)}^2-${texNombre(b, 0)}^2&=(${texNombre(a, 0)}+${texNombre(b, 0)})(${texNombre(a, 0)}-${texNombre(b, 0)})\\\\
    &=${texNombre(a + b, 0)}\\times 1\\\\
    &=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
  }
}
