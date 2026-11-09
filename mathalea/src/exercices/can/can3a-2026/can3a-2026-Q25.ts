import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter un encadrement entre deux racines carrées'
export const interactifReady = true

export const uuid = 'n8k8p'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(n?: number, ecartMin?: number, ecartMax?: number) {
    if (n == null || ecartMin == null || ecartMax == null) {
      // Version aléatoire : n entre 3 et 12
      n = randint(3, 12)
      ecartMin = randint(1, 4)
      ecartMax = randint(1, 4)
    }

    this.formatChampTexte = KeyboardType.clavierDeBase

    // Calcul des bornes
    const borne1 = n ** 2 - ecartMin
    const borne2 = n ** 2 + ecartMax

    this.reponse = n

    this.question = `Complète avec un nombre entier :<br><br>
$\\sqrt{${borne1}} < $`

    this.optionsChampTexte = {
      texteApres: `$< \\sqrt{${borne2}}$`,
    }

    this.correction = `On cherche le nombre entier $n$ tel que $\\sqrt{${borne1}} < n < \\sqrt{${borne2}}$.<br>
On sait que :<br>
$\\bullet$ $\\sqrt{${n ** 2}} = ${n}$<br>
$\\bullet$ $${n ** 2} - ${ecartMin} = ${borne1}$ donc $\\sqrt{${borne1}} < ${n}$<br>
$\\bullet$ $${n ** 2} + ${ecartMax} = ${borne2}$ donc $${n} < \\sqrt{${borne2}}$<br><br>
Par conséquent : $\\sqrt{${borne1}} < ${miseEnEvidence(n)} < \\sqrt{${borne2}}$`

    this.canEnonce = 'Complète avec un nombre entier.'
    this.canReponseACompleter = `$\\sqrt{${borne1}} < \\ldots < \\sqrt{${borne2}}$`

    if (!this.interactif) {
      this.question = `Complète avec un nombre entier :<br><br>
$\\sqrt{${borne1}} < \\ldots < \\sqrt{${borne2}}$`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(10, 5, 15)
    else this.enonce()
  }
}
