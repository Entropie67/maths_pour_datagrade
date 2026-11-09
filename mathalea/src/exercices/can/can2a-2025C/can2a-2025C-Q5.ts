import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer un produit par 11'
export const interactifReady = true

export const uuid = 'j3cnn'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ5 extends ExerciceCan {
  enonce(a?: number): void {
    if (a == null) {
      a = this.quotaRandint('a', 52, 99, [60, 70, 80, 90])
    }

    const resultat = a * 11

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `$${a}\\times 11=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$${a}\\times 11=${a}\\times 10+${a}=${a * 10}+${a}=${miseEnEvidence(texNombre(Number(String(resultat))))}$`
    this.canEnonce = `$${a}\\times 11=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(75)
    else this.enonce()
  }
}
