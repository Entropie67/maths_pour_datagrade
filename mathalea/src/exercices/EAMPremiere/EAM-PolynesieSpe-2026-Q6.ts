import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'ps266'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des puissances de $2$ et de $5$'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ6PolynesieSpe2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    exposantDeux: number,
    exposantCinq: number,
  ): void {
    const exposantCommun = Math.min(exposantDeux, exposantCinq)
    const difference = Math.abs(exposantDeux - exposantCinq)
    const facteur =
      exposantDeux > exposantCinq ? 2 ** difference : 5 ** difference
    const correct =
      difference === 0
        ? `10^{${exposantCommun}}`
        : `${facteur}\\times10^{${exposantCommun}}`

    this.enonce = `Le nombre $2^{${exposantDeux}}\\times5^{${exposantCinq}}$ est égal à :`

    this.reponses = [
      `$${correct}$`,
      `$10^{${exposantDeux + exposantCinq}}$`,
      `$10^{${exposantDeux * exposantCinq}}$`,
      `$${facteur}\\times10^{${exposantDeux + exposantCinq - exposantCommun}}$`,
    ]

    this.correction = `$2^{${exposantDeux}}\\times5^{${exposantCinq}}=${facteur === 1 ? '' : `${facteur}\\times`}2^{${exposantCommun}}\\times5^{${exposantCommun}}=${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(9, 7)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const exposantCommun = choice([4, 5, 6, 7, 8])
      const difference = choice([1, 2, 3])
      const exposantDeux = exposantCommun + choice([0, difference])
      const exposantCinq =
        exposantDeux === exposantCommun
          ? exposantCommun + difference
          : exposantCommun
      this.appliquerLesValeurs(exposantDeux, exposantCinq)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Le nombre \$(.*)\$ est égal à :\s*$/,
        (_, expression: string) =>
          `Écrire $${expression}$ sous la forme $a\\times10^{n}$, où $a$ et $n$ sont des entiers.`,
      )
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
