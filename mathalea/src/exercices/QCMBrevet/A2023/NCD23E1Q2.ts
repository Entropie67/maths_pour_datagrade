import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { fraction } from '../../../modules/fractions'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '64ccf'
export const refs = {
  'fr-fr': ['4C2QCM-01', 'BP2AutoH6'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul avec des fractions (12/2023 Nouvelle Calédonie)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Matthieu DEVILLERS et Jean-Claude LHOTE
 * matthieu.devillers@ac-rennes.fr
 */
export default class NouvelleCaledonieDec23Exo1Q2 extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$-\\dfrac{1}{10}$',
      '$\\dfrac{7}{20}$',
      '$\\dfrac{2}{10}$',
    ]
    this.enonce = 'Calculer $\\dfrac{3}{5}-\\dfrac{2}{5} \\times \\dfrac{7}{4}$'
    this.correction = ` $\\begin{aligned}
    \\dfrac{3}{5}-\\dfrac{2}{5} \\times \\dfrac{7}{4} &=  \\dfrac{3}{5}-\\dfrac{14}{20} \\\\
                                                       &=\\dfrac{6}{10}-\\dfrac{7}{10} \\\\
                                                       &= -\\dfrac{1}{10} \\\\
                                                       \\end{aligned} $`
  }

  versionAleatoire = () => {
    const num2 = choice([2, 6, 10])
    const num1 = num2 + 1
    const num3 = choice([3, 7, 9])
    const frac1 = fraction(num1, 5)
    const frac2 = fraction(num2, 5)
    const frac3 = fraction(num3, 4)
    const produit = frac2.produitFraction(frac3)
    const frac1Bis = frac1.reduire(2)
    const resultat = frac1Bis.differenceFraction(produit.simplifie()).texFSD
    this.reponses = [
      `$${resultat}$`,
      `$\\dfrac{${(num1 - num2) * num3}}{20}$`,
      `$\\dfrac{${num2 * num3 - num1}}{15}$`,
    ]
    this.enonce = `$${frac1.texFraction}-${frac2.texFraction} \\times ${frac3.texFraction}$`
    this.correction = ` $\\begin{aligned}
     ${frac1.texFraction}-${frac2.texFraction} \\times ${frac3.texFraction} &=  ${frac1.texFraction}-${produit.texFraction} \\\\
                                                        &=${frac1Bis.texFraction}-${produit.reduire(0.5).texFraction} \\\\
                                                        &= ${miseEnEvidence(String(resultat))} \\\\
                                                        \\end{aligned} $`
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
