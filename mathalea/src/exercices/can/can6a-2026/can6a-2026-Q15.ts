import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IFractionEtendue } from '../../../modules/FractionEtendue.type'
import { fraction } from '../../../modules/fractions'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  "Chercher le nombre de fois d'une fraction pour obtenir une autre fraction"
export const interactifReady = true

export const uuid = 'd9p5e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: IFractionEtendue, b?: IFractionEtendue) {
    let facteur = 2
    if (a == null || b == null) {
      const denB = choice([2, 3, 4, 5])
      const denA = denB * choice([2, 3, 4])
      const numA = choice([1, 3, 5, 7], denB)
      const numB = numA
      a = fraction(numA, denA)
      b = fraction(numB, denB)
      facteur = denA / denB
    }

    this.reponse = b.diviseFraction(a).texFractionSimplifiee
    this.question = `Combien de fois $${a.texFraction}$ dans $${b.texFraction}$ ?`

    this.correction = `$${b.texFraction}=${b.reduire(facteur).texFraction}$ donc il y a $${miseEnEvidence(this.reponse)}$ fois $${a.texFraction}$ dans $${b.texFraction}$.`
    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }
    }

    this.canEnonce = ''
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(fraction(1, 4), fraction(1, 2))
    else this.enonce()
  }
}
