import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Aire du disque'
export const interactifReady = true

export const uuid = '3422w'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q27 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(4, 12) * 2
    }
    this.question = `Aire exacte du disque de diamètre $${a}\\text{ m}$`
    this.correction = `Le rayon du disque est : $r=${a}\\div 2=${a / 2}$.<br>L'aire du disque est : $\\pi r^2=\\pi\\times ${a / 2}^2=${miseEnEvidence(`${(a * a) / 4}\\pi`)}\\text{ m}^2$.`

    this.canReponseACompleter = '$\\ldots\\text{ m}^2$'
    this.optionsChampTexte = { texteApres: '$\\text{ m}^2$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = `${Math.round((a * a) / 4)}\\pi`
    this.question += this.interactif ? '<br>' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6)
    else this.enonce()
  }
}
