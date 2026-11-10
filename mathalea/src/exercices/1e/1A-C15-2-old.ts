// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2ab24 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ppcm } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '2ab24'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre un problème avec des proportions'
export const dateDePublication = '05/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C19bOld extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    const credit = 1500
    const frac1 = new FractionEtendue(1, 3) // 1/3 du crédit en janvier
    const frac2 = new FractionEtendue(1, 4) // 1/4 de ce qui a été remboursé en janvier
    const fracFevrier = frac1.produitFraction(frac2) // 1/3 × 1/4 = 1/12 du crédit en février
    const totalRembourse = frac1.sommeFraction(fracFevrier) // 1/3 + 1/12 = 4/12 + 1/12 = 5/12
    const reponse = totalRembourse.entierMoinsFraction(1) // 1 - 5/12 = 7/12
    // Mise au même dénominateur avec le ppcm
    const denomCommun = ppcm(frac1.den, fracFevrier.den)
    const frac1Equiv = new FractionEtendue(
      frac1.num * (denomCommun / frac1.den),
      denomCommun,
    )
    const fracFevrierEquiv = new FractionEtendue(
      fracFevrier.num * (denomCommun / fracFevrier.den),
      denomCommun,
    )

    this.enonce = `Une personne doit rembourser un crédit de $${texNombre(credit, 0)}$ en trois mois.<br>
        En janvier, elle rembourse $${frac1.texFraction}$ du crédit et en février, elle rembourse $${frac2.texFraction}$ de ce qu'elle a remboursé en janvier.<br>
        En mars, elle doit rembourser :`

    this.correction = `
       
        En février, elle rembourse $${frac2.texFraction}$ de ce qu'elle a remboursé en janvier.<br>
        Elle rembourse donc $${frac2.texFraction} \\times ${frac1.texFraction} = ${fracFevrier.texFractionSimplifiee}$ du crédit total.<br>
        Au total, en janvier et février, elle aura remboursé : $${frac1.texFraction} + ${fracFevrier.texFraction}=${frac1Equiv.texFraction} + ${fracFevrierEquiv.texFraction} = ${totalRembourse.texFractionSimplifiee}$ du crédit. <br>
        Il lui restera à rembourser en mars : $1 - ${totalRembourse.texFractionSimplifiee} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$ du crédit.`

    this.reponses = [
      `$${reponse.texFractionSimplifiee}\\text{ du crédit.}$`,
      '$\\dfrac{1}{2}\\text{ du crédit.}$',
      '$\\dfrac{5}{12}\\text{ du crédit.}$',
      '$\\dfrac{1}{4}\\text{ du crédit.}$',
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      // Liste filtrée pour garantir que la réponse soit entre 0 et 1
      // Condition : frac1 * (1 + frac2) < 1
      const listeFractions = [
        [1, 5, 1, 4], // 1/5 * (1 + 1/4) = 1/5 * 5/4 = 1/4 < 1 ✓
        [1, 5, 1, 3], // 1/5 * (1 + 1/3) = 1/5 * 4/3 = 4/15 < 1 ✓
        [1, 5, 2, 3], // 1/5 * (1 + 2/3) = 1/5 * 5/3 = 1/3 < 1 ✓
        [2, 5, 1, 4], // 2/5 * (1 + 1/4) = 2/5 * 5/4 = 1/2 < 1 ✓
        [2, 5, 1, 6], // 2/5 * (1 + 1/6) = 2/5 * 7/6 = 7/15 < 1 ✓
        [3, 5, 1, 6], // 3/5 * (1 + 1/6) = 3/5 * 7/6 = 7/10 < 1 ✓
        [3, 5, 1, 8], // 3/5 * (1 + 1/8) = 3/5 * 9/8 = 27/40 < 1 ✓
        [4, 5, 1, 10], // 4/5 * (1 + 1/10) = 4/5 * 11/10 = 22/25 < 1 ✓
        [1, 3, 1, 4], // 1/3 * (1 + 1/4) = 1/3 * 5/4 = 5/12 < 1 ✓
        [1, 4, 1, 3], // 1/4 * (1 + 1/3) = 1/4 * 4/3 = 1/3 < 1 ✓
        [2, 3, 1, 6], // 2/3 * (1 + 1/6) = 2/3 * 7/6 = 7/9 < 1 ✓
        [2, 3, 1, 8], // 2/3 * (1 + 1/8) = 2/3 * 9/8 = 3/4 < 1 ✓
        [3, 4, 1, 6], // 3/4 * (1 + 1/6) = 3/4 * 7/6 = 7/8 < 1 ✓
        [1, 6, 1, 4], // 1/6 * (1 + 1/4) = 1/6 * 5/4 = 5/24 < 1 ✓
        [1, 6, 1, 3], // 1/6 * (1 + 1/3) = 1/6 * 4/3 = 2/9 < 1 ✓
        [5, 6, 1, 10], // 5/6 * (1 + 1/10) = 5/6 * 11/10 = 11/12 < 1 ✓
        [2, 7, 1, 4], // 2/7 * (1 + 1/4) = 2/7 * 5/4 = 5/14 < 1 ✓
        [3, 7, 1, 4], // 3/7 * (1 + 1/4) = 3/7 * 5/4 = 15/28 < 1 ✓
        [4, 7, 1, 6], // 4/7 * (1 + 1/6) = 4/7 * 7/6 = 2/3 < 1 ✓
        [1, 7, 1, 3], // 1/7 * (1 + 1/3) = 1/7 * 4/3 = 4/21 < 1 ✓
        [1, 8, 1, 3], // 1/8 * (1 + 1/3) = 1/8 * 4/3 = 1/6 < 1 ✓
        [3, 8, 1, 4], // 3/8 * (1 + 1/4) = 3/8 * 5/4 = 15/32 < 1 ✓
        [5, 8, 1, 6], // 5/8 * (1 + 1/6) = 5/8 * 7/6 = 35/48 < 1 ✓
        [7, 8, 1, 10], // 7/8 * (1 + 1/10) = 7/8 * 11/10 = 77/80 < 1 ✓
        [2, 9, 1, 4], // 2/9 * (1 + 1/4) = 2/9 * 5/4 = 5/18 < 1 ✓
        [4, 9, 1, 5], // 4/9 * (1 + 1/5) = 4/9 * 6/5 = 8/15 < 1 ✓
        [5, 9, 1, 6], // 5/9 * (1 + 1/6) = 5/9 * 7/6 = 35/54 < 1 ✓
        [7, 9, 1, 8], // 7/9 * (1 + 1/8) = 7/9 * 9/8 = 7/8 < 1 ✓
        [3, 10, 1, 4], // 3/10 * (1 + 1/4) = 3/10 * 5/4 = 3/8 < 1 ✓
        [7, 10, 1, 4], // 7/10 * (1 + 1/4) = 7/10 * 5/4 = 7/8 < 1 ✓
        [8, 10, 1, 9], // 8/10 * (1 + 1/9) = 4/5 * 10/9 = 8/9 < 1 ✓
      ]

      const fractions = choice(listeFractions)
      const frac1 = new FractionEtendue(fractions[0], fractions[1])
      const frac2 = new FractionEtendue(fractions[2], fractions[3])
      const fracFevrier = frac1.produitFraction(frac2)
      const totalRembourse = frac1.sommeFraction(fracFevrier)
      const reponse = totalRembourse.entierMoinsFraction(1)
      const credit = randint(12, 25) * 100
      // Mise au même dénominateur avec le ppcm
      const denomCommun = ppcm(frac1.den, fracFevrier.den)
      const frac1Equiv = new FractionEtendue(
        frac1.num * (denomCommun / frac1.den),
        denomCommun,
      )
      const fracFevrierEquiv = new FractionEtendue(
        fracFevrier.num * (denomCommun / fracFevrier.den),
        denomCommun,
      )
      this.enonce = `Une personne doit rembourser un crédit de $${texNombre(credit, 0)}$ en trois mois.<br>
        En janvier, elle rembourse $${frac1.texFraction}$ du crédit et en février elle rembourse $${frac2.texFraction}$ de ce qu'elle a remboursé en janvier.<br>
        En mars elle doit rembourser :`

      this.correction = `
       
      En février, elle rembourse $${frac2.texFraction}$ de ce qu'elle a remboursé en janvier.<br>
      Elle rembourse donc $${frac2.texFraction} \\times ${frac1.texFraction} = ${fracFevrier.texFractionSimplifiee}$ du crédit total.<br>
      Au total, en janvier et février, elle aura remboursé :  $${frac1.texFraction} + ${fracFevrier.texFraction}=${frac1Equiv.texFraction} + ${fracFevrierEquiv.texFraction} = ${totalRembourse.texFractionSimplifiee}$ du crédit. <br>
      Il lui restera à rembourser en mars : $1 - ${totalRembourse.texFractionSimplifiee} = ${miseEnEvidence(reponse.texFractionSimplifiee)}$ du crédit.`

      // Génération de réponses erronées plausibles
      const fausseReponse1 = frac2
      const fausseReponse2 = frac1.sommeFraction(frac2)
      const fausseReponse3 = fracFevrier

      this.reponses = [
        `$${reponse.texFractionSimplifiee}\\text{ du crédit.}$`,
        `$${fausseReponse1.texFractionSimplifiee}\\text{ du crédit.}$`,
        `$${fausseReponse2.texFractionSimplifiee}\\text{ du crédit.}$`,
        `$${fausseReponse3.texFractionSimplifiee}\\text{ du crédit.}$`,
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
    if (compteur >= 100) {
      console.warn(
        '100 tentatives de génération aléatoire sans succès pour obtenir 4 réponses différentes. Vérifiez la liste des fractions ou les conditions de génération.',
      )
    }
  }

  // Ici il n'y a rien à faire, on appelle juste la version originale pour un exercice statique
  constructor() {
    super()

    this.versionOriginale() // Changé de versionAleatoire() à versionOriginale()
    this.spacing = 1.5
    this.spacingCorr = 2.5
    this.optionsDeComparaison = { texteSansCasse: true } // Pour le test qcm_exercice, sinon, il va croire que c'est des fractions ou unite...
  }
}
