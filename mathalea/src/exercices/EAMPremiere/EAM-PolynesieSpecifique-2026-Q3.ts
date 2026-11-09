import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'psq03'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ3PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, b: number): void {
    const facteurMoins = `(${a}x${ecritureAlgebrique(-b)})`
    const facteurPlus = `(${a}x${ecritureAlgebrique(b)})`
    const correct = `${a * a}x^2-${b * b}`
    const dist1 = `${a}x^2-${b * b}`
    const dist2 = `${a}x^2-${a * b}`
    const dist3 = `${a * a}x^2${ecritureAlgebrique(-2 * a * b)}x+${b * b}`

    this.enonce = `La forme développée et réduite de l'expression $${facteurMoins}${facteurPlus}$ est :`

    this.reponses = [`$${correct}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]

    this.correction = `On sait que pour tous réels $a$ et $b$, $(a-b)(a+b)=a^2-b^2$.<br>
    $\\begin{aligned}
    ${facteurMoins}${facteurPlus}&=(${a}x)^2-${b}^2\\\\
    &=${a * a}x^2-${b * b}\\\\
    &=${miseEnEvidence(correct)}
    \\end{aligned}$`
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
      const a = choice([2, 3, 4, 5])
      const b = choice([1, 2, 3, 4, 5], [a])
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
