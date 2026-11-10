import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Rendre une fraction irréductible'
export const interactifReady = true

export const uuid = 'upkts'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q29 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.formatInteractif = 'fillInTheBlank'
  }

  enonce(k?: number, numIrred?: number, denIrred?: number) {
    if (k == null || numIrred == null || denIrred == null) {
      // Génération aléatoire : on part d'une fraction irréductible et on la multiplie par k
      k = randint(2, 7) // Facteur de simplification
      const listeFractionsIrreductibles = [
        [4, 15],
        [3, 11],
        [2, 9],
        [5, 11],
        [3, 13],
        [10, 9],
        [4, 11],
        [7, 15],
        [2, 15],
        [5, 12],
        [6, 5],
        [7, 9],
        [8, 15],
        [3, 7],
        [5, 13],
      ]
      const fraction = choice(listeFractionsIrreductibles)
      numIrred = fraction[0]
      denIrred = fraction[1]
    }

    // Fraction de départ (non simplifiée)
    const numerateur = k * numIrred
    const denominateur = k * denIrred
    const fractionInitiale = new FractionEtendue(numerateur, denominateur)

    // Fraction simplifiée
    const fractionSimplifiee = fractionInitiale.simplifie()

    this.consigne = `Fraction irréductible de $${fractionInitiale.texFraction}$`
    this.question = '\\dfrac{%{champ1}}{%{champ2}}'
    const compare = seq([fromOptions({ fractionIrreductible: true })])
    this.reponse = {
      champ1: { value: fractionSimplifiee.num, compare },
      champ2: { value: fractionSimplifiee.den, compare },
    }

    this.correction = `$${fractionInitiale.texFraction}=\\dfrac{${numIrred}\\times \\cancel{${k}}}{${denIrred}\\times \\cancel{${k}}}=\\dfrac{${miseEnEvidence(fractionSimplifiee.num)}}{${miseEnEvidence(fractionSimplifiee.den)}}$`
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canEnonce = this.consigne
    this.canReponseACompleter = '$\\dfrac{\\ldots}{\\ldots}$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, 6, 5)
    else this.enonce()
  }
}
