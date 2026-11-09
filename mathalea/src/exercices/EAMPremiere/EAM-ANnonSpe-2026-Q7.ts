import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '29676'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Appliquer un pourcentage'
export const dateDePublication = '05/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7ANns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    total: number,
    pourcentage: number,
    dist1: number,
    dist2: number,
    dist3: number,
  ): void {
    const sol = (total * pourcentage) / 100
    const coeff = pourcentage / 100 // Ex: 0.2, 0.3 ou 0.4

    this.enonce = `Dans une boîte de $${total}$ chocolats, $${pourcentage}\\,\\%$ sont des chocolats au lait. <br>
    Combien y a-t-il de chocolats au lait dans la boîte ?`

    // Modification de la formulation de la correction selon votre demande
    this.correction = `Calculer $${pourcentage}\\,\\%$ de $${total}$ revient à multiplier par $${texNombre(coeff, 1)}$.<br>`
    this.correction += `$${texNombre(coeff, 1)} \\times ${total} = ${sol}$<br>`
    this.correction += `Il y a donc $${miseEnEvidence(texNombre(sol, 0))}$ chocolats au lait dans la boîte.`

    this.reponses = [
      `$${texNombre(sol, 0)}$`,
      `$${texNombre(dist1, 0)}$`,
      `$${texNombre(dist2, 0)}$`,
      `$${texNombre(dist3, 0)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 60 chocolats, 40 %  => 24
    this.appliquerLesValeurs(60, 40, 20, 25, 40)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Mix dynamique des pourcentages (20, 30, 40) et des totaux (30, 40, 60, 70, 80)
      const pourcentage = choice([20, 30, 40])
      const total = choice([30, 40, 60, 70, 80])

      const sol = (total * pourcentage) / 100

      // Génération des distracteurs adaptés
      const dist1 = pourcentage
      const dist2 = total - sol
      const dist3 = sol + choice([-2, -1, 1, 2, 4, 5])

      this.appliquerLesValeurs(total, pourcentage, dist1, dist2, dist3)
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
        /Combien y a-t-il de chocolats au lait dans la boîte \?\s*$/,
        this.interactif
          ? 'Il y a '
          : 'Calculer le nombre de chocolats au lait dans la boîte.',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' chocolats au lait dans la boîte.'
  }
}
