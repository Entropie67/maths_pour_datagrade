import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Diviser par 5'
export const interactifReady = true

export const uuid = '17db4'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/

export default class DivisionParCinq extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let dividende: number
    if (this.canOfficielle) {
      dividende = 120
    } else {
      dividende = randint(11, 30, [12]) * 10
    }
    this.question = `$${texNombre(dividende, 0)}\\div 5`
    if (this.interactif) this.question += '=$'
    else this.question += '$'

    this.reponse = texNombre(dividende / 5, 0)
    this.correction =
      'Pour diviser par $5$, on peut diviser par $10$ puis multiplier le résultat par $2$ :<br>'
    this.correction += `
    $\\begin{aligned}
    ${texNombre(dividende, 0)}\\div 5&=(${texNombre(dividende, 0)}\\div 10)\\times 2\\\\
    &=${texNombre(dividende / 10, 0)}\\times 2\\\\
    &=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
  }
}
