import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c9893'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['10LCNO5A-7', '10LSNO5A-7', 'PRQNO07C-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver la notation scientifique d'un petit nombre"
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 6
 * Trouver la notation scientifique d'un petit nombre
 * @author Jean-Claude Lhote
 */
export default class AutoQ6Metropole2026 extends ExerciceQcmA {
  private appliquerLesValeurs(mantisse: number, exposant: number): void {
    const n = mantisse * 10 ** exposant
    this.enonce = `Parmi les propositions suivantes, laquelle est la notation scientifique du nombre $${texNombre(n, 8)}$ ?`

    this.reponses = [
      `$${texNombre(mantisse, 2)}\\times 10^{${exposant}}$`,
      `$${texNombre(mantisse * 100, 2)}\\times 10^{${exposant}}$`,
      `$${texNombre(mantisse, 2)}\\times 10^{${-exposant}}$`,
      `$${texNombre(mantisse * 100, 2)}\\times 10^{${exposant - 2}}$`,
    ]

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4.58, -3)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const diviseur = choice([10000, 100000, 1000000])
    const n =
      randint(101, 999, [200, 300, 400, 500, 600, 700, 800, 900]) / diviseur
    const exposant = -Math.log10(diviseur) + 2
    const mantisse = (n * diviseur) / 100
    this.appliquerLesValeurs(mantisse, exposant)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
