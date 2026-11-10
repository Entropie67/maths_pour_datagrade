import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = 'c82d0'
export const refs = {
  'fr-fr': ['3L1QCM-08'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Équation produit nul (septembre 2022 Métropole)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep22Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const s1 = `-\\dfrac{${String(b)}}{${String(a)}}`
    this.reponses = [
      `$${s1}$ et $${String(c)}$`,
      `$${String(-b)}$ et $${String(-c)}$`,
      `$${String(a)}$ et $${String(-c)}$`,
    ]
    this.enonce = `Les solutions de l'équation $(${String(a)}x+${String(b)})(-x+${String(c)})= 0$ sont :`
    this.correction = `Un produit de facteurs est nul si l'un des facteurs est nul, soit <br>
    $\\left\\{\\begin{array}{l c l}
    ${String(a)}x+${String(b)}&=0\\\\
    \\text{ou}&\\\\
    -x+${String(c)}&=0\\\\
    \\end{array}\\right.$ d'où $\\left\\{\\begin{array}{l c l}
    ${String(a)}x&=-${String(b)}\\\\
     \\text{ou}&\\\\
     -x&=-${String(c)}\\\\
      \\end{array}\\right.$ soit $\\left\\{\\begin{array}{l c l}
       x&=-\\dfrac{${String(b)}}{${String(a)}}\\\\
      \\text{ou}&\\\\
       x&=${String(c)}\\\\
        \\end{array}\\right.$.<br>`

    this.correction += `Donc, l'équation $(${String(a)}x+${String(b)})(-x+${String(c)})=0$ a pour solutions $${miseEnEvidence(`x=-\\dfrac{${String(b)}}{${String(a)}}`)}$ ${texteEnCouleurEtGras('et')} $${miseEnEvidence(`x=${String(c)}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 1, 3)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = choice([2, 4, 5])
      const c = randint(2, 9)
      const b = choice([1, 3, 7])
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
