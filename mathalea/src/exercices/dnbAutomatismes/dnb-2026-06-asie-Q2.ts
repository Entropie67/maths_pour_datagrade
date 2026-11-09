import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'a6b32'
export const refs = {
  'fr-fr': ['3AutoL03-3'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Donner la forme développée d'un produit remarquable"
export const dateDePublication = '10/08/2026'

/**
 * DNB Asie juin 2026 - Question 2
 * Forme développée d'un produit remarquable
 * @author Jean-Claude Lhote
 */
export default class AutoQ2Asiebrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.enonce = `Une forme développée de $(${a}x${ecritureAlgebrique(b)})(${a}x${ecritureAlgebrique(-b)})$ est :`
    const result = (a + b) ** 2

    this.reponses = [
      `$${a * a}x^2-${b * b}$`,
      `$${a}x^2-${b * b}$`,
      `$${a * a}x^2+${b * b}$`,
      `$${2 * a}x^2-${Math.abs(2 * b)}$`,
    ]

    this.correction = `$(${a}x${ecritureAlgebrique(b)})(${a}x${ecritureAlgebrique(-b)})=${a}x\\times${a}x+\\cancel{${Math.abs(a * b)}x}-\\cancel{${Math.abs(a * b)}x}-${Math.abs(b)}\\times${Math.abs(b)}=${miseEnEvidence(`${a * a}x^2-${b * b}`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 3)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const a = randint(3, 9)
    const b = randint(3, 9, a) * randint(-1, 1, 0)
    this.appliquerLesValeurs(a, b)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
