import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { ppcm } from '../../../lib/outils/primalite'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '65fd3'
export const refs = {
  'fr-fr': ['4C2QCM-06', 'BP2AutoH8'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Somme de fractions (09/2021 Antilles-Guyane)'
export const dateDePublication = '09/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AntillesSep20Ex2Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(f1: FractionEtendue, f2: FractionEtendue): void {
    const ppc = ppcm(f2.den, f1.den)
    const facteur1 = ppc / f1.den
    const facteur2 = ppc / f2.den

    const f1bis = f1.reduire(facteur1)
    const f2bis = f2.reduire(facteur2)
    const somme = f1bis.sommeFraction(f2bis)
    this.reponses = [
      `$${somme.texFractionSimplifiee}$`,
      `$${texNombre(f1.valeurDecimale + f2.valeurDecimale, 3)}$`,
      `$\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$`,
      `$\\dfrac{${f1.num * f2.num}}{${f1.den + f2.den}}$`,
    ]

    this.enonce = `$${f1.texFraction}+${f2.texFraction}=\\ldots$`
    this.correction = `$\\begin{aligned}
    ${f1.texFraction}+${f2.texFraction}&=\\dfrac{${f1.num}\\times ${facteur1}}{${f1.den}\\times ${facteur1}}+\\dfrac{${f2.num}\\times ${facteur2}}{${f2.den}\\times ${facteur2}}\\\\
    &=${f1bis.texFraction}+${f2bis.texFraction}\\\\
    &=\\dfrac{${f1bis.num}+${f2bis.num}}{${f2bis.den}}\\\\
    &=${miseEnEvidence(somme.texFractionSimplifiee)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      new FractionEtendue(1, 3),
      new FractionEtendue(1, 4),
    )
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const a = choice([1, 2])
      const b = choice([3, 6])
      const c = choice([1, 3, 5, 7, 9, 11])
      const f1 = new FractionEtendue(a, b)
      const f2 = new FractionEtendue(c, 4)
      this.appliquerLesValeurs(f1, f2)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
