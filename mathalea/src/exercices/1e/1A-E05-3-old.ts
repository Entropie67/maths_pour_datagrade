// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c8af3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c8af3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Calculer le coefficient multiplicateur réciproque (avec des décimaux)'
export const dateDePublication = '28/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproquePOld extends ExerciceQcmA {
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

    // Correction unifiée
    this.correction = `${augmentation ? 'Augmenter' : 'Diminuer'} de $${texNombre(taux, 0)}~\\%$ revient à multiplier par de $1${signe}\\dfrac{${texNombre(taux, 2)}}{100}=${texNombre(coeff, 3)}$.<br>
  Pour retrouver le prix initial, il faut diviser par ce coefficient, c'est-à-dire multiplier par le coefficient multiplicateur réciproque $\\dfrac{1}{${texNombre(coeff, 3)}}$.<br>
    Le coefficient multiplicateur pour retrouver le prix initial est donc $${miseEnEvidence(`\\dfrac{1}{${texNombre(coeff, 3)}}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(true, 35)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const augmentation = choice([true, false])
      const listeTaux = [
        5, 8, 10, 12, 15, 18, 20, 25, 28, 30, 35, 38, 40, 45, 48, 50, 2.5, 3.5,
        7.5, 12.5, 17.5, 22.5, 27.5, 32.5, 37.5, 42.5,
      ]
      const taux = choice(listeTaux)

      this.appliquerLesValeurs(augmentation, taux)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2
  }
}
