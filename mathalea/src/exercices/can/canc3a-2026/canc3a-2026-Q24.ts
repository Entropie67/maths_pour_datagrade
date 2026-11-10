import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en centaines/unités'
export const interactifReady = true

export const uuid = 'cc404'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2026CM2Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(n?: number) {
    if (n == null) {
      n = randint(10, 99) * 100 + randint(1, 99)
    }

    const centaines = Math.floor(n / 100)
    const unites = n % 100

    this.reponse = {
      champ1: { value: centaines.toString() },
      champ2: { value: unites.toString() },
    }
    this.question = `${texNombre(n, 0)} ~= %{champ1} \\text{ centaines } %{champ2} \\text{ unités}`

    this.correction = `$${texNombre(n, 0)} = ${miseEnEvidence(texNombre(centaines, 0))}\\text{ centaines et }${miseEnEvidence(texNombre(unites, 0))}\\text{ unités}$<br>
    car $${texNombre(centaines, 0)}\\times 100 + ${texNombre(unites, 0)} = ${texNombre(n, 0)}$.`

    this.canEnonce = `$${texNombre(n, 0)} =$`
    this.canReponseACompleter = '$\\ldots$ centaines $\\ldots$ unités'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(12485)
    else this.enonce()
  }
}
