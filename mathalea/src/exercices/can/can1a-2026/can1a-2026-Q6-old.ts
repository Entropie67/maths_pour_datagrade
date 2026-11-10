import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer le produit de deux fractions'
export const interactifReady = true

export const uuid = 't3fv4'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q6 extends ExerciceCan {
  enonce(n1?: number, d1?: number, n2?: number, d2?: number) {
    if (n1 == null || d1 == null || n2 == null || d2 == null) {
      const listeFractions: [number, number, number, number][] = [
        [30, 14, -7, 6], // 6|30, 7|14 → -5/2
        [24, 21, -7, 8], // 8|24, 7|21 → -2/3
        [20, 9, -3, 5], // 5|20, 3|9 → -4/3
        [18, 35, -7, 6], // 6|18, 7|35 → -3/5
        [15, 14, -7, 5], // 5|15, 7|14 → -3/2
        [28, 15, -5, 7], // 7|28, 5|15 → -4/3
        [-21, 10, -5, 7], // 7|21, 5|10 → 3/2
        [35, 6, -3, 7], // 7|35, 3|6 → -5/2
        [-24, 35, -7, 8], // 8|24, 7|35 → 2/5
        [20, 21, -7, 4], // 4|20, 7|21 → -5/3
      ]
      const fraction = choice(listeFractions)
      n1 = fraction[0]
      d1 = fraction[1]
      n2 = fraction[2]
      d2 = fraction[3]
    }

    const f1 = new FractionEtendue(n1, d1)
    const f2 = new FractionEtendue(n2, d2)
    const produit = f1.produitFraction(f2)

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.reponse = produit.simplifie().texFraction
    this.question = `Écrire sous forme d'une fraction irréductible $${f1.texFraction}\\times ${f2.texFraction}$.`
    this.correction = `$${f1.texFraction}\\times ${f2.texFraction}=\\dfrac{${n1}\\times ${ecritureParentheseSiNegatif(n2)}}{${d1} \\times ${ecritureParentheseSiNegatif(d2)}}${produit.texSimplificationAvecEtapes(true, orangeMathalea)}$`
    this.canEnonce = `Écrire sous forme d'une fraction irréductible <br> \\vspace{0.2cm} $${f1.texFraction}\\times ${f2.texFraction}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(30, 14, -7, 6)
    else this.enonce()
  }
}
