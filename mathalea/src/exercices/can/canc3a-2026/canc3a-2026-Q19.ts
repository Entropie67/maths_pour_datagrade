import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { fraction } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver le plus grand nombre (QCM)'
export const interactifReady = true

export const uuid = '31b4c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM2Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(decimal?: number, num?: number, den?: number) {
    if (decimal == null || num == null || den == null) {
      if (choice([true, false])) {
        // Cas 1 : décimal > 1 et fraction < 1
        decimal = 1 + randint(1, 9) * 0.1
        den = choice([3, 4, 5, 6, 7, 8, 9, 10])
        num = den - 1
      } else {
        // Cas 2 : fraction > 1 et décimal < 1
        decimal = randint(1, 9) * 0.1
        den = choice([2, 3, 4, 5, 6, 7, 8])
        num = den + 1
      }
    }

    const frac = fraction(num, den)
    const fracSupA1 = num > den
    const decimalSupA1 = decimal > 1
    const plusGrandEstDecimal = decimalSupA1 && !fracSupA1
    const plusGrandEstFraction = fracSupA1 && !decimalSupA1

    this.question = 'Quel est le plus grand nombre ?<br>'
    this.autoCorrection[0] = {
      options: { ordered: false },
      enonce: 'Quel est le plus grand nombre ?<br>',
      propositions: [
        {
          texte: `$${texNombre(decimal, 1)}$`,
          statut: plusGrandEstDecimal,
        },
        {
          texte: `$${frac.texFraction}$`,
          statut: plusGrandEstFraction,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    this.question += qcm.texte

    if (plusGrandEstDecimal) {
      this.reponse = texNombre(decimal, 1)
      this.correction = `$${texNombre(decimal, 1)}>1$ car $${texNombre(decimal, 1)}$ est plus grand que $1$.<br>
    De plus, $${frac.texFraction}<1$.<br>
    Ainsi, le plus grand nombre est $${miseEnEvidence(texNombre(decimal, 1))}$.`
    } else {
      this.reponse = frac.texFraction
      this.correction = `$${frac.texFraction}>1$ car $${num}>${den}$.<br>
    De plus, $${texNombre(decimal, 1)}<1$.<br>
    Ainsi, le plus grand nombre est $${miseEnEvidence(frac.texFraction)}$.`
    }

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canEnonce = 'Entoure le plus grand nombre.'
    this.canReponseACompleter = `$${texNombre(decimal, 1)}~~~~~${frac.texFraction}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(1.3, 4, 5)
    else this.enonce()
  }
}
