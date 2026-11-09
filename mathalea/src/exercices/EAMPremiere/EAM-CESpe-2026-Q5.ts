import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'b8e36'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une expression avec une égalité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5CEs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(n: number, k: number): void {
    const expr = `(x^{${n}} - ${k})^2`
    this.enonce = `La forme développée et réduite de l'expression $${expr}$ est :`

    const term1 = `x^{${2 * n}}`
    const term2 = `${2 * k}x^{${n}}`
    const term3 = `${k * k}`

    // Résultat correct : a^2 - 2ab + b^2
    const correct = `${term1} - ${term2} + ${term3}`

    // Distracteur 1 (Type a) : a^2 - b^2 (oubli du double produit)
    const d1 = `${term1} - ${term3}`

    // Distracteur 2 (Type c) : erreur sur l'exposant du premier terme (2n - 1 au lieu de 2n)
    const d2 = `x^{${2 * n - 1}} - ${term2} + ${term3}`

    // Distracteur 3 (Type d) : a^2 + 2ab - b^2 (erreurs de signes sur les 2e et 3e termes)
    const d3 = `${term1} + ${term2} - ${term3}`

    this.correction = `On utilise l'identité remarquable $(a-b)^2 = a^2 - 2ab + b^2$ avec $a = x^{${n}}$ et $b = ${k}$.<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `${expr} &= (x^{${n}})^2 - 2 \\times x^{${n}} \\times ${k} + ${k}^2\\\\`
    this.correction += `&= ${miseEnEvidence(correct)}`
    this.correction += `\\end{aligned}$`

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
  }

  versionOriginale: () => void = () => {
    // Énoncé : (x^3 - 1)^2
    this.appliquerLesValeurs(3, 1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const n = choice([3, 4, 5])
      const k = randint(1, 5)

      this.appliquerLesValeurs(n, k)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^La forme développée et réduite de l'expression \$(.+)\$ est :\s*$/,
        (_, expression: string) => `Développer et réduire $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        expressionsForcementReduites: true,
      })
  }
}
