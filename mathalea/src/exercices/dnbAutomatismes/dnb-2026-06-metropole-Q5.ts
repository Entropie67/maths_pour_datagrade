import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b9893'
export const refs = {
  'fr-fr': ['3AutoL04'],
  'fr-ch': ['PRQST03B-5', 'PRQAL04B-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Vérifier si un nombre est solution d’une équation'
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 5
 * Calculer une probabilité
 * @author Jean-Claude Lhote
 */
export default class AutoQ4Metropole2026 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    this.enonce = `Parmi les propositions suivantes, laquelle est la solution de l'équation $${a}x + ${b} = ${c}$ ?`
    for (const n of [(c - b) / a, (b - c) / a, (c + b) / a, c / b - a]) {
      if (Math.round(n * 100) / 100 !== n) {
        this.reponses = []
        return
      }
    }
    this.reponses = [
      `$${texNombre((c - b) / a, 2)}$`,
      `$${texNombre((b - c) / a, 2)}$`,
      `$${texNombre((c + b) / a, 2)}$`,
      `$${texNombre(c / b - a, 2)}$`,
    ]

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(10, 16, -64)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    do {
      const preFactor = randint(2, 5) + 2
      const a = preFactor * 2 * randint(-1, 1, 0)
      const factor = preFactor - 1
      const b = randint(2, 9) * 2
      const c = b * -factor
      this.appliquerLesValeurs(a, b, c)
    } while (this.reponses.length !== 4)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
