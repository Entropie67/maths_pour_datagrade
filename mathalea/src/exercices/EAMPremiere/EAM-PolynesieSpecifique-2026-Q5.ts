import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'psq05'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11CTFA1A-6', '11LCFA1A-6', '11LSFA1A-6'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une durée à partir d’une vitesse moyenne'
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

const fractionsDistance = new Map([
  [2, 'la moitié'],
  [3, 'le tiers'],
  [4, 'le quart'],
])

/**
 * @author Stéphane Guyon
 */
export default class AutoQ5PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(vitesse: number, diviseur: 2 | 3 | 4): void {
    const distance = vitesse / diviseur
    const duree = 60 / diviseur
    const fractionDistance = fractionsDistance.get(diviseur)

    this.enonce = `Une voiture parcourt une distance de $${distance}$ km à une vitesse moyenne de $${vitesse}\\,\\text{km/h}$.<br>
    La durée du trajet, en minutes, est égale à :`

    this.reponses = [
      `$${duree}$`,
      `$${vitesse}$`,
      `$${vitesse * 2}$`,
      `$${Math.round((distance * vitesse) / 100)}$`,
    ]

    this.correction = `À la vitesse moyenne de $${vitesse}\\,\\text{km/h}$, la voiture parcourt $${vitesse}$ km en $1$ heure, c'est-à-dire en $60$ minutes.<br>
    Ici, $${distance}$ km correspond à ${fractionDistance} de $${vitesse}$ km.<br>
    La durée du trajet est donc ${fractionDistance} de $60$ minutes : $60\\div ${diviseur}=${miseEnEvidence(duree)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(60, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const cas: [number, 2 | 3 | 4][] = [
      [48, 2],
      [60, 2],
      [72, 3],
      [80, 4],
      [90, 3],
      [120, 4],
    ]

    let compteur = 0
    do {
      const [vitesse, diviseur] = choice(cas)
      this.appliquerLesValeurs(vitesse, diviseur)
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
        /La durée du trajet, en minutes, est égale à :\s*$/,
        this.interactif
          ? 'La durée du trajet est de '
          : 'Calculer la durée du trajet, en minutes.',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' minutes.'
  }
}
