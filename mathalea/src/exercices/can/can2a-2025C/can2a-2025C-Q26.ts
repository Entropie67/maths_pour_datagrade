import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer un produit de deux nombres avec une égalité remarquable'
export const interactifReady = true

export const uuid = 'one9l'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ26 extends ExerciceCan {
  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = choice([60, 70, 80, 90, 100, 200, 300, 500])
      b = choice([1, 2])
    }

    const resultat = a * a - b * b

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `$${texNombre(a - b, 0)}\\times ${texNombre(a + b, 0)}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On utilise l'identité remarquable $(a-b)(a+b)=a^2-b^2$, avec $a=${a}$ et $b=${b}$.<br>
    Donc $${texNombre(a - b, 0)}\\times ${texNombre(a + b, 0)}=${texNombre(a * a, 0)}-${texNombre(b * b, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$.`
    this.canEnonce = `$${texNombre(a - b, 0)}\\times ${texNombre(a + b, 0)}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(500, 1)
    else this.enonce()
  }
}
