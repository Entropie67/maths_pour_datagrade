import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'cdd0a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, b: number, isPlus: boolean): void {
    const signe = isPlus ? '+' : '-'
    this.enonce = `La forme développée et réduite de l'expression $(${a}x ${signe} ${b})^2$ est :`

    const aCarre = a * a
    const doubleProduit = 2 * a * b
    const bCarre = b * b

    // Expression correcte
    const correct = `${aCarre}x^2 ${signe} ${doubleProduit}x + ${bCarre}`

    // Distracteur 1 : Oubli du double produit (a^2*x^2 +/- b^2)
    const signeDist1 = isPlus ? '+' : '-'
    const dist1 = `${aCarre}x^2 ${signeDist1} ${bCarre}`

    // Distracteur 2 : Oubli de mettre le 'a' au carré (a*x^2 +/- 2ab*x + b^2)
    const dist2 = `${a}x^2 ${signe} ${doubleProduit}x + ${bCarre}`

    // Distracteur 3 : Erreur globale de puissance et distribution (2a*x +/- b^2)
    const dist3 = `${2 * a}x ${signe} ${bCarre}`

    // Rédaction de la correction adaptative
    const identite = isPlus
      ? '(a+b)^2 = a^2 + 2ab + b^2'
      : '(a-b)^2 = a^2 - 2ab + b^2'
    this.correction = `On utilise l'identité remarquable $${identite}$ avec $a = ${a}x$ et $b = ${b}$.<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `(${a}x ${signe} ${b})^2 &= (${a}x)^2 ${signe} 2 \\times ${a}x \\times ${b} + ${b}^2\\\\`
    this.correction += `&= ${miseEnEvidence(correct)}`
    this.correction += `\\end{aligned}$`

    this.reponses = [`$${correct}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image : (3x - 2)^2
    this.appliquerLesValeurs(3, 2, false)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // 'a' est choisi entre 2 et 9 pour qu'il soit toujours différent de 0 (et de 1)
      const a = randint(2, 9)
      const b = randint(1, 9)
      const isPlus = choice([true, false])

      this.appliquerLesValeurs(a, b, isPlus)
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
