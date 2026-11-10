import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'psq06'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Modéliser une évolution répétée'
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ6PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(taux: number, annees: number): void {
    const coefficient = 1 + taux / 100
    const coeffTex = texNombre(coefficient, 2)
    const decimalTex = texNombre(taux / 100, 2)
    const correct = `${coeffTex}^{${annees}}`

    this.enonce = `Une entreprise augmente sa production de $${taux}\\,\\%$ par an.<br>
    Après $${annees}$ ans, la production initiale a été multipliée par :`

    this.reponses = [
      `$${correct}$`,
      `$${texNombre(1 + (annees * taux) / 100, 2)}$`,
      `$${annees}\\times ${coeffTex}$`,
      `$${decimalTex}^{${annees}}$`,
    ]

    this.correction = `Augmenter de $${taux}\\,\\%$ revient à multiplier par $${coeffTex}$.<br>
    Après $${annees}$ années, on multiplie donc par $${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 3)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice([2, 3, 4, 5, 10]), choice([2, 3, 4, 5]))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Après \$(\d+)\$ ans, la production initiale a été multipliée par :\s*$/,
        (_, annees: string) =>
          this.interactif
            ? `Après $${annees}$ ans, la production initiale a été multipliée par `
            : `Déterminer le coefficient par lequel la production initiale est multipliée après $${annees}$ ans.`,
      )
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
