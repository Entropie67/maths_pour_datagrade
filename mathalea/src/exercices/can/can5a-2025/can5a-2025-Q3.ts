import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Fraction simple'
export const interactifReady = true

export const uuid = 'a343i'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q3 extends ExerciceCan {
  enonce(a?: string, b?: number) {
    let c = 3
    if (a == null || b == null) {
      a = this.quotaChoice('a', ['La moitié', 'Le tiers', 'Le quart'])
      c = a === 'La moitié' ? 2 : a === 'Le tiers' ? 3 : 4
      b =
        ((c === 4 ? randint(1, 2) : c === 3 ? randint(1, 3) : randint(1, 4)) +
          10) *
        c
    }
    this.reponse = b / c
    this.question = `${a} de $${b}$ `
    this.correction = `${a} de $${b}$ est égal à : $${b}\\div ${c} = ${miseEnEvidence(texNombre(b / c, 0))}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('Le tiers', 36)
    else this.enonce()
  }
}
