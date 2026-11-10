import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le double d'un nombre"
export const interactifReady = true

export const uuid = '8b6b9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q18 extends ExerciceCan {
  enonce(nombre?: number) {
    if (nombre == null) {
      nombre = randint(11, 19)
    }

    this.reponse = nombre * 2
    this.question = `Le double de $${nombre}$ est : `
    this.correction = `Le double de $${nombre}$ est $${nombre}\\times 2=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    this.canEnonce = `Le double de $${nombre}$ est : `
    this.canReponseACompleter = '$\\ldots$'
    if (!this.interactif) {
      this.question += `$\\ldots$`
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ``, texteApres: `.` }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(17)
    else this.enonce()
  }
}
