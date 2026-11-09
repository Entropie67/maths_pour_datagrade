import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Q13'
export const interactifReady = true

export const uuid = '6dwg7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ13 extends ExerciceCan {
  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(2, 9)
      b = choice([2, 3, 5, 6, 7])
    }

    const resultat = a * a * b

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `Écrire sous la forme d'un nombre entier $\\left(${a}\\sqrt{${b}}\\right)^2$.<br>`
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
    this.correction = `$\\left(${a}\\sqrt{${b}}\\right)^2=${a}^2\\times \\left(\\sqrt{${b}}\\right)^2=${a * a}\\times ${b}=${miseEnEvidence(String(resultat))}$`
    this.canEnonce = `Écrire sous la forme d'un nombre entier $\\left(${a}\\sqrt{${b}}\\right)^2$.`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, 3)
    else this.enonce()
  }
}
