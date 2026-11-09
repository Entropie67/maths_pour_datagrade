import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Compléter une égalité avec une multiplication par $100$ ou $1000$'
export const interactifReady = true

export const uuid = 'd80w7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q6 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(15, 19)
      b = choice([100, 1000])
    }

    this.reponse = b
    if (this.interactif) {
      this.question = `Complète.<br>`
    } else {
      this.question = `Complète.<br>`
      this.question += `$${a}\\times \\ldots = ${texNombre(a * b)}$`
    }
    this.optionsChampTexte = {
      texteAvant: `$${a}\\times$`,
      texteApres: `$= ${texNombre(a * b)}$`,
    }

    this.correction = ` $${a}\\times ${miseEnEvidence(texNombre(b))} = ${texNombre(a * b)}$.`

    this.canEnonce = `Complète.`
    this.canReponseACompleter = `$${a}\\times ~\\ldots ~= ${texNombre(a * b)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(15, 1000)
    else this.enonce()
  }
}
