import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '0a335'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1ANs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(num: number, den: number, m: number): void {
    const f = new FractionEtendue(num, den) // première fraction
    const f1 = new FractionEtendue(den + 1, den) // deuxième fraction, de la forme (d+1)/d
    const nbre = den * m // multiplicateur, multiple du dénominateur

    // Valeurs utiles pour la correction et les réponses
    const produitN = (den + 1) * nbre // numérateur de f1 × nbre
    const sommeN = num + produitN // numérateur du résultat (même dénominateur den)
    const resultat = f1.produitFraction(nbre).sommeFraction(f)

    // Distracteurs
    const fDist1 = f
      .sommeFraction(f1)
      .produitFraction(nbre).texFractionSimplifiee // (f + f1) × nbre : oubli de la priorité
    const fDist2 = new FractionEtendue(nbre * f1.n, nbre * f1.d).sommeFraction(
      f,
    ).texFraction // multiplication du numérateur ET du dénominateur

    this.enonce = `Le nombre $${f.texFraction}+${f1.texFraction}\\times ${nbre}$ est égal à :`

    this.correction = `On applique la priorité de la multiplication sur l'addition : on effectue d'abord la multiplication.<br>
$\\begin{aligned}
${f.texFraction}+${f1.texFraction}\\times ${nbre}&=${f.texFraction}+\\dfrac{${den + 1}\\times ${nbre}}{${den}}\\\\
&=${f.texFraction}+\\dfrac{${produitN}}{${den}}\\\\
&=\\dfrac{${num}+${produitN}}{${den}}\\\\
&=${miseEnEvidence(`\\dfrac{${sommeN}}{${den}}`)}
\\end{aligned}$`

    this.reponses = [
      `$${resultat.texFractionSimplifiee}$`,
      `$${fDist1}$`,
      `$${fDist2}$`,
      `$${nbre}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 1/2 + 3/2 × 4
    this.appliquerLesValeurs(1, 2, 2)
  }

  versionAleatoire = () => {
    // Pont avec le mécanisme Can : si le méta a coché « sujet officiel »,
    // on produit la version originale figée au lieu d'un tirage aléatoire.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const listeFractions = [
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [3, 4],
    ]
    let compteur = 0
    do {
      const frac = choice(listeFractions)
      const m = randint(2, 3)
      this.appliquerLesValeurs(frac[0], frac[1], m)
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
      this.enonce.replace(
        /^Le nombre \$(.*)\$ est égal à :\s*$/,
        (_, expression: string) =>
          this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
