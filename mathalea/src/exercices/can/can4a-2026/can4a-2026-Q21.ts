import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { formatMinute } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Transformer un nombre de secondes en minutes et secondes'
export const interactifReady = true

export const uuid = 'p3stx'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ21 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(totalSecondes?: number) {
    if (totalSecondes == null) {
      const min = randint(1, 3)
      const sec = randint(1, 59)
      totalSecondes = min * 60 + sec
    }

    // Calcul des minutes et secondes
    const minutes = Math.floor(totalSecondes / 60)
    const secondes = totalSecondes % 60

    const compare = seq([fromOptions({ nombreDecimalSeulement: true })])
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: String(minutes), compare },
      champ2: { value: String(secondes), compare },
    }

    this.question = `${totalSecondes} \\text{ secondes} = \\text{  } %{champ1} \\text{ min } %{champ2} \\text{ s}`

    this.correction = `$${totalSecondes}$ secondes $= ${minutes} \\times 60 + ${secondes}$<br>
Donc : $${totalSecondes}$ s $= ${miseEnEvidence(String(minutes))}$ min $${miseEnEvidence(formatMinute(secondes))}$ s.`

    this.canEnonce = `Convertir $${totalSecondes}$ secondes en minutes et secondes.`
    this.canReponseACompleter = '$\\ldots$ min $\\ldots$ s'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(137)
    else this.enonce()
  }
}
