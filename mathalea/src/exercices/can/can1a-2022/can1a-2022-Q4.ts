import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner l'écriture décimale d'une somme de puissances de 10"
export const interactifReady = true

export const uuid = 'h0hm9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q4 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number, c?: number, d?: number, e?: number) {
    if (a == null || b == null || c == null || d == null || e == null) {
      a = randint(2, 9)
      b = choice([2, 3])
      c = randint(2, 9)
      d = randint(2, 9)
      e = choice([-1, -2, -3])
    }

    const reponse = new Decimal(a * 10 ** b + c + d * 10 ** e)

    if (choice([true, false])) {
      this.question = `Écriture décimale de  $${d}\\times 10^{${e}}+${c}+${a}\\times10^${b}$.`
      this.correction = `$${d}\\times 10^{${e}}+${c}+${a}\\times10^${b}=${texNombre(d * 10 ** e, 3)}+${texNombre(a * 10 ** b, 3)}+${c}=${miseEnEvidence(texNombre(reponse, 3))}$`
    } else {
      this.question = `Écriture décimale de $${a}\\times10^${b}+${c}+${d}\\times 10^{${e}}$.`
      this.correction = `$${a}\\times10^${b}+${c}+${d}\\times 10^{${e}}=${texNombre(a * 10 ** b, 3)}+${c}+${texNombre(d * 10 ** e, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
    }

    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 2, 3, 4, -3)
    else this.enonce()
  }
}
