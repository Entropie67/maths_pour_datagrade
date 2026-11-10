import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'a4cb3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '09/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3CEs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    numA: number,
    denA: number,
    numB: number,
    denB: number,
    k: number,
    d1: string,
    d2: string,
    d3: string,
  ): void {
    const fracA = new FractionEtendue(numA, denA)
    const fracB = new FractionEtendue(numB, denB)

    // Calcul du quotient exact A / B et de la réponse finale
    const fracDiv = fracA.diviseFraction(fracB)
    const correct = new FractionEtendue(fracDiv.n + k * fracDiv.d, fracDiv.d)

    this.enonce = `On considère les nombres $A = ${fracA.texFraction}$ et $B = ${fracB.texFraction}$.<br>
    Le nombre $\\dfrac{A}{B} + ${k}$ est égal à :`

    this.correction = `On commence par calculer le quotient $\\dfrac{A}{B}$ en multipliant par l'inverse de $B$ :<br>
$\\begin{aligned}
\\dfrac{A}{B} &= ${fracA.texFraction} \\div ${fracB.texFraction}\\\\
&= ${fracA.texFraction} \\times \\dfrac{${denB}}{${numB}}\\\\
&= \\dfrac{${numA} \\times ${denB}}{${denA} \\times ${numB}}\\\\
&= \\dfrac{${numA * denB}}{${denA * numB}}\\\\
&= ${fracDiv.texFractionSimplifiee}
\\end{aligned}$<br><br>
On ajoute ensuite $${k}$ au résultat obtenu :<br>
$\\begin{aligned}
\\dfrac{A}{B} + ${k} &= ${fracDiv.texFractionSimplifiee} + ${k}\\\\
&= ${fracDiv.texFractionSimplifiee} + \\dfrac{${k} \\times ${fracDiv.d}}{${fracDiv.d}}\\\\
&= ${miseEnEvidence(correct.texFractionSimplifiee)}
\\end{aligned}$`

    // Plus de "if/else" mystérieux ici, on applique directement les chaînes reçues
    this.reponses = [
      `$${correct.texFractionSimplifiee}$`,
      `$${d1}$`,
      `$${d2}$`,
      `$${d3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // On passe directement les valeurs et les distracteurs stricts du PDF
    this.appliquerLesValeurs(
      1,
      3,
      5,
      6,
      1,
      '\\dfrac{3}{5}',
      '\\dfrac{23}{18}',
      '\\dfrac{7}{3}',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Nos 10 cas de base
    const cas = [
      { numA: 1, denA: 3, numB: 5, denB: 6 }, // A/B = 2/5
      { numA: 1, denA: 4, numB: 3, denB: 8 }, // A/B = 2/3
      { numA: 2, denA: 3, numB: 4, denB: 9 }, // A/B = 3/2
      { numA: 1, denA: 2, numB: 3, denB: 4 }, // A/B = 2/3
      { numA: 1, denA: 2, numB: 5, denB: 8 }, // A/B = 4/5
      { numA: 2, denA: 3, numB: 5, denB: 6 }, // A/B = 4/5
      { numA: 3, denA: 4, numB: 5, denB: 8 }, // A/B = 6/5
      { numA: 1, denA: 3, numB: 2, denB: 9 }, // A/B = 3/2
      { numA: 2, denA: 5, numB: 3, denB: 10 }, // A/B = 4/3
      { numA: 1, denA: 3, numB: 4, denB: 9 }, // A/B = 3/4
    ]

    let compteur = 0
    do {
      const choix = choice(cas)
      const k = choice([1, 2]) // +1 ou +2 dynamiquement

      // Pré-calculs des fractions utiles pour générer les distracteurs à la volée
      const fracA = new FractionEtendue(choix.numA, choix.denA)
      const fracB = new FractionEtendue(choix.numB, choix.denB)
      const fracDiv = fracA.diviseFraction(fracB)
      const correct = new FractionEtendue(fracDiv.n + k * fracDiv.d, fracDiv.d)

      // Modélisation des fausses pistes (distracteurs)
      const fracProd = fracA.produitFraction(fracB)
      const f1 = new FractionEtendue(fracProd.n + k * fracProd.d, fracProd.d) // A * B + k

      const fracDivBA = fracB.diviseFraction(fracA)
      const f2 = new FractionEtendue(fracDivBA.n + k * fracDivBA.d, fracDivBA.d) // B / A + k

      const f3 = fracDiv // Oubli du "+ k"

      let candidates = [
        f1.texFractionSimplifiee,
        f2.texFractionSimplifiee,
        f3.texFractionSimplifiee,
      ]
      // On élimine les doublons potentiels avec la bonne réponse
      candidates = [...new Set(candidates)].filter(
        (d) => d !== correct.texFractionSimplifiee,
      )

      // Sécurité : si la génération donne moins de 3 distracteurs uniques, on complète
      while (candidates.length < 3) {
        const fauxNum = correct.n + choice([-1, 1, 2])
        const f = new FractionEtendue(fauxNum, correct.d)
        if (
          f.texFractionSimplifiee !== correct.texFractionSimplifiee &&
          !candidates.includes(f.texFractionSimplifiee)
        ) {
          candidates.push(f.texFractionSimplifiee)
        }
      }

      // On envoie tout au constructeur d'énoncé, bien rangé
      this.appliquerLesValeurs(
        choix.numA,
        choix.denA,
        choix.numB,
        choix.denB,
        k,
        candidates[0],
        candidates[1],
        candidates[2],
      )
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
        /Le nombre \$(.+)\$ est égal à :\s*$/,
        (_, expression: string) =>
          this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
