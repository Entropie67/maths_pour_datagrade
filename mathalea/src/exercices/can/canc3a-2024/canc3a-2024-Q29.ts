import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Diviser par 5'
export const interactifReady = true

export const uuid = '4adca'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/

export default class DivisionParQuatreCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let dividende: number
    let diviseur: number
    if (this.canOfficielle) {
      dividende = 120
      diviseur = 4
    } else {
      dividende = randint(16, 39, [22, 20]) * 4
      diviseur = 4
    }
    this.question = `$${texNombre(dividende, 0)}\\div ${texNombre(diviseur, 0)}`
    if (this.interactif) this.question += '=$'
    else this.question += '$'

    this.reponse = texNombre(dividende / diviseur, 0)
    this.correction =
      'Pour diviser par $4$, on peut diviser par $2$ puis diviser le résultat par $2$ :<br>'
    this.correction += `
    $\\begin{aligned}
    ${texNombre(dividende, 0)}\\div 4&=(${texNombre(dividende, 0)}\\div 2)\\div 2\\\\
    &=${texNombre(dividende / 2, 0)}\\div 2\\\\
    &=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
  }
}
