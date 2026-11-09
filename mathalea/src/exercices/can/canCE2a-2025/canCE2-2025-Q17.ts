import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiples de $10$'
export const interactifReady = true

export const uuid = 'e24f0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025NCE2Q17 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(2, 29, [10, 20]) * 10
    }
    this.reponse = a
    this.correction = `$10 \\times ${miseEnEvidence(texNombre(a, 0))} = ${texNombre(a * 10)}$`
    this.canEnonce = 'Complète.'
    if (this.interactif) {
      this.question = '$10 \\times $'
      this.optionsChampTexte = { texteApres: `$= ${texNombre(a * 10)}$` }
    } else {
      this.question = `$10 \\times \\ldots\\ldots = ${texNombre(a * 10)}$`
    }
    this.canReponseACompleter = `$10 \\times \\ldots\\ldots = ${texNombre(a * 10)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(20)
    else this.enonce()
  }
}
