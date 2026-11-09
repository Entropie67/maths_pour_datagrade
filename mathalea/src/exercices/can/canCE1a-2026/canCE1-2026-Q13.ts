import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le double d'un nombre"
export const interactifReady = true

export const uuid = 'd46e5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q13 extends ExerciceCan {
  enonce(nombre?: number) {
    if (nombre == null) {
      nombre = randint(11, 20)
    }

    this.reponse = 2 * nombre
    this.question = `Le double de $${nombre}$ est :`
    this.correction = `Le double de $${nombre}$ est : $${nombre}\\times 2=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    this.canEnonce = 'Le double de $14$ est :'
    this.canReponseACompleter = '$\\ldots$'
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '.' }
    } else {
      this.question += ' $\\ldots$'
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(14)
    else this.enonce()
  }
}
