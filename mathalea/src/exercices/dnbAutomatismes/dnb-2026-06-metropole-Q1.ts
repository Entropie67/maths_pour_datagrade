import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'abd05'
export const refs = {
  'fr-fr': ['3AutoN01'],
  'fr-ch': ['9R1NO4E-12', '9R2NO4E-12', '9R3NO4E-12', 'PRQNO11A-13'],
}
export const interactifReady = true
export const titre = "Donner l'écriture fractionnaire d'un nombre décimal"
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 1
 * @author Jean-Claude Lhote
 */
export default class AutoQ1MetropoleBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  enonce(num?: number, den?: number) {
    if (num == null || den == null) {
      den = choice([2, 4, 5])
      num =
        den === 2
          ? randint(1, 4) * 2 + 1
          : den === 4
            ? randint(1, 3, 2) + 4 * randint(0, 2)
            : randint(1, 4) + 5 * randint(0, 2)
    }
    const n = num / den

    this.question = `Donner une écriture du nombre $${texNombre(n, 2)}$ sous la forme d'une fraction.`
    this.reponse = `\\dfrac{${num}}{${den}}`
    this.correction = `Une fraction pouvant représenter le nombre $${texNombre(n, 2)}$ est la fraction décimale $${
      den === 4
        ? `\\dfrac{${texNombre(num * 25, 0)}}{100}`
        : den === 5
          ? `\\dfrac{${texNombre(num * 2, 0)}}{10}`
          : `\\dfrac{${texNombre(num * 5, 0)}}{10}`
    }$.<br>
    Mais cette fraction décimale peut être réduite et la forme la plus réduite de la fraction est $${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(3, 4)
    } else {
      this.enonce()
    }
  }
}
