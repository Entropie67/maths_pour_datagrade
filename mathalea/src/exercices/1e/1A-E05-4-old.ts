// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f6113 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'f6113'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Calculer le coefficient multiplicateur réciproque (avec des fractions)'
export const dateDePublication = '28/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproquedOld extends ExerciceQcmA {
  private appliquerLesValeurs(augmentation: boolean, taux: number): void {
    const signe = augmentation ? '+' : '-'
    const signeMot = augmentation ? 'augmenté' : 'diminué'
    const motContexte = augmentation ? "l'augmentation" : 'la réduction'

    // Calcul du coefficient en décimal (1 + taux/100 ou 1 - taux/100)
    const coeffDecimal = augmentation ? 1 + taux / 100 : 1 - taux / 100

    // Calcul du coefficient en fraction
    // Par exemple : 1 + 15/100 = 115/100 = 23/20
    const coeffNum = augmentation ? 100 + taux : 100 - taux
    const coeffDen = 100
    const coeff = new FractionEtendue(coeffNum, coeffDen)

    // Inverse du coefficient (bonne réponse)
    const inverse = new FractionEtendue(coeffDen, coeffNum)
    const bonneReponse = `$${inverse.texFractionSimplifiee}$`

    // Mauvaise réponse 1 : inverse avec le signe opposé
    const coeffOppose = augmentation ? 100 - taux : 100 + taux
    const inverseOppose = new FractionEtendue(100, coeffOppose)
    const mauvaiseReponse1 = `$${inverseOppose.texFractionSimplifiee}$`

    // Mauvaise réponse 2 : le coefficient lui-même (sans l'inverse)
    const mauvaiseReponse2 = `$${coeff.texFractionSimplifiee}$`

    // Mauvaise réponse 3 : inverse du taux seul
    const inverseTaux = new FractionEtendue(100, taux)
    const mauvaiseReponse3 = `$${inverseTaux.texFractionSimplifiee}$`

    this.enonce = `Le prix d'un article a ${signeMot} de $${texNombre(taux, 0)}\\,\\%$.<br>
    Pour retrouver son prix avant ${motContexte}, il faut multiplier son prix actuel par :`

    this.reponses = [
      bonneReponse,
      mauvaiseReponse1,
      mauvaiseReponse2,
      mauvaiseReponse3,
    ]
    // Correction unifiée avec coefficient décimal puis simplification
    this.correction = `${augmentation ? 'Augmenter' : 'Diminuer'} de $${texNombre(taux, 0)}~\\%$ revient à multiplier par $1${signe}\\dfrac{${texNombre(taux, 2)}}{100}=${texNombre(coeff, 3)}$.<br>
    Pour retrouver le prix initial, il faut diviser par ce coefficient, c'est-à-dire multiplier par le coefficient multiplicateur réciproque $\\dfrac{1}{${texNombre(coeffDecimal, 2)}}$.<br>
    En multipliant par $100$ le numérateur et le dénominateur, on a $\\dfrac{1}{${texNombre(coeffDecimal, 2)}}=\\dfrac{${coeffDen}}{${coeffNum}}$, puis en simplifiant par $5$, on obtient  $\\dfrac{${coeffDen}}{${coeffNum}}=${inverse.texFractionSimplifiee}$.<br>
    Le coefficient multiplicateur pour retrouver le prix initial est donc $${miseEnEvidence(inverse.texFractionSimplifiee)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(true, 15)
  }

  versionAleatoire: () => void = () => {
    const augmentation = choice([true, false])
    const listeTaux = [5, 15, 35, 45, 55, 65, 85, 95]
    const taux = choice(listeTaux)

    this.appliquerLesValeurs(augmentation, taux)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2
  }
}
