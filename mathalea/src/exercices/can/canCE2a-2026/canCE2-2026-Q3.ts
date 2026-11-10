import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Donner le résultat d'une addition de dizaines"
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'b44a5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q3 extends ExerciceCan {
  enonce(nombre?: number, dizaines?: number) {
    if (nombre == null || dizaines == null) {
      nombre = randint(200, 600)
      dizaines = randint(2, 9)
    }

    this.reponse = nombre + dizaines * 10
    this.question = `Quel nombre j'obtiens si j'ajoute $${dizaines}$ dizaines à $${nombre}$ ?`
    this.correction = `$${nombre} + ${dizaines}~\\text{dizaines} = ${nombre} + ${dizaines * 10} = ${miseEnEvidence(texNombre(this.reponse, 0))}$`
    this.canEnonce = `Quel nombre j'obtiens si j'ajoute $${dizaines}$ dizaines à $${nombre}$ ?`

    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(434, 4)
    else this.enonce()
  }
}
