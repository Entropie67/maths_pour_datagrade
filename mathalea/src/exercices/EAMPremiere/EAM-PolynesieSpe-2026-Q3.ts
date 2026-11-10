import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'ps263'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Retrouver un effectif total à partir d’un pourcentage'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '31/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ3PolynesieSpe2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(partie: number, pourcentage: number): void {
    const total = (partie * 100) / pourcentage

    this.enonce = `Un entraîneur choisit $${partie}$ joueurs dans une équipe.<br>
    Cela représente $${pourcentage}\\,\\%$ de l'équipe.<br>
    Combien y a-t-il de joueurs dans l'équipe ?`

    this.reponses = [
      `$${total}$`,
      `$${partie + pourcentage}$`,
      `$${partie * (pourcentage / 10)}$`,
      `$${Math.round(partie * (1 + pourcentage / 100))}$`,
    ]

    this.correction = `$${pourcentage}\\,\\%$ de l'équipe représentent $${partie}$ joueurs, donc l'effectif total est $${partie}\\div ${texNombre(pourcentage / 100)}=${miseEnEvidence(total)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(8, 20)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    // `continue` dans un do…while évaluerait la condition sur les réponses du tirage précédent
    // (ou du constructeur) : le tirage dépendrait alors de l'état du générateur au moment de la
    // construction. Avec un while, un tirage écarté en provoque simplement un nouveau.
    while (compteur < 100) {
      const pourcentage = choice([20, 25, 50])
      const total = choice([20, 24, 30, 32, 36, 40, 48, 60])
      const partie = (total * pourcentage) / 100
      if (!Number.isInteger(partie)) continue
      this.appliquerLesValeurs(partie, pourcentage)
      compteur++
      if (aLeBonNombreDePropsDifferentes(this, 4, true)) break
    }
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Combien y a-t-il de joueurs dans l'équipe \?\s*$/,
        this.interactif
          ? 'Il y a '
          : "Calculer le nombre de joueurs de l'équipe.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = " joueurs dans l'équipe."
  }
}
