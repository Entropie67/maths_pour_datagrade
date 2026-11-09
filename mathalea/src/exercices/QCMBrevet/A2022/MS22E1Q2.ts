import { orangeMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import FractionEtendue from '../../../modules/FractionEtendue'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '3337c'
export const refs = {
  'fr-fr': ['4C2QCM-02'],
  'fr-ch': ['9R1QCMNO-7', '9R2QCMNO-8', '9R3QCMNO-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Fraction irréductible (septembre 2022 Métropole)'
export const dateDePublication = '06/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleSep22Ex1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(decompo1: number[], decompo2: number[]): void {
    const num = decompo1.reduce((acc, val) => acc * val, 1)
    const den = decompo2.reduce((acc, val) => acc * val, 1)
    const fracDepart = new FractionEtendue(num, den)
    const fracReduite = fracDepart.simplifie().texFraction
    const fracReduite2 = fracDepart.reduire(1 / decompo1[0]).texFraction
    const fracReduite3 = fracDepart.simplifie().reduire(decompo1[1]).texFraction
    this.reponses = [
      `$${fracReduite}$`,
      `$${fracReduite2}$`,
      `$${fracReduite3}$`,
    ]
    this.enonce = `La fraction irréductible égale à $${fracDepart.texFraction}$ est :`
    this.correction = ` $${fracDepart.texSimplificationAvecEtapes(true, orangeMathalea)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([2, 7, 3, 3, 5], [2, 7, 3, 3, 7])
  }

  versionAleatoire = () => {
    const n = 3
    do {
      const decompo1 = [
        2,
        choice([7, 11, 13]),
        choice([2, 3, 5]),
        choice([2, 3, 5]),
        choice([5, 7]),
      ]
      const decompo2 = [
        2,
        decompo1[1],
        decompo1[2],
        decompo1[3],
        choice([5, 7], [decompo1[4]]),
      ]
      this.appliquerLesValeurs(decompo1, decompo2)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
