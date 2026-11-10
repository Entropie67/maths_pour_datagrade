import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier des fractions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '07/09/2023'

/**
 * @author Gilles Mora

 */

export const uuid = '07df0'

export const refs = {
  'fr-fr': ['can4C22-07', '2N31-flash3'],
  'fr-ch': ['11LCNO2C-10'],
}
export default class MultiplierFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    const listeFractions1 = [
      [1, 3],
      [1, 5],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [3, 4],
      [5, 3],
      [5, 3],
      [5, 4],
      [10, 3],
      [3, 10],
    ]
    const listeFractions2 = [
      [1, 3],
      [1, 5],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [9, 8],
      [10, 7],
      [10, 9],
      [7, 10],
    ]
    const fraction1 = this.quotaChoice('fraction1', listeFractions1)
    const fraction2 = this.quotaChoice('fraction2', listeFractions2)
    const n1 = fraction1[0]
    const d1 = fraction1[1]
    const n2 = fraction2[0]
    const d2 = fraction2[1]
    const f1 = new FractionEtendue(n1, d1)
    const f2 = new FractionEtendue(n2, d2)
    this.reponse = f1.produitFraction(f2).simplifie()
    this.question = `Calculer et écrire sous la forme d'une fraction simplifiée : $${f1.texFraction}\\times ${f2.texFraction}$.<br>`
    const etapeProduit = `\\dfrac{${n1}\\times ${n2}}{${d1}\\times ${d2}}`
    // Simplification « en croisé » avant de multiplier : n1 avec d2, n2 avec d1.
    const g1 = pgcd(n1, d2)
    const g2 = pgcd(n2, d1)
    const facteurAvecCancel = (valeur: number, commun: number) => {
      if (commun <= 1) return String(valeur)
      const reste = valeur / commun
      return reste === 1 ? `\\cancel{${commun}}` : `${reste}\\times\\cancel{${commun}}`
    }
    this.correction =
      g1 > 1 || g2 > 1
        ? `$${f1.texFraction}\\times ${f2.texFraction}=${etapeProduit}=\\dfrac{${facteurAvecCancel(n1, g1)}\\times ${facteurAvecCancel(n2, g2)}}{${facteurAvecCancel(d1, g2)}\\times ${facteurAvecCancel(d2, g1)}}=${miseEnEvidence(this.reponse.texFraction)}$`
        : `$${f1.texFraction}\\times ${f2.texFraction}=${etapeProduit}=${miseEnEvidence(this.reponse.texFraction)}$`
  }
}
