import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Donner le résultat d'une addition de dizaines"
export const interactifReady = true

export const uuid = '1096a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q5 extends ExerciceCan {
  enonce(nombre?: number) {
    if (nombre == null) {
      nombre = randint(3, 12) * 10 // Multiple de 10 entre 30 et 150
    }

    const moitie = nombre / 2

    this.question = `Compléter.<br>
    La moitié de $${texNombre(nombre)}$ est`

    this.correction = `La moitié de $${nombre}$ est : $${nombre}\\div 2=${miseEnEvidence(texNombre(moitie, 0))}$.`

    this.reponse = moitie
    this.formatChampTexte = KeyboardType.clavierDeBase

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.optionsChampTexte = { texteAvant: '', texteApres: `.` }
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = ` La moitié de $${texNombre(nombre)}$ est $\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(60)
    else this.enonce()
  }
}
