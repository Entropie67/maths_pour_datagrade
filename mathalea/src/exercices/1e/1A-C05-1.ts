import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '12/10/2025'
export const uuid = 'da442'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C05-1', '2A-N5-1'],
  'fr-ch': ['10CTQCMFA1-1', '10LCQCMFA1-1', '10LSQCMFA1-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer un ordre de grandeur du pourcentage d’un nombre'
export default class auto1AC5 extends ExerciceQcmA {
  private appliquerLesValeurs(
    pourcentageReel: number,
    nombreReel: number,
    reponsesPersonnalisees?: number[],
  ): void {
    // Arrondir le pourcentage à la dizaine la plus proche
    const pourcentageArrondi = Math.round(pourcentageReel / 10) * 10

    // Arrondir le nombre selon sa valeur
    let nombreArrondi: number
    if (nombreReel < 1000) {
      nombreArrondi = Math.round(nombreReel / 100) * 100
    } else if (nombreReel < 10000) {
      nombreArrondi = Math.round(nombreReel / 1000) * 1000
    } else {
      nombreArrondi = Math.round(nombreReel / 10000) * 10000
    }

    // Calcul de la bonne réponse (ordre de grandeur)
    const bonneReponse =
      nombreReel < 1000
        ? (pourcentageArrondi * nombreArrondi) / 100
        : (pourcentageArrondi * nombreArrondi) / 100

    // Énoncé
    this.enonce = `Parmi les valeurs proposées, la valeur la plus proche de $${pourcentageReel}\\,\\%$ de $${texNombre(nombreReel)}$ est :`

    // Correction
    this.correction = `$${pourcentageReel}\\,\\%$ est proche de $${pourcentageArrondi}\\,\\%$ et $${texNombre(nombreReel)}$ est proche de $${texNombre(nombreArrondi)}$.<br>
      Ainsi, le calcul de $${pourcentageReel}\\,\\%$ de $${texNombre(nombreReel)}$ est proche de $${pourcentageArrondi}\\,\\%$ de $${texNombre(nombreArrondi)}$`
    this.correction +=
      pourcentageArrondi === 50
        ? `, soit la moitié de $${texNombre(nombreArrondi)}$, soit $${miseEnEvidence(texNombre(bonneReponse))}$.`
        : `.<br>Et $${pourcentageArrondi}\\,\\%$ de $${texNombre(nombreArrondi)}=\\dfrac{${pourcentageArrondi}}{100}\\times${texNombre(nombreArrondi)}=${pourcentageArrondi}\\times\\dfrac{${texNombre(nombreArrondi)}}{100}=${pourcentageArrondi}\\times${texNombre(nombreArrondi / 100)}=${miseEnEvidence(texNombre(bonneReponse))}$.`

    // Réponses
    if (reponsesPersonnalisees) {
      this.reponses = reponsesPersonnalisees.map((r) => `$${texNombre(r)}$`)
    } else {
      let fausseReponse1: number
      let fausseReponse2: number
      let fausseReponse3: number

      // Pour les valeurs dans la centaine, arrondir les distracteurs
      if (nombreReel < 1000) {
        fausseReponse1 = Math.round(bonneReponse / 10) * 100 // Arrondi à la dizaine (ex: 32 → 30)
        fausseReponse2 = Math.round(bonneReponse / 2 / 100) * 100 // Arrondi à la centaine (ex: 160 → 200)
        fausseReponse3 = Math.round(bonneReponse / 4 / 10) * 10 // Arrondi à la dizaine (ex: 80 → 80)
      } else {
        // Pour les autres valeurs, garder les distracteurs tels quels
        fausseReponse1 = bonneReponse / 10
        fausseReponse2 = Math.round(bonneReponse / 2000) * 1000
        fausseReponse3 =
          Math.round(pourcentageReel / 10) * 10 === 50
            ? Math.round((nombreReel - bonneReponse) / 2000) * 3000
            : Math.round((nombreReel - bonneReponse) / 1000) * 1000
      }

      this.reponses = [
        `$${texNombre(bonneReponse)}$`,
        `$${texNombre(fausseReponse1)}$`,
        `$${texNombre(fausseReponse2)}$`,
        `$${texNombre(Math.round(fausseReponse3))}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(39, 4926, [2000, 200, 4000, 400])
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      // Génération du pourcentage (8, 9, 11, 12, 18, 19, 21, 22, etc.)
      const dizaine = randint(0, 8) * 10
      const unite = dizaine === 0 ? 9 : choice([1, 9])
      const pourcentageReel = dizaine + unite

      // Génération du nombre selon différentes valeurs
      const valeurs = choice([
        'centaines',
        'milliers',
        'dizainesMilliers',
        'centainesMilliers',
      ])

      let nombreReel: number
      switch (valeurs) {
        case 'centaines':
          nombreReel = randint(4, 9) * 100 + randint(-19, 19, 0)
          break
        case 'milliers':
          nombreReel = randint(4, 9) * 1000 + randint(-199, 199, 0)
          break
        case 'dizainesMilliers':
          nombreReel = randint(4, 9) * 10000 + randint(-2000, 2000, 0)
          break
        case 'centainesMilliers':
        default:
          nombreReel = 100000 + randint(-5000, 5000, 0)
          break
      }

      this.appliquerLesValeurs(pourcentageReel, nombreReel)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
