import { tableau2x2 } from '../../../lib/2d/tableau'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Proportionnalité'
export const interactifReady = true

export const uuid = 'a343v'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q14 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    let coeff
    let d
    if (a == null || b == null || c == null) {
      c = randint(3, 6)
      d = randint(c + 1, 9)
      coeff = choice([4, 5, 6, 7, 8])
      a = c * coeff
      b = d * coeff
    }
    coeff = a / c
    d = b / coeff
    this.reponse = d
    const [L0C0, L0C1, L1C0, L1C1] = [a, b, c, '?'].map((el) =>
      Object.assign({}, { content: `${el}`, latex: true }),
    )
    const tableau = tableau2x2(
      { L0C0, L0C1, L1C0, L1C1 },
      this.numeroExercice ?? 0,
      0,
      false,
      'tableauMathlive',
    )
    this.question = `On donne le tableau de proportionnalité : <br>${tableau} `
    this.correction = `On a $${a} \\div ${c} = ${coeff}$ donc $${b} \\div ${coeff} = ${miseEnEvidence(d)}$.`

    this.canReponseACompleter = '$?=\\ldots$'
    if (this.interactif) {
      this.question += '$\\text{ ? }=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(24, 36, 6)
    else this.enonce()
  }
}
