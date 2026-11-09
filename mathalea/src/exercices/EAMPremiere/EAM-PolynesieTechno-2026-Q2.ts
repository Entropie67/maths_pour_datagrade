import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'pt6q2'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un coefficient multiplicateur'
export const dateDePublication = '04/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ2PolynesieTechno2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(taux: number): void {
    const coefficient = 1 + taux / 100

    this.enonce = `Pour calculer le prix d'un produit après une hausse de $${taux}\\,\\%$, en une seule opération, il faut multiplier le prix initial par :`

    this.reponses = [
      `$${texNombre(coefficient, 2)}$`,
      `$${texNombre(taux / 100, 2)}$`,
      `$${texNombre(1 - taux / 100, 2)}$`,
      `$${texNombre(1 + (100 - taux) / 100, 2)}$`,
    ]

    this.correction = `Une hausse de $${taux}\\,\\%$ correspond à un coefficient multiplicateur égal à $1+\\dfrac{${taux}}{100}$.<br>
    Donc $1+\\dfrac{${taux}}{100}=${miseEnEvidence(texNombre(coefficient, 2))}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(25)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice([10, 15, 20, 25, 30, 40, 50]))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Pour calculer le prix d'un produit après une hausse de \$([^$]*)\$, en une seule opération, il faut multiplier le prix initial par :\s*$/,
        (_, taux: string) =>
          this.interactif
            ? `Pour calculer le prix d'un produit après une hausse de $${taux}$, en une seule opération, il faut multiplier le prix initial par `
            : `Déterminer le coefficient multiplicateur correspondant à une hausse de $${taux}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
