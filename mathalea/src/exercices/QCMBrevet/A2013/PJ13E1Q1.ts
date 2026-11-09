import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '67e16'
export const refs = {
  'fr-fr': ['3C1QCM-03'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul avec les puissances de $10$ (2013 Polynésie)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class PolynesieJuin12Exo1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    e1: number,
    e2: number,
  ): void {
    this.reponses = [
      `$${texNombre(2 * (a - b * 10 ** -e1), 4)}\\times 10^{${-e2 - 1}}$`,
      `$${texNombre(a - ((b * 10 ** -e1) / 5) * 10 ** e2, 2)}$`,
      `$${texNombre((a - b) / 5, 1)}\\times 10^{${-e1 - e2}}$`,
    ]
    this.enonce = `$\\dfrac{${a}-${b}\\times10^{-${e1}}}{5\\times 10^${e2}}= ?$`
    this.correction = `D'une part : $${a}-${b}\\times10^{-${e1}}=${a}-${texNombre(b * 10 ** -e1)}=${texNombre(a - b * 10 ** -e1)}$.<br>`
    this.correction += `D'autre part : $5\\times 10^${e2}=5\\times${texNombre(10 ** e2)}=${texNombre(5 * 10 ** e2)}$.<br>`
    this.correction += `Donc : $\\dfrac{${a}-${b}\\times10^{-${e1}}}{5\\times 10^${e2}}=\\dfrac{${texNombre(a - b * 10 ** -e1)}}{${texNombre(5 * 10 ** e2)}}=${texNombre((a - b * 10 ** -e1) / (5 * 10 ** e2))}$.<br>`
    this.correction += `Enfin : $${texNombre((a - b * 10 ** -e1) / (5 * 10 ** e2))}=${miseEnEvidence(`${texNombre(2 * (a - b * 10 ** -e1))}\\times 10^{${-e2 - 1}}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(15, 9, 3, 2)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(5, 19) * 2 + 1
      const b = randint(2, 9)
      const e1 = randint(3, 4)
      const e2 = e1 - 1
      this.appliquerLesValeurs(a, b, e1, e2)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
