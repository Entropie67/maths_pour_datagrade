import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer la moitié d'un nombre en dixièmes"
export const interactifReady = true

export const uuid = 'ity6q'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q18 extends ExerciceCan {
  constructor() {
    super()
    this.optionsChampTexte = { texteApres: ' unité(s)' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(nbDixièmes?: number) {
    if (nbDixièmes == null) {
      nbDixièmes = (randint(2, 15) * 2 + 1) * 4
    }

    this.reponse = texNombre(nbDixièmes / 20, 1)
    this.question =
      `La moitié de $${texNombre(nbDixièmes, 0)}$ dixièmes` +
      (this.interactif ? '<br>' : '<br>$\\ldots$ unité(s)')

    this.correction = `La moitié de $${texNombre(nbDixièmes, 0)}$ dixièmes est $${texNombre(nbDixièmes / 2, 1)}$.<br>
    Ainsi, la moitié de $${texNombre(nbDixièmes, 0)}$ dixièmes est $${miseEnEvidence(texNombre(nbDixièmes / 20, 1))}$ unités.`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = `La moitié de $${texNombre(nbDixièmes, 0)}$ dixièmes`
    this.canReponseACompleter = `$\\ldots$ unité(s)`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(30)
    else this.enonce()
  }
}
