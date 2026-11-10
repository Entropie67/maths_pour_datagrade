import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '47d32'
export const refs = {
  'fr-fr': ['3F1QCM-2'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une image par une fonction (2021 Asie)'
export const dateDePublication = '09/11/2024'

/**
 * @author Jean-Claude LHOTE
 */

export default class AsieJuin21Exo1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.reponses = [
      `$f(0)=${String(b)}$`,
      `$f(${String(b)})=0$`,
      `L'image de $${String(-b)}$ par $f$ est $${String(b)}$.`,
    ]
    this.enonce = `On considère la fonction $f$ définie par $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(b)}$.<br>
    Une seule des affirmations suivantes est vraie. Laquelle ?`
    this.correction = `L'image de $${String(-b)}$ par $f$ est : $${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}${ecritureParentheseSiNegatif(-b)}^2${ecritureAlgebrique(b)}=${texNombre(a * b ** 2 + b, 0)}$.<br>
    $f(${b})=${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}${ecritureParentheseSiNegatif(b)}^2${ecritureAlgebrique(b)}=${texNombre(a * b ** 2 + b, 0)}$<br>
    $f(0)=${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}0^2${ecritureAlgebrique(b)}=${texNombre(b, 0)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, -2)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = choice([2, 3, 4, 5]) * choice([-1, 1])
      const b = choice([2, 3, 4, 5]) * choice([-1, 1])
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
