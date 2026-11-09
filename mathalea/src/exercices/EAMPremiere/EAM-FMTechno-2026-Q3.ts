import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'e7232'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Multiplier un entier avec une fraction'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3FMt2026 extends ExerciceQcmACourt {
  // Produit : n × (num/den). Réponse correcte : (n×num)/den.
  private appliquerLesValeurs(n: number, num: number, den: number): void {
    const frac = new FractionEtendue(num, den)
    const correct = new FractionEtendue(n * num, den) // (n×num)/den

    // Distracteurs (erreurs classiques), tous différents en valeur de la bonne réponse
    const dDenom = new FractionEtendue(n * num, n * den) // multiplie aussi le dénominateur
    const dTout = new FractionEtendue(n * num * den, den) // multiplie tout au numérateur
    const dAddition = new FractionEtendue(n + num, den) // addition au lieu de multiplication

    this.enonce = ` $${n}\\times ${frac.texFraction}=$`

    this.correction = `On a $${n}=\\dfrac{${n}}{1}$ :<br><br>
$\\begin{aligned}
${n}\\times ${frac.texFraction}&=\\dfrac{${n}}{1}\\times \\dfrac{${num}}{ ${den}}\\\\
&=\\dfrac{${n}\\times ${num}}{1\\times ${den}}\\\\
&=${miseEnEvidence(correct.texFraction)}
\\end{aligned}$`

    // On affiche les fractions NON simplifiées (comme sur le sujet)
    this.reponses = [
      `$${correct.texFraction}$`,
      `$${dDenom.texFraction}$`,
      `$${dTout.texFraction}$`,
      `$${dAddition.texFraction}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : 4 × 2/3 = 8/3  (distracteurs 8/12, 24/3, 6/3)
    this.appliquerLesValeurs(4, 2, 3)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [n, num, den] : n ≥ 2, den ≥ 2, num/den irréductible, (n×num)/den irréductible,
    // et on évite n = num = 2 (sinon addition = multiplication).
    const donnees = [
      [4, 2, 3], // 4 × 2/3 = 8/3 (image)
      [5, 2, 3], // 10/3
      [3, 2, 5], // 6/5
      [2, 4, 5], // 8/5
      [3, 4, 5], // 12/5
      [4, 3, 5], // 12/5
      [5, 3, 4], // 15/4
      [2, 5, 3], // 10/3
      [4, 5, 3], // 20/3
      [5, 4, 3], // 20/3
      [2, 3, 5], // 6/5
      [3, 5, 4], // 15/4
    ]

    let compteur = 0
    do {
      const [n, num, den] = choice(donnees)
      this.appliquerLesValeurs(n, num, den)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(/^\s*\$(.+)=\$\s*$/, (_, expression: string) =>
        this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
