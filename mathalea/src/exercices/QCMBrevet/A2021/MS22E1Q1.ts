import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductiblesFaciles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '16773'
export const refs = {
  'fr-fr': ['4C2QCM-04', 'BP2AutoH7'],
  'fr-ch': ['9R3QCMNO-7', '10CTQCMNO-11', '10LCQCMNO-13'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Somme de fractions (septembre 2021 Métropole)'
export const dateDePublication = '08/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep21Ex1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(f1: FractionEtendue, f2: FractionEtendue): void {
    const facteur = Math.round(f2.den / f1.den)
    const f1bis = f1.reduire(facteur)
    const somme = f1bis.sommeFraction(f2)
    this.reponses = [
      `$${somme.texFraction}$`,
      `$\\dfrac{${f1.num + f2.num}}{${f2.den}}$`,
      `$\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$`,
    ]

    this.enonce = `$${f1.texFraction}+${f2.texFraction}=\\ldots$`
    this.correction = `$\\begin{aligned}
    ${f1.texFraction}+${f2.texFraction}&=\\dfrac{${f1.num}\\times ${facteur}}{${f1.den}\\times ${facteur}}+${f2.texFraction}\\\\
    &=${f1bis.texFraction}+${f2.texFraction}\\\\
    &=\\dfrac{${f1bis.num}+${f2.num}}{${f2.den}}\\\\
    &=${miseEnEvidence(somme.texFraction)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      new FractionEtendue(4, 7),
      new FractionEtendue(5, 21),
    )
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const f1 = choice(obtenirListeFractionsIrreductiblesFaciles())
      const f2 = new FractionEtendue(
        randint(2, 9, [f1.num]),
        f1.den * choice([2, 3, 5]),
      )

      this.appliquerLesValeurs(f1, f2)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
