import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Enlever des centaines à un nombre'
export const interactifReady = true

export const uuid = '16bc5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q16 extends ExerciceCan {
  enonce(centaines?: number, nombre?: number) {
    if (centaines == null || nombre == null) {
      centaines = randint(3, 6)
      nombre = randint(625, 900)
    }

    this.reponse = nombre - centaines * 100
    this.question = `J'enlève $${centaines}$ centaines à $${nombre}$.<br>Combien j'obtiens ?`
    this.correction = `Enlever $${centaines}$ centaines à $${nombre}$ revient à calculer :<br>
    $${nombre}-${centaines * 100}=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    this.canEnonce = "J'enlève $6$ centaines à $628$.<br>Combien j'obtiens ?"

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 628)
    else this.enonce()
  }
}
