import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Résoudre une équation du type $ax+b=c$'
export const amcReady = 'true'
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDePublication = '25/12/2025'

export const uuid = '4af87'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * @author Jean-claude Lhote
 */
export default class ResoudreEquationAxPlusBegaleC extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    this.reponses = [
      `\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}`,
      `\\dfrac{${c}}{${a}}${ecritureAlgebrique(-b)}`,
      `(${c}${ecritureAlgebrique(-a)})${ecritureAlgebrique(-b)}`,
      `${c}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-b)}`,
    ].map((texte) => `$${texte}$`)
    this.enonce = `Pour résoudre l'équation $${a}x${ecritureAlgebrique(b)}=${c}$, on effectue le calcul :`

    this.correction = `Pour résoudre l'équation $${a}x${ecritureAlgebrique(b)}=${c}$, on commence par soustraire $${b}$ des deux membres de l'équation, ce qui donne $${a}x=${c}${ecritureAlgebrique(-b)}$.<br>
    Ensuite, on divise les deux membres par $${a}$ pour obtenir $x=\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, -3, 20)
  }

  versionAleatoire: () => void = () => {
    do {
      const a = randint(2, 9)
      const b = randint(-9, 9, [0, a, -a])
      const c = randint(10, 30)
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < 4)
  }

  constructor() {
    super()
    this.besoinFormulaire4CaseACocher = false
    this.besoinFormulaire2CaseACocher = false

    this.versionAleatoire()
  }
}
