import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir des heures décimales en minutes'
export const interactifReady = true

export const uuid = '3422k'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q26 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(1, 3) + randint(2, 8) / 10
    }
    const dp = a - Math.floor(a)
    this.question = `$${texNombre(a, 1)}\\text{ h }$`
    this.correction = `On décompose $${texNombre(a, 1)}\\text{ h }$ :<br>
     $\\begin{aligned}
     ${texNombre(a, 1)}\\text{ h }&=${texNombre(Math.floor(a), 0)} \\text{ h } +${texNombre(a - Math.floor(a), 1)}\\text{ h }\\\\
     &=${Math.floor(a)}\\times 60 \\text{ min }+${texNombre(dp, 1)}\\times 60 \\text{ min }\\\\
     &= ${Math.floor(a) * 60} \\text{ min } +${texNombre(dp * 60, 0)} \\text{ min }\\\\
     &=${miseEnEvidence(texNombre(a * 60, 0))} \\text{ min }
     \\end{aligned}$`

    this.canReponseACompleter = '$\\ldots\\text{ min}$'
    this.reponse = Math.round(a * 60)
    this.optionsChampTexte = { texteApres: ' min' }
    this.question += this.interactif ? ' $=$' : '$=\\ldots$ min'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2.4)
    else this.enonce()
  }
}
