import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '47f36'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Augmentation en pourcentage (Métropole Juin 2025)'
export const dateDePublication = '27/05/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJ25EX3Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.reponses = [
      `$${texNombre(a * (1 + b / 100), 0)}$ €`,
      `$${texNombre(a - b, 0)}$ €`,
      `$${texNombre(a + b, 0)}$ €`,
      `$${texNombre(a * (1 - b / 100), 2)}$ €`,
    ]
    this.enonce = `Un article coûte $${a}$ €. Son prix augmente de $${texNombre(b, 0)}\\,\\%$. Quel est son nouveau prix ?<br>`

    this.correction = `Lorsque le prix d'un article augmente de $${texNombre(b, 0)}\\,\\%$, son nouveau prix est donné par la formule :<br>
    $${texNombre(a, 0)} \\times \\left(1 + \\dfrac{${texNombre(b, 0)}}{100}\\right) = ${texNombre(a, 0)}\\times ${texNombre(1 + b / 100, 2, true)} = ${texNombre(a * (1 + b / 100), 0)}$ €.<br>
    Donc le nouveau prix de l'article est $${texNombre(a * (1 + b / 100), 0)}$ €.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(350, 20)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const b = choice([2, 3, 4, 5]) * 10
      const a = randint(21, 39, 30) * 10
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
