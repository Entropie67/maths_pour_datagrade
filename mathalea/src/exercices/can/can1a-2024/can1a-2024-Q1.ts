import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Multiplier des décimaux'
export const interactifReady = true

export const uuid = 'edbea'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/

export default class MultiplierDecimaux1 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let b: number
    let a: Decimal
    if (this.canOfficielle) {
      a = new Decimal('0.6')
      b = 7
    } else {
      a = new Decimal(randint(4, 9)).div(10)
      b = randint(3, 9)
    }
    this.question = `$${texNombre(a, 1)}\\times${texNombre(b, 0)}`
    if (this.interactif) this.question += '=$'
    else this.question += '$'

    this.reponse = texNombre(a.mul(b), 2)
    this.correction = `On peut calculer ainsi : <br>
    $\\begin{aligned}
    ${texNombre(a, 1)}\\times${texNombre(b, 0)}&=0,1\\times ${texNombre(a.mul(10), 0)}\\times${texNombre(b, 0)}\\\\
    &=0,1\\times ${texNombre(a.mul(10).mul(b), 0)}\\\\
    &=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
  }
}
