import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '2c1b0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer avec une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5ANns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, isPlus: boolean): void {
    const signe = isPlus ? '+' : '-'
    const aCarr = a * a
    const deuxA = 2 * a

    this.enonce = `La forme développée et réduite de l'expression $(x ${signe} ${a})^2$ est :`

    const idRemarquable = isPlus
      ? '(a+b)^2 = a^2 + 2ab + b^2'
      : '(a-b)^2 = a^2 - 2ab + b^2'

    this.correction = `On utilise l'identité remarquable $${idRemarquable}$ avec $a=x$ et $b=${a}$ :<br>`
    this.correction += `$\\begin{aligned}
    (x ${signe} ${a})^2 &= x^2 ${signe} 2 \\times x \\times ${a} + ${a}^2 \\\\
    &= ${miseEnEvidence(`x^2 ${signe} ${deuxA}x + ${aCarr}`)}
    \\end{aligned}$`

    // La bonne réponse en premier, suivie des distracteurs calqués sur l'image
    const repCorrecte = `$x^2 ${signe} ${deuxA}x + ${aCarr}$`
    const dist1 = `$2x ${signe} ${deuxA}$` // Erreur : on multiplie par 2 au lieu de mettre au carré -> 2(x+a)
    const dist2 = `$x^2 + ${aCarr}$` // Erreur : on oublie le double produit
    const dist3 = `$x^2 - ${aCarr}$` // Erreur : confusion avec la différence de deux carrés

    this.reponses = [repCorrecte, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : (x + 2)²
    this.appliquerLesValeurs(2, true)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const a = randint(1, 10)
      const isPlus = choice([true, false]) // Alterne entre (x+a)² et (x-a)²

      this.appliquerLesValeurs(a, isPlus)
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
