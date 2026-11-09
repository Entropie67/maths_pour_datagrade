import { developpe } from '../../../lib/mathFonctions/outilsMaths'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '48d36'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul littéral (Métropole Juin 2025)'
export const dateDePublication = '27/05/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJ25EX3Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    this.reponses = [
      `$${reduirePolynomeDegre3(0, a * c, a * d + b * c, b * d)}$`,
      `$${reduirePolynomeDegre3(0, 0, a + c, b + d)}$`,
      `$${reduirePolynomeDegre3(0, a * c, a * d - b * c, b * d)}$`,
      `$${reduirePolynomeDegre3(0, a * c, 0, b * d)}$`,
    ]
    const expr = `\\left(${reduireAxPlusB(a, b)}\\right) \\times \\left(${reduireAxPlusB(c, d)}\\right)`
    this.enonce = `Quelle est la forme développée et réduite de l'expression : $${expr}$ ?<br>`
    const developped = developpe(expr, { isColored: false })
    this.correction = `La forme développée et réduite de l'expression est :<br>
    $\\begin{aligned}${expr}&=${developped}\\\\
    &=${reduirePolynomeDegre3(0, a * c, a * d + b * c, b * d)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 3, 1, -4)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const a = choice([2, 3, 4, 5])
      const b = choice([2, 3, 4, 5], [a])
      const c = choice([1, 2])
      const d = -choice([2, 3, 4, 5])
      this.appliquerLesValeurs(a, b, c, d)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
