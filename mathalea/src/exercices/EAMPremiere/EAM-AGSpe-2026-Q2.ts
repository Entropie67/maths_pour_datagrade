import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '9fa8d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11CTFA3B-12', '11LCFA3B-12', '11LSFA3B-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Effectuer une application numérique d'une formule"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2AGs2026 extends ExerciceQcmACourt {
  // E = (L1 - L2) / (L3 × L4). Difficultés : L2 < 0 (double signe -) et produit avec au moins un négatif.
  private appliquerLesValeurs(
    L1: string,
    L2: string,
    L3: string,
    L4: string,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
  ): void {
    const par = (n: number) => (n < 0 ? `(${n})` : `${n}`)

    const num = v1 - v2
    const denomProd = v3 * v4
    const numErrone = v1 + v2 // erreur sur le double signe -

    const E = new FractionEtendue(num, denomProd)

    this.enonce = `On considère la relation $E = \\dfrac{${L1} - ${L2}}{${L3}${L4}}$.<br><br>`
    this.enonce += `Lorsque $${L1} = ${v1}$, $${L2} = ${v2}$, $${L3} = ${v3}$ et $${L4} = ${v4}$, on a :`

    this.correction = `On remplace chaque lettre par sa valeur :<br>`
    this.correction += `$\\begin{aligned}
    E &= \\dfrac{${L1} - ${L2}}{${L3}${L4}} \\\\
    &= \\dfrac{${par(v1)} - ${par(v2)}}{${par(v3)} \\times ${par(v4)}}\\\\
    &=\\dfrac{${num}}{${denomProd}}\\\\
    &=${miseEnEvidence(E.texFractionSimplifiee)}\\end{aligned}$`

    this.reponses = [
      `$E = ${E.texFractionSimplifiee}$`,
      `$E = ${new FractionEtendue(numErrone, denomProd).texFractionSimplifiee}$`, // erreur sur le « -- » au numérateur
      `$E = ${new FractionEtendue(num, -denomProd).texFractionSimplifiee}$`, // erreur de signe sur le produit
      `$E = ${new FractionEtendue(numErrone, -denomProd).texFractionSimplifiee}$`, // les deux erreurs
    ]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : (x - y)/(zt) avec x=3, y=-2, z=-3, t=-4  =>  5/12
    this.appliquerLesValeurs('x', 'y', 'z', 't', 3, -2, -3, -4)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const jeuxDeLettres = [
      ['a', 'b', 'c', 'd'],
      ['m', 'n', 'p', 'q'],
      ['r', 's', 't', 'u'],
      ['p', 'q', 'r', 's'],
    ]

    let compteur = 0
    do {
      const [L1, L2, L3, L4] = choice(jeuxDeLettres)
      const v1 = choice([2, 3, 4, 5])
      const v2 = choice([-1, -2, -3, -4].filter((v) => -v !== v1)) // v1 ≠ |v2| (évite un distracteur nul)
      // au moins un facteur négatif au dénominateur
      const [v3, v4] = choice([
        [choice([-2, -3, -4]), choice([-2, -3, -4])], // deux négatifs (produit positif)
        [choice([-2, -3, -4]), choice([2, 3, 4])], // un négatif (produit négatif)
        [choice([2, 3, 4]), choice([-2, -3, -4])], // un négatif (produit négatif)
      ])
      this.appliquerLesValeurs(L1, L2, L3, L4, v1, v2, v3, v4)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(
        saisie,
        reponse,
        reponse.includes('frac')
          ? { fractionEgale: true, nombreDecimalSeulement: true }
          : { nombreDecimalSeulement: true },
      )
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(/, on a :\s*$/, ', calculer $E$.')
    // La bonne réponse du QCM est de la forme « $E = \dfrac{5}{12}$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$E = /, '').replace(/\$$/, '')
    this.texteAvantReponseCourte = '$E=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  }
}
