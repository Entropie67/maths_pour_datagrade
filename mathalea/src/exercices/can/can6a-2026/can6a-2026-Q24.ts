import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir en centièmes/dixièmes'
export const interactifReady = true

export const uuid = '4onq5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
  }

  enonce(unite?: number, centiemes?: number) {
    if (unite == null || centiemes == null) {
      unite = randint(1, 9) * 10 + randint(1, 9)
      centiemes = randint(1, 9) * 10 + randint(1, 9)
    }

    const somme = unite + centiemes / 100
    const dixiemes = Math.floor(somme * 10)
    const ct = centiemes % 10

    this.reponse = {
      champ1: { value: dixiemes.toString() },
      champ2: { value: ct.toString() },
    }
    this.question = `${texNombre(somme, 2)} = %{champ1} \\text{ dixièmes }%{champ2} \\text{ centièmes }`
    this.correction = `$${texNombre(somme, 2)} = ${texNombre(dixiemes / 10, 1)} + ${texNombre(ct / 100, 2)} = ${miseEnEvidence(texNombre(dixiemes, 0))}\\text{ dixièmes } + ${miseEnEvidence(texNombre(ct, 0))} \\text{ centièmes }$`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = `$${texNombre(somme, 2)}=$`
    this.canReponseACompleter = `$\\ldots\\text{dixièmes}\\ldots\\text{centièmes}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(57, 89)
    else this.enonce()
  }
}
