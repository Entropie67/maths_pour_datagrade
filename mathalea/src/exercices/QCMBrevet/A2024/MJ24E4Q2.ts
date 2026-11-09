import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'cccb1'
export const refs = {
  'fr-fr': ['3C1QCM-01'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul de puissance (2023 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJuin24Exo4Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    const produit: string[] = []
    for (let i = 0; i < b; i++) {
      produit.push(String(-a))
    }
    this.reponses = [
      `$${texNombre(a ** b, 0)}$`,
      `$${texNombre(a * b, 0)}$`,
      `$${texNombre(-(a ** b), 0)}$`,
    ]
    this.enonce = `Combien vaut $(${a})^${b}$ ?`
    this.correction = `$(${a})^${b}$ est un produit de $${b}$ facteurs négatifs.<br>$${b}$ est un nombre impair, donc un tel produit est négatif.<br>`
    this.correction += `$\\begin{aligned}(${a})^${b}&=-(${produit.join('\\times ')})\\\\
    &=${miseEnEvidence(`-${texNombre(Number(String((-a) ** b)))}`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-5, 3)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = -randint(2, 9)
      const b = choice([3, 5])
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
