import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'ceb15'
export const refs = {
  'fr-fr': ['3AutoN07'],
  'fr-ch': ['10LCNO5A-8', '10LSNO5A-8', 'PRQNO07C-8'],
}
export const interactifReady = true
export const titre = "Donner l'écriture scientifique d'un très petit nombre"
export const dateDePublication = '11/08/2026'

/**
 * DNB Polynésie juin 2026 - Question 2
 * @author Jean-Claude Lhote
 */
export default class AutoQ2PolynesieBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  enonce(n?: number) {
    let diviseur = 1000000
    if (n == null) {
      diviseur = choice([100000, 1000000, 10000])
      n = randint(101, 999, [200, 300, 400, 500, 600, 700, 800, 900]) / diviseur
    }
    const exposant = -Math.log10(diviseur) + 2
    const mantisse = (n * diviseur) / 100
    this.question = `Donner la notation scientifique de $${texNombre(n, 8)}$.`
    this.reponse = `${texNombre(mantisse, 3)}\\times 10^{${exposant}}`
    this.correction = `$${texNombre(n, 8)}=\\dfrac{${texNombre(mantisse, 3)}}{${texNombre(10 ** -exposant, 0)}}=\\dfrac{${texNombre(mantisse, 3)}}{10^${-exposant}}=${miseEnEvidence(`${texNombre(mantisse, 3)}\\times 10^{${exposant}}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(0.000457)
    } else {
      this.enonce()
    }
  }
}
