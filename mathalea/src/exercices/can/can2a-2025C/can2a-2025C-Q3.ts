import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une différence de deux entiers'
export const interactifReady = true

export const uuid = '8mrbg'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ3 extends ExerciceCan {
  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a =
        this.quotaChoice('aBase', [100, 200]) +
        this.quotaRandint('aEcart', 3, 8)
      b = this.quotaRandint('b', 2, 5) * 10 + 9
    }

    const resultat = a - b

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `$${a}-${b}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$${a}-${b}=${a}-${b + 1}+1=${miseEnEvidence(String(resultat))}$`
    this.canEnonce = `$${a}-${b}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(205, 29)
    else this.enonce()
  }
}
