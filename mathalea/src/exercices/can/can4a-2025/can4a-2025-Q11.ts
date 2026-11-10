import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir des durées'
export const interactifReady = true

export const uuid = 'ayxru'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q11 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      const listeFractions = [
        [1, 3],
        [3, 4],
        [1, 5],
        [2, 3],
        [2, 5],
        [3, 5],
        [4, 5],
        [1, 6],
        [1, 4],
      ]
      const fraction = choice(listeFractions)
      a = fraction[0]
      b = fraction[1]
    }
    this.reponse = texNombre((a * 60) / b, 0)
    this.question = `$\\dfrac{${a}}{${b}}$ d'heure `
    this.correction = `$\\dfrac{${a}}{${b}} \\text{ d'heure}=\\dfrac{${a}}{${b}}\\times 60 \\text{ min}=${miseEnEvidence(this.reponse)}$ min`

    if (this.interactif) {
      this.question += ' $=$'
    } else {
      this.question += '$=\\ldots$ min'
    }
    this.canEnonce = `$\\dfrac{${a}}{${b}}$ d'heure`
    this.canReponseACompleter = '$\\ldots$ min'
    this.optionsChampTexte = { texteApres: ' min' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 4)
    else this.enonce()
  }
}
