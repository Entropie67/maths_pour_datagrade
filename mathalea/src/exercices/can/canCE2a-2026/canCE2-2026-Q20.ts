import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer en retranchant des dizaines'
export const interactifReady = true

export const uuid = '6738e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q20 extends ExerciceCan {
  enonce(nombre?: number, dizaines?: number) {
    if (nombre == null || dizaines == null) {
      nombre = randint(101, 199, [110, 120, 130, 140, 150, 160, 170, 180, 190])
      dizaines = randint(
        Math.floor(nombre / 10) - 3,
        Math.floor(nombre / 10) - 1,
      )
    }

    this.reponse = nombre - dizaines * 10
    this.question = `Je retire $${dizaines}$ dizaines à $${nombre}$.<br>Combien j'obtiens ?`
    this.correction = `$${nombre}-${dizaines}$ dizaines $=${nombre}-${dizaines * 10}=${miseEnEvidence(texNombre(this.reponse, 0))}$`

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(132, 13)
    else this.enonce()
  }
}
