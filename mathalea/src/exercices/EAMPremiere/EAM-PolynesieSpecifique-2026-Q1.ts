import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ppcm } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'psq01'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ1PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    n: number,
    k: number,
    m: number,
    u: number,
  ): void {
    const facteur1 = new FractionEtendue(1, n)
    const facteur2 = new FractionEtendue(k, m)
    const termeSoustrait = new FractionEtendue(u, m)
    const produitNonSimplifie = new FractionEtendue(k, n * m)
    const produit = produitNonSimplifie.simplifie()
    const facteurCommunProduit = Math.abs(k / produit.num)
    const correct = new FractionEtendue(k - u * n, n * m).simplifie()
    const dist1 = new FractionEtendue(k - u, m).simplifie()
    const dist2 = new FractionEtendue(k - u, n * m).simplifie()
    const dist3 = new FractionEtendue(k - u * n, m).simplifie()

    this.enonce = `Le nombre $${facteur1.texFractionSimplifiee}\\times ${facteur2.texFractionSimplifiee}-${termeSoustrait.texFractionSimplifiee}$ est égal à :`

    this.reponses = [
      `$${correct.texFractionSimplifiee}$`,
      `$${dist1.texFractionSimplifiee}$`,
      `$${dist2.texFractionSimplifiee}$`,
      `$${dist3.texFractionSimplifiee}$`,
    ]

    const etapesCalcul = [
      `${facteur1.texFractionSimplifiee}\\times ${facteur2.texFractionSimplifiee}-${termeSoustrait.texFractionSimplifiee}`,
      `\\dfrac{1\\times ${k}}{${n}\\times ${m}}-${termeSoustrait.texFractionSimplifiee}`,
      `${produitNonSimplifie.texFractionSimplifiee}-${termeSoustrait.texFractionSimplifiee}`,
    ]
    const fractionNonSimplifiee = (numerateur: number, denominateur: number) =>
      numerateur < 0
        ? `-\\dfrac{${Math.abs(numerateur)}}{${denominateur}}`
        : `\\dfrac{${numerateur}}{${denominateur}}`

    if (
      produit.texFractionSimplifiee !==
      produitNonSimplifie.texFractionSimplifiee
    ) {
      etapesCalcul.push(
        `\\dfrac{${facteurCommunProduit}\\times ${produit.num}}{${facteurCommunProduit}\\times ${produit.den}}-${termeSoustrait.texFractionSimplifiee}`,
        `${produit.texFractionSimplifiee}-${termeSoustrait.texFractionSimplifiee}`,
      )
    }

    const termeSoustraitSimplifie = termeSoustrait.simplifie()
    let numerateurDifference: number
    let denominateurDifference: number
    if (produit.den === termeSoustraitSimplifie.den) {
      numerateurDifference = produit.num - termeSoustraitSimplifie.num
      denominateurDifference = produit.den
      etapesCalcul.push(
        `\\dfrac{${produit.num}-${termeSoustraitSimplifie.num}}{${produit.den}}`,
      )
    } else {
      const denominateurCommun = ppcm(produit.den, termeSoustraitSimplifie.den)
      const numerateurProduit = produit.num * (denominateurCommun / produit.den)
      const numerateurSoustrait =
        termeSoustraitSimplifie.num *
        (denominateurCommun / termeSoustraitSimplifie.den)
      numerateurDifference = numerateurProduit - numerateurSoustrait
      denominateurDifference = denominateurCommun
      etapesCalcul.push(
        `\\dfrac{${numerateurProduit}}{${denominateurCommun}}-\\dfrac{${numerateurSoustrait}}{${denominateurCommun}}`,
        `\\dfrac{${numerateurProduit}-${numerateurSoustrait}}{${denominateurCommun}}`,
      )
    }

    const difference = new FractionEtendue(
      numerateurDifference,
      denominateurDifference,
    )
    if (difference.num !== correct.num || difference.den !== correct.den) {
      etapesCalcul.push(
        fractionNonSimplifiee(numerateurDifference, denominateurDifference),
      )
    }

    etapesCalcul.push(miseEnEvidence(correct.texFractionSimplifiee))

    const lignesCalcul = [
      `${etapesCalcul[0]}&=${etapesCalcul[1]}`,
      ...etapesCalcul.slice(2).map((etape) => `&=${etape}`),
    ]

    this.correction = `$\\begin{aligned}${lignesCalcul.join('\\\\')}\\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 6, 5, 1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const cas: [number, number, number, number][] = [
      [2, 5, 3, 1],
      [3, 4, 5, 1],
      [4, 6, 7, 1],
      [5, 8, 3, 1],
      [3, 7, 4, 2],
    ]

    let compteur = 0
    do {
      const [n, k, m, u] = choice(cas)
      this.appliquerLesValeurs(n, k, m, u)
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
