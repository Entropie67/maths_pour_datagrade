import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer l'image d'une fraction par une fonction polynôme"
export const interactifReady = true

export const uuid = '6tfja'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  enonce(n?: number, signe?: number): void {
    if (n == null || signe == null) {
      n = choice([2, 3, 4, 5, 6])
    }

    const frac = new FractionEtendue(1, n)
    const fracCarre = new FractionEtendue(1, n * n)
    const resultat = new FractionEtendue(1 - n, n * n)

    this.reponse = resultat.simplifie().texFraction
    this.question = `$f$ est définie sur $\\mathbb{R}$ par $f(x)=x^2-x$.<br>
    $f\\left(${frac.texFraction}\\right)=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$f\\left(${frac.texFraction}\\right)=\\left(${frac.texFraction}\\right)^2-${frac.texFraction}=${fracCarre.texFraction}-${frac.texFraction}=${miseEnEvidence(resultat.simplifie().texFSD)}$`
    this.canEnonce = `$f$ est définie sur $\\mathbb{R}$ par $f(x)=x^2-x$.`
    this.canReponseACompleter = `$f\\left(${frac.texFraction}\\right)=\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(2, -1)
    else this.enonce()
  }
}
