import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '2102b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Développer avec l'identité remarquable $(a-b)^2$"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7CEns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(k: number): void {
    this.enonce = `La forme développée et réduite de l'expression $(x - ${k})^2$ est :`

    const double = 2 * k
    const carre = k * k

    const correct = `x^2 - ${double}x + ${carre}`

    // Distracteur 1 (Type b) : a^2 + 2ab + b^2 (erreur de signe sur le double produit)
    const d1 = `x^2 + ${double}x + ${carre}`

    // Distracteur 2 (Type c) : a^2 - 2ab - b^2 (erreur de signe sur le carré)
    const d2 = `x^2 - ${double}x - ${carre}`

    // Distracteur 3 (Type d) : a^2 + 2ab - b^2 (erreurs de signe sur les deux termes)
    const d3 = `x^2 + ${double}x - ${carre}`

    this.correction = `On utilise l'identité remarquable $(a-b)^2 = a^2 - 2ab + b^2$ avec $a = x$ et $b = ${k}$.<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `(x - ${k})^2 &= x^2 - 2 \\times x \\times ${k} + ${k}^2\\\\`
    this.correction += `&= ${miseEnEvidence(correct)}`
    this.correction += `\\end{aligned}$`

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]
  }

  versionOriginale: () => void = () => {
    // Énoncé de l'image : (x - 4)^2
    this.appliquerLesValeurs(4)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Génération aléatoire de l'entier k (par exemple entre 2 et 9)
      const k = randint(2, 9)

      this.appliquerLesValeurs(k)
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
