import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '6eff5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un pourcentage de remise'
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ1AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(prixAvant: number, prixApres: number): void {
    const sol = ((prixAvant - prixApres) / prixAvant) * 100
    const dist1 = prixApres / prixAvant
    const dist2 = prixApres // ne pas prendre un prix Apres = à la remise
    const dist3 = (prixAvant - prixApres) / prixAvant
    const remise = prixAvant - prixApres
    const fraction = new FractionEtendue(remise, prixAvant)
    this.enonce = `Un objet coûtait $${texPrix(prixAvant)}\\text{ €}$.<br>
    Après une remise, il coûte $${texPrix(prixApres)}\\text{ €}$.<br>
    Quel était le pourcentage de cette remise ?`
    this.correction = `La remise est de $${remise}$ €. Elle s'applique sur le prix initial de $${texPrix(prixAvant)}\\text{ €}$.<br>
    $\\dfrac{\\text{remise}}{\\text{prix initial}}=\\dfrac{${texNombre(remise, 0)}}{${texNombre(prixAvant, 0)}}=${fraction.texFractionSimplifiee}=${texNombre(sol / 100, 2)}=${texNombre(sol, 0)}\\,\\%$.<br>
    La remise est donc de $${miseEnEvidence(texNombre(sol, 0) + '\\,\\%')}$.`

    this.reponses = [
      `$${texNombre(sol, 2)}\\,\\%$`,
      `$${texNombre(dist1, 2)}\\,\\%$`,
      `$${texNombre(dist2, 2)}\\,\\%$`,
      `$${texNombre(dist3, 2)}\\,\\%$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(100, 80)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const prixAvant = choice([
        100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
      ])
      const pourcentageRemise = choice([10, 20, 30, 40])
      const prixApres = Math.round(
        (prixAvant * (100 - pourcentageRemise)) / 100,
      )
      this.appliquerLesValeurs(prixAvant, prixApres)
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
        /Quel était le pourcentage de cette remise \?\s*$/,
        this.interactif
          ? 'Le pourcentage de cette remise était de '
          : 'Calculer le pourcentage de cette remise.',
      )
    // La bonne réponse du QCM est de la forme « $20\\,\\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/\\,\\%/, '')
        .replace(/\$/g, '')
        .replace(/\\,/g, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
