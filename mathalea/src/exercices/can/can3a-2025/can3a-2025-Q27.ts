import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier astucieusement'
export const interactifReady = true

export const uuid = '71b1f'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class MultiplierAstuce extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const Val1 = this.canOfficielle ? 4 : 4
    const Val2 = this.canOfficielle
      ? 0.47
      : new Decimal(randint(15, 49, [20, 30, 40])).div(100)
    const Val3 = this.canOfficielle ? 2.5 : choice([0.25, 2.5, 25])

    const reponse = new Decimal(Val1).mul(Val2).mul(Val3)
    this.reponse = reponse
    this.question = `$${texNombre(Val1, 2)}\\times ${texNombre(Val2, 2)} \\times ${texNombre(Val3, 2)}$ `
    this.correction = `$\\begin{aligned}
         ${texNombre(Val1, 2)}\\times ${texNombre(Val2, 2)} \\times ${texNombre(Val3, 2)}
          &=\\underbrace{${texNombre(Val1, 2)}\\times ${texNombre(Val3, 2)} }_{=${texNombre(Val1 * Val3, 0)}}\\times ${texNombre(Val2, 2)}\\\\
          & =${texNombre(Val1 * Val3, 0)}\\times ${texNombre(Val2, 2)}\\\\     
          &=${miseEnEvidence(`${texNombre(reponse, 2)}`)}
          \\end{aligned}$`
  }
}
