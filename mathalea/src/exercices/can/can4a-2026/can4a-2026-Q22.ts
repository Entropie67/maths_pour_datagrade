import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Simplifier une écriture avec des produits'
export const interactifReady = true

export const uuid = 'k9snh'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ22 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(2, 9)
      b = randint(2, 9)
    }

    const resultat = a * b

    this.question = `Simplifier $${a}\\times b\\times ${b}$.`

    this.correction = `$\\begin{aligned}
    ${a}\\times b\\times ${b}&=${a}\\times ${b}\\times b\\\\
    &=${miseEnEvidence(`${resultat}b`)}
    \\end{aligned}$`

    this.reponse = `${resultat}b`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 7)
    else this.enonce()
  }
}
