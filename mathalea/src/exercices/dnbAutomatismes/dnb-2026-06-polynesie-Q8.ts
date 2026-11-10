import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b6b23'
export const refs = {
  'fr-fr': ['3AutoF01-1'],
  'fr-ch': ['10LCFA3C-10', '10LSFA3C-10', '11CTFA2B-10'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer l'image d'un nombre par une fonction affine"
export const dateDePublication = '12/08/2026'

/**
 * DNB Polynésie juin 2026 - Question 8
 * Calculer l'image d'un nombre par une fonction affine
 * @author Jean-Claude Lhote
 */
export default class AutoQ8PolynesieBrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, x: number): void {
    this.enonce = `L'image du nombre $${texNombre(x, 0)}$ par la fonction $f$ définie par $f(x) = ${a}x${ecritureAlgebrique(b)}$ est :`
    const image = a * x + b

    this.reponses = [
      `$${texNombre(image, 0)}$`,
      `$${texNombre(a * 10 + b, 0)}$`,
      `$${texNombre(a * x, 0)}$`,
      `$${texNombre(a * Math.abs(x + b), 0)}$`,
    ]

    this.correction = `L'image du nombre $${texNombre(x, 0)}$ par la fonction $f$ est donnée par le calcul :<br>
        $\\begin{aligned}${a}x${ecritureAlgebrique(b)}&=${a}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\\\
        &=${texNombre(a * x, 0)}${ecritureAlgebrique(b)}\\\\
        &=${miseEnEvidence(`${texNombre(image, 0)}`)}
        \\end{aligned}$
    `
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, -5, 4)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    do {
      const a = randint(-5, 5, [0, 1, -1])
      const b = randint(-5, 5, [0, a])
      const x = randint(-10, 10, [0, a, b])
      this.appliquerLesValeurs(a, b, x)
    } while (this.reponses.length !== 4)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
