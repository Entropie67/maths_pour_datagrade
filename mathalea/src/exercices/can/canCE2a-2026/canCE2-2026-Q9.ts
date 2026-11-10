import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = '0f085'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q9 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = randint(90, 98) * 10 // Multiple de 10 entre 900 et 980
    }

    const complement = 1000 - a

    this.question = `Complète.<br>`

    this.correction = `$${a}+${miseEnEvidence(complement)}=${texNombre(1000)}$`
    this.canEnonce = `Complète l'égalité.`
    this.canReponseACompleter = `$${a}+\\ldots=${texNombre(1000)}$`
    this.reponse = complement
    this.formatChampTexte = KeyboardType.clavierDeBase

    if (!this.interactif) {
      this.question += `$${a}+\\ldots=${texNombre(1000)}$`
    } else {
      this.optionsChampTexte = {
        texteAvant: `$${a}+$`,
        texteApres: `$=${texNombre(1000)}$`,
      }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(940)
    else this.enonce()
  }
}
