import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'pt6q6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer le carré d’une somme'
export const dateDePublication = '04/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ6PolynesieTechno2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, b: number): void {
    const expression = `(${rienSi1(a)}x+${b})^2`
    const correct = `${a ** 2}x^2+${2 * a * b}x+${b ** 2}`

    this.enonce = `La forme développée et réduite de l'expression $${expression}$ est :`

    this.reponses = [
      `$${correct}$`,
      `$${a}x^2+${b ** 2}$`,
      `$${a ** 2}x^2+${b ** 2}$`,
      `$${a}x^2+${2 * a * b}x+${b ** 2}$`,
    ]

    this.correction = `On sait que, pour tous réels $a$ et $b$, $(a+b)^2=a^2+2ab+b^2$.<br>
    Donc $${expression}=(${rienSi1(a)}x)^2+2\\times ${rienSi1(a)}x\\times ${b}+${b}^2=${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 3)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const a = choice([2, 3, 4, 5, 6, 7])
      const b = choice([2, 3, 4, 5, 6].filter((valeur) => valeur !== a))
      this.appliquerLesValeurs(a, b)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^La forme développée et réduite de l'expression \$(.*)\$ est :\s*$/,
        (_, expression: string) => `Développer et réduire $${expression}$.`,
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        expressionsForcementReduites: true,
      })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
