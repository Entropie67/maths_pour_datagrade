import { prenomF } from '../../../lib/outils/Personne'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Fraction restante'
export const interactifReady = true

export const uuid = '3422i'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q24 extends ExerciceCan {
  enonce(a?: string, b?: string, c?: number) {
    let parts = 3
    if (a == null || b == null || c == null) {
      a = prenomF() as string
      b = choice(['tiers', 'quart', 'cinquième'])
      parts = b === 'tiers' ? 3 : b === 'quart' ? 4 : 5
      c = parts * randint(2, 6)
    }
    const reste = parts - 1
    this.question = `${a} utilise le ${b} d'un seau de $${c}$ litres de peinture.<br>
     Quelle est la quantité de peinture restante ?`
    this.correction = `${a} utilise le ${b} de la quantité.<br>
    $\\dfrac{1}{${parts}}\\times ${c}=${texNombre(c / parts, 0)}$<br>
    Elle utilise donc $${texNombre(c / parts, 0)}$ L.<br>
$${c}-${texNombre(c / parts, 0)}=${texNombre(c - c / parts, 0)}$<br>
    Il reste $${miseEnEvidence((reste * c) / parts)}$ L.`

    this.canReponseACompleter = '$\\ldots\\text{ L}$'
    this.reponse = `${Math.round((reste * c) / parts)}`
    this.optionsChampTexte = { texteApres: ' L' }
    this.question += this.interactif ? '<br>' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('Jeanne', 'tiers', 15)
    else this.enonce()
  }
}
