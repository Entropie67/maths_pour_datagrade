import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { onlyIrreducibleFractions } from '../../lib/interactif/checks'

export const uuid = '4de4a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '26/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2ANns2026 extends ExerciceQcmACourt {
  // C = (a1/b1) + n × (num2/den2), avec den2 = n × b1
  // => n se simplifie avec den2, puis addition à dénominateur b1.
  private appliquerLesValeurs(
    a1: number,
    b1: number,
    n: number,
    num2: number,
  ): void {
    const den2 = n * b1
    const frac1 = new FractionEtendue(a1, b1)
    const frac2 = new FractionEtendue(num2, den2)
    const produitNonSimplifie = new FractionEtendue(n * num2, den2) // (n×num2)/den2

    // Réponse correcte : a1/b1 + num2/b1 = (a1+num2)/b1
    const correct = new FractionEtendue(a1 + num2, b1)

    // Distracteurs (erreurs classiques)
    const dPriorite = new FractionEtendue((a1 + n * b1) * num2, n * b1 * b1) // (frac1 + n) × frac2 : oubli de la priorité
    const dOubliDen = new FractionEtendue(a1 + n * num2 * b1, b1) // frac1 + n×num2 : oubli du dénominateur de frac2
    const dSoustraction = new FractionEtendue(num2 - a1, b1) // n×frac2 − frac1 : soustraction au lieu d'addition

    this.enonce = `On considère le nombre $C=${frac1.texFraction}+${n}\\times ${frac2.texFraction}$.<br>On a :`

    this.correction = `On effectue d'abord la multiplication (priorité sur l'addition) :<br>
$\\begin{aligned}
C&=${frac1.texFraction}+${n}\\times ${frac2.texFraction}\\\\
&=${frac1.texFraction}+${produitNonSimplifie.texFraction}\\\\
&=${frac1.texFraction}+${produitNonSimplifie.texFractionSimplifiee}\\\\
&=\\dfrac{${a1}+${num2}}{${b1}}\\\\
&=${miseEnEvidence(correct.texFractionSimplifiee)}
\\end{aligned}$`

    this.reponses = [
      `$C=${correct.texFractionSimplifiee}$`,
      `$C=${dPriorite.texFractionSimplifiee}$`,
      `$C=${dOubliDen.texFractionSimplifiee}$`,
      `$C=${dSoustraction.texFractionSimplifiee}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // C = 1/2 + 3 × 5/6 = 3  (le sujet officiel : distracteurs 31/2, 35/12, 2)
    this.appliquerLesValeurs(1, 2, 3, 5)
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // [a1, b1, n, num2] : frac1 = a1/b1 ∈ {1/2, 3/2, 1/3, 2/3}, frac2 = num2/(n×b1)
    // Résultats : 4 entiers (3, 4, 2, 2) et 4 fractions irréductibles (7/3, 5/3, 10/3, 8/3).
    const donnees = [
      [1, 2, 3, 5], // 1/2 + 3×5/6 = 3
      [3, 2, 3, 5], // 3/2 + 3×5/6 = 4
      [1, 2, 2, 3], // 1/2 + 2×3/4 = 2
      [1, 3, 2, 5], // 1/3 + 2×5/6 = 2
      [2, 3, 2, 5], // 2/3 + 2×5/6 = 7/3
      [1, 3, 3, 4], // 1/3 + 3×4/9 = 5/3
      [2, 3, 3, 8], // 2/3 + 3×8/9 = 10/3
      [1, 3, 5, 7], // 1/3 + 5×7/15 = 8/3
    ]
    const [a1, b1, n, num2] = choice(donnees)
    this.appliquerLesValeurs(a1, b1, n, num2)
    let compteur = 0
    do {
      const [a1, b1, n, num2] = choice(donnees)
      this.appliquerLesValeurs(a1, b1, n, num2)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) => {
      const resultat = fonctionComparaison(
        saisie,
        reponse.includes('frac') ? reponse : `\\frac{${reponse}}{1}`,
        { fractionEgale: true, nombreDecimalSeulement: true },
      )
      if (
        resultat.isOk &&
        !onlyIrreducibleFractions().run(saisie, reponse).passed
      ) {
        return {
          ...resultat,
          feedback: 'La réponse est juste mais elle pouvait être simplifiée.',
        }
      }
      return resultat
    }
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^On considère le nombre \$(C=[^$]*)\$\.<br>On a :\s*$/,
        (_, definition: string) =>
          `On considère le nombre $${definition}$.<br>Calculer $C$.`,
      )
    // La bonne réponse du QCM est de la forme « $C=\dfrac{5}{3}$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$C=/, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$C=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  }
}
