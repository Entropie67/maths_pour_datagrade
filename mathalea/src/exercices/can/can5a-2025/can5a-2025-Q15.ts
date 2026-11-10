import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Répartition'
export const interactifReady = true

export const uuid = 'a343u'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q15 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      b = randint(3, 9)
      a = randint(3, 9, b)
    }
    const largeur = Math.min(a, b)
    const longueur = Math.max(a, b)
    this.reponse = (a + b) * 2
    this.question = `Périmètre d'un rectangle de longueur $${longueur}\\text{ cm}$ et de largeur $${largeur}\\text{ cm}$`
    this.correction = `Le périmètre d'un rectangle de longueur $${longueur}\\text{ cm}$ et de largeur $${largeur}\\text{ cm}$ est $2\\times (${longueur}+${largeur})=2\\times ${longueur + largeur}=${miseEnEvidence(texNombre((longueur + largeur) * 2, 0))}\\text{ cm}$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 3)
    else this.enonce()
  }
}
