import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer une somme d'un entier et d'une fraction"
export const interactifReady = true

export const uuid = '1nklo'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ4 extends ExerciceCan {
  enonce(a?: number, num?: number, den?: number): void {
    if (a == null || num == null || den == null) {
      a = this.quotaRandint('a', -5, -1)
      den = this.quotaChoice('den', [3, 4, 5, 6, 7])
      num = den - 1
    }

    const resultat = new FractionEtendue(a * den + num, den).simplifie()

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'

    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: resultat.num },
      champ2: { value: resultat.den },
    }

    this.question = `${a}+\\dfrac{${num}}{${den}}=\\dfrac{%{champ1}}{%{champ2}}`

    this.correction = `$${a}+\\dfrac{${num}}{${den}}=\\dfrac{${a}\\times ${den}}{${den}}+\\dfrac{${num}}{${den}}=\\dfrac{${a * den}+${num}}{${den}}=${miseEnEvidence(resultat.texFSD)}$`
    this.canEnonce = `$${a}+\\dfrac{${num}}{${den}}=$`
    this.canReponseACompleter = '$\\dfrac{\\ldots}{\\ldots}$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, 2, 3)
    else this.enonce()
  }
}
