import { randint } from '../../modules/outils'
import ExerciceLabyrinthe from '../_Exercice_labyrinthe'
export const titre = 'Parcourir un labyrinthe de fractions égales'

export const dateDePublication = '30/10/2026'
export const interactifReady = true

export const uuid = 'e1a0a'
export const refs = {
  'fr-fr': ['5N3autoE-2'],
  'fr-2016': ['5N13-3'],
  'fr-ch': ['9R1NO4D-3', '9R2NO4D-3', '9R3NO4D-3', 'PRQNO10B-5'],
}
/**
 * @author Rémi Angot
 */

export default class ExerciceLabyrintheFractionsEgales extends ExerciceLabyrinthe {
  consigne =
    'Trouver le chemin qui passe par des fractions égales.' +
    this.consigneDeplacement

  cols = 6
  rows = 4
  orientation?: 'horizontal' | 'vertical' = 'horizontal'

  num!: number
  den!: number

  init(): void {
    this.den = randint(2, 5)
    this.num = randint(1, this.den - 1)
  }

  generateGoodAnswers() {
    const k = randint(1, 9)
    return `$\\dfrac{${this.num * k}}{${this.den * k}}$`
  }

  generateBadAnswers() {
    const k = randint(1, 9)
    switch (randint(1, 3)) {
      case 1:
        return `$\\dfrac{${this.num * k + 1}}{${this.den * k}}$`
      case 2:
        return `$\\dfrac{${this.num * k - 1}}{${this.den * k}}$`
      default:
        return `$\\dfrac{${this.den * k}}{${this.num * k}}$`
    }
  }
}
