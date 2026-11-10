import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le double d'un nombre"
export const interactifReady = true

export const uuid = 'pmbmg'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q5 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number) {
    if (a == null) {
      a = randint(15, 19)
    }

    this.reponse = 2 * a

    this.question = `Le double de $${a}$`

    this.optionsChampTexte = { texteAvant: '<br>' }
    this.correction = `Le double de $${a}$ est $2\\times ${a}=${miseEnEvidence(2 * a)}$.`

    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canReponseACompleter = ``
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(16)
    else this.enonce()
  }
}
