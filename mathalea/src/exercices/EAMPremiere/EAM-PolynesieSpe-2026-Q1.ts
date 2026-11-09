import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'ps261'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un prix après augmentation'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ1PolynesieSpe2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(prixInitial: number, taux: number): void {
    const augmentation = (prixInitial * taux) / 100
    const prixFinal = prixInitial + augmentation

    this.enonce = `Un article coûte $${texPrix(prixInitial)}\\text{ €}$ et subit une augmentation de $${taux}\\,\\%$.<br>
    Combien coûte-t-il après cette augmentation ?`

    this.reponses = [
      `$${texPrix(prixFinal)}\\text{ €}$`,
      `$${texNombre(prixInitial + taux / 100, 2)}\\text{ €}$`,
      `$${texPrix(augmentation)}\\text{ €}$`,
      `$${texPrix(prixInitial + taux)}\\text{ €}$`,
    ]

    this.correction = `L'augmentation est de $${texNombre(taux / 100, 2)}\\times ${texPrix(prixInitial)}=${texPrix(augmentation)}\\text{ €}$.<br>
    Le prix final est donc $${texPrix(prixInitial)}+${texPrix(augmentation)}=${miseEnEvidence(`${texPrix(prixFinal)}\\text{ €}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(40, 30)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const prixInitial = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200])
      const taux = choice([10, 20, 25, 30, 40, 50])
      this.appliquerLesValeurs(prixInitial, taux)
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
        /Combien coûte-t-il après cette augmentation \?\s*$/,
        this.interactif
          ? 'Après cette augmentation, il coûte '
          : 'Calculer son prix après cette augmentation.',
      )
    // La bonne réponse du QCM est de la forme « $156\text{ €}$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/\\text\{ €\}\$$/, '')
        .replace(/^\$/, '')
        .replace(/\\,/g, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' €.'
  }
}
