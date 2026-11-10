import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer $10$, $20$ ou $30\\,\\%$ d'un nombre"
export const interactifReady = true

export const uuid = 'ttsnc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q10 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number) {
    if (b == null || a == null) {
      a = this.quotaChoice('a', [10, 20, 30])
      b = this.quotaRandint('b', 2, 9) * 10
    }

    this.reponse = (a * b) / 100
    this.question = `$${a}\\,\\%$ de $${b}$`
    this.correction = `$10\\,\\%$ de $${b}$ est égal à $${texNombre(b)}\\div 10 = ${a === 10 ? `${miseEnEvidence(texNombre(b / 10, 0))}` : `${texNombre(b / 10, 0)}`}$.<br>
      ${
        a === 10
          ? ``
          : `Donc $${a}\\,\\%$ de $${b}$ est égal à $${texNombre(a / 10, 0)}\\times ${texNombre(b / 10, 0)}=${miseEnEvidence(texNombre((a * b) / 100, 2))}$.`
      }`

    if (this.interactif) {
      this.question += ' est égal à '
    }
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(20, 50)
    else this.enonce()
  }
}
