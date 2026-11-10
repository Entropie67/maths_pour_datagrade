import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en dizaines/unités'
export const interactifReady = true

export const uuid = 'cfc0e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(n?: number) {
    if (n == null) {
      n = choice([
        randint(10, 99) * 100 + randint(1, 99),
        randint(10, 99) * 10 + randint(1, 9),
      ])
    }

    const dizaines = Math.floor(n / 10)
    const unites = n % 10

    this.reponse = {
      champ1: { value: dizaines.toString() },
      champ2: { value: unites.toString() },
    }
    this.question = `${texNombre(n, 0)} ~= %{champ1} \\text{ dizaines } %{champ2} \\text{ unités}`

    this.correction = `$${texNombre(n, 0)} = ${miseEnEvidence(texNombre(dizaines, 0))}\\text{ dizaines et }${miseEnEvidence(texNombre(unites, 0))}\\text{ unités}$<br>
    car $${texNombre(dizaines, 0)}\\times 10 + ${texNombre(unites, 0)} = ${texNombre(n, 0)}$.`

    this.canEnonce = `$${texNombre(n, 0)} =$`
    this.canReponseACompleter = '$\\ldots$ dizaines $\\ldots$ unités'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(1435)
    else this.enonce()
  }
}
