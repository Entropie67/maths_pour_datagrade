import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  "Chercher le nombre de fois d'une fraction pour obtenir $1$"
export const interactifReady = true

export const uuid = '45dad'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2026CM2Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(den?: number) {
    if (den == null) {
      den = randint(2, 10)
    }

    this.reponse = `${den}`
    this.question = `Combien de fois $\\dfrac{1}{${den}}$ d'unité dans $1$ unité ?`

    this.correction = `$1=\\dfrac{${den}}{${den}}$ donc il y a $${miseEnEvidence(String(den))}$ fois $\\dfrac{1}{${den}}$ dans $1$ unité.`
    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }
    }

    this.canEnonce = ''
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(4)
    else this.enonce()
  }
}
