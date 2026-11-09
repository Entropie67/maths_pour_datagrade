import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '47d36'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Proportionnalité (Métropole Juin 2025)'
export const dateDePublication = '27/05/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJ25EX3Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    fruit: string,
  ): void {
    const pe = Math.floor(b)
    const peu = Math.floor(b / a)
    this.reponses = [
      `$${texNombre((c * b) / a, 2, true)}$ €`,
      `$${texNombre(b * c, 2, true)}$ €`,
      `$${texNombre(peu * c + b - pe, 2, true)}$ €`,
      `$${texNombre(pe * (c - a) + b - pe, 2, true)}$ €`,
    ]
    this.enonce = `Le prix de $${a}$ ${fruit} est $${texNombre(b, 2, true)}$ €. Combien coûtent $${c}$ ${fruit} ?<br>`

    this.correction = `Le prix de $${a}$ ${fruit} est $${texNombre(b, 2, true)}$ €.<br>
    Donc le prix ${fruit === 'melons' ? "d'un melon" : `d'une ${fruit.slice(0, -1)}`} est : $\\dfrac{${texNombre(b, 2, true)}\\text{ €}}{${a}}=${texNombre(b / a, 2, true)}$ €.<br>
    Ainsi, le prix de $${c}$ ${fruit} est : $${c}\\times ${texNombre(b / a, 2, true)}\\text{ €}=${texNombre((b / a) * c, 2, true)}\\text{ €}$.<br>
    Donc le prix de $${c}$ ${fruit} est $${texNombre((b * c) / a, 2, true)}$ €.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 8.4, 5, 'melons')
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const fruit = choice([
        'melons',
        'pastèques',
        'goyaves',
        'mangues',
        'papayes',
      ])
      const a = choice([2, 3, 4, 5])
      const pu = randint(1, 9) / 10 + 2
      const b = a * pu
      const c = randint(3, 6, a) + a
      this.appliquerLesValeurs(a, b, c, fruit)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
