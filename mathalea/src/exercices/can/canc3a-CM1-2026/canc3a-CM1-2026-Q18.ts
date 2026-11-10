import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer la moitié d'un nombre"
export const interactifReady = true

export const uuid = '51fac'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q18 extends ExerciceCan {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(n?: number) {
    if (n == null) {
      n = choice([80, 100, 120, 140, 160, 180])
    }

    this.reponse = texNombre(n / 2, 0)
    this.question = `La moitié de $${texNombre(n, 0)}$`

    this.correction = `La moitié de $${texNombre(n, 0)}$ est $${texNombre(n, 0)}\\div 2=${miseEnEvidence(texNombre(n / 2, 0))}$.`

    this.canEnonce = `La moitié de $${texNombre(n, 0)}$`
    this.canReponseACompleter = ''
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(120)
    else this.enonce()
  }
}
