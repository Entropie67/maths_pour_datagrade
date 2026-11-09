import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiplier un décimal par $10$, $100$, $1\\,000$'
export const interactifReady = true

export const uuid = 'y7xxb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q5 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(nombre?: number, multiplicateur?: number) {
    if (nombre == null || multiplicateur == null) {
      const b = this.quotaRandint('b', 0, 2) / 100
      const e = this.quotaRandint('e', 1, 9) / 1000
      nombre = this.quotaRandint('nombre', 1, 9) + b + e
      multiplicateur = this.quotaChoice('multiplicateur', [10, 100, 1000])
    }

    const reponse = nombre * multiplicateur
    this.reponse = reponse.toFixed(3)
    this.question = `$${texNombre(nombre, 4)}\\times ${texNombre(multiplicateur, 0)} ${this.interactif ? '=' : ''}$`
    this.correction = `$${texNombre(nombre, 3)}\\times ${texNombre(multiplicateur, 0)}=${miseEnEvidence(texNombre(nombre * multiplicateur, 2))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7.008, 100)
    else this.enonce()
  }
}
