import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { texNombre } from '../../../lib/outils/texNombre'

export const titre = 'Additionner des décimaux'
export const interactifReady = true

export const uuid = 'cc48b'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/

export default class AjouteDecimauxPieges extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: Decimal
    let b: Decimal
    if (this.canOfficielle) {
      a = new Decimal('0.16')
      b = new Decimal('0.4')
    } else {
      const chiffre = randint(2, 7)
      b = new Decimal(chiffre).div(10)
      a = new Decimal(randint(1, 3) * 10 + (10 - chiffre)).div(100)
    }
    this.question = `$${texNombre(a, 2)}+${texNombre(b, 1)}`
    if (this.interactif) this.question += '=$'
    else this.question += '$'

    this.reponse = texNombre(a.add(b), 2)
    this.correction = `On peut calculer ainsi : <br>
    $\\begin{aligned}
    ${texNombre(a, 2)}+${texNombre(b, 1)}&=${texNombre(a, 2)}+${texNombre(b, 2, true)}\\\\
    &=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
  }
}
