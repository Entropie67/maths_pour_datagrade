import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer avec des puissances de $10$'
export const interactifReady = true

export const uuid = 'vwsun'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q20 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  enonce(n1?: number, n2?: number, choix?: boolean) {
    if (n1 == null || n2 == null) {
      // Version aléatoire
      n1 = randint(2, 4)
      n2 = randint(0, 4)
      choix = choice([true, false])
    }

    this.reponse = arrondi(10 ** n1 + 10 ** n2, 3)

    this.question = choix
      ? `$10^{${n1}}+10^{${n2}}$`
      : `$10^{${n2}}+10^{${n1}}$`

    this.correction = `$\\begin{aligned}
${
  choix
    ? `10^{${n1}}+10^{${n2}}&=${texNombre(10 ** n1, 0)} +${texNombre(10 ** n2, 3)}`
    : `10^{${n2}}+10^{${n1}}&=${texNombre(10 ** n2, 3)} +${texNombre(10 ** n1, 0)}`
}\\\\
&=${miseEnEvidence(texNombre(this.reponse, 3))}
\\end{aligned}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 2, true)
    else this.enonce()
  }
}
