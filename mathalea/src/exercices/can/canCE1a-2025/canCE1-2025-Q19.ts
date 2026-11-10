import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Trouver la moitié d'un nombre"
export const interactifReady = true

export const uuid = 'c8515'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q19 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(3, 6)
      b = randint(4, 9)
      c = a * b
    }
    this.formatInteractif = 'fillInTheBlank'

    this.reponse = { champ1: { value: b } }
    this.question = `${a} \\times  \\ldots = ${c}`
    this.correction = `$${a} \\times  ${miseEnEvidence(b)} = ${c}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a} \\times \\ldots = ${c}$`
    if (this.interactif) {
      this.question = `${a} ~\\times~ %{champ1} = ${c}`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 7, 28)
    else this.enonce()
  }
}
