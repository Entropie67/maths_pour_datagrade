import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '664a7'
export const refs = {
  'fr-fr': ['1A-E05-3'],
  'fr-ch': ['10CTQCMFA1-14', '10LCQCMFA1-14', '10LSQCMFA1-14', '11CTQCMFA1-9', '11LCQCMFA1-9', '11LSQCMFA1-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Calculer le coefficient multiplicateur réciproque (avec des décimaux)'
export const dateDePublication = '28/12/2025'
export const dateDeModifImportante = '21/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproqueP extends ExerciceQcmACourt {
  // Fraction exacte saisie lorsque la version QCM est désactivée, et sa correction
  private reponseSaisie = ''
  private correctionSaisie = ''

  private appliquerLesValeurs(augmentation: boolean, taux: number): void {
    const signe = augmentation ? '+' : '-'
    const signeMot = augmentation ? 'augmenté' : 'diminué'
    const motContexte = augmentation ? "l'augmentation" : 'la réduction'

    // Calcul du coefficient (1 + taux/100 ou 1 - taux/100)
    const coeff = augmentation ? 1 + taux / 100 : 1 - taux / 100

    this.enonce = `Le prix d'un article a ${signeMot} de $${texNombre(taux, 3)}~\\%$.<br>
    Pour retrouver son prix avant ${motContexte}, il faut multiplier son prix actuel par :`

    // Bonne réponse
    const bonneReponse = `$\\dfrac{1}{${texNombre(coeff, 3)}}$`

    // Mauvaises réponses
    const coeffOppose = augmentation ? 1 - taux / 100 : 1 + taux / 100
    const mauvaiseReponse1 = `$\\dfrac{1}{${texNombre(coeffOppose, 3)}}$`
    const mauvaiseReponse2 = `$${texNombre(coeff, 3)}$`
    const mauvaiseReponse3 = `$\\dfrac{1}{${texNombre(taux / 100, 3)}}$`

    this.reponses = [
      bonneReponse,
      mauvaiseReponse1,
      mauvaiseReponse2,
      mauvaiseReponse3,
    ]

    // Saisie libre : 1 / coeff = puissance / (coeff × puissance), avec puissance = 10 ou 100
    // selon le nombre de décimales de coeff, puis simplification
    let puissance = 1
    while (Math.abs(coeff * puissance - Math.round(coeff * puissance)) > 1e-9)
      puissance *= 10
    const denominateurSaisie = Math.round(coeff * puissance)
    this.reponseSaisie = new FractionEtendue(
      puissance,
      denominateurSaisie,
    ).texFractionSimplifiee

    // Correction unifiée : 1/coeff est mis en évidence (accepté en QCM comme en saisie libre)
    this.correction = `${augmentation ? 'Augmenter' : 'Diminuer'} de $${texNombre(taux, 1)}~\\%$ revient à multiplier par $1${signe}\\dfrac{${texNombre(taux, 2)}}{100}=${texNombre(coeff, 3)}$.<br>
  Pour retrouver le prix initial, il faut diviser par ce coefficient, c'est-à-dire multiplier par le coefficient multiplicateur réciproque $\\dfrac{1}{${texNombre(coeff, 3)}}$.<br>
  Le coefficient multiplicateur pour retrouver le prix initial est donc $${miseEnEvidence(`\\dfrac{1}{${texNombre(coeff, 3)}}`)}$.`
    // En saisie libre, l'écriture fractionnaire est aussi acceptée
    this.correctionSaisie = `${this.correction}<br>
  Ce coefficient peut aussi s'écrire $\\dfrac{1}{${texNombre(coeff, 3)}}=${this.reponseSaisie === `\\dfrac{${puissance}}{${denominateurSaisie}}` ? '' : `\\dfrac{${texNombre(puissance, 0)}}{${texNombre(denominateurSaisie, 0)}}=`}${miseEnEvidence(this.reponseSaisie)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(true, 35)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const augmentation = choice([true, false])
      // Taux entier : hausse de 1 à 99 %, baisse de 1 à 90 %
      const taux = randint(1, augmentation ? 99 : 90)

      this.appliquerLesValeurs(augmentation, taux)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Fonction de comparaison volontairement permissive : elle accepte la fraction
    // (par exemple 20/27) et aussi l'inverse du coefficient décimal (par exemple 1/1,35).
    // Ne pas la restreindre à une fraction irréductible : c'est le rôle de 1A-E05-4.
    this.compareReponseCourte = (saisie, reponse) => {
      const resultat = fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
      if (resultat.isOk) return resultat
      // On accepte aussi l'inverse du coefficient décimal, par exemple 1/1,35
      const fraction = reponse.match(/\\d?frac\{(\d+)\}\{(\d+)\}/)
      const coeff = fraction
        ? Number(fraction[2]) / Number(fraction[1])
        : 1 / Number(reponse)
      const inverseDecimal = fonctionComparaison(
        saisie,
        `\\frac{1}{${Math.round(coeff * 1000) / 1000}}`,
        { expressionNumerique: true },
      )
      return inverseDecimal.isOk ? inverseDecimal : resultat
    }
    this.enonceCourt = () =>
      this.enonce.replace(
        /Pour retrouver son prix avant (.*), il faut multiplier son prix actuel par :\s*$/,
        'Quel coefficient multiplicateur faut-il appliquer à son prix actuel pour retrouver son prix avant $1 ?',
      )
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie

    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction

    this.versionAleatoire()
    this.spacingCorr = 2
  }
}
