import { randint } from '../../modules/outils'
import ExerciceLabyrinthe from '../_Exercice_labyrinthe'
export const titre = 'Parcourir un labyrinthe de vecteurs colinéaires'

export const dateDePublication = '30/10/2026'
export const interactifReady = true

export const uuid = 'labyvec'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * @author Rémi Angot
 */

export default class ExerciceLabyrintheColineaires extends ExerciceLabyrinthe {
  consigne = 'Trouver le chemin qui ne passe que par des coordonnées de vecteurs colinéaires'
  x!: number
  y!: number

  init() {
    this.x = randint(-10, 10, 0)
    this.y = randint(-10, 10, 0)
  }

  generateGoodAnswers() {
    const k = randint(-3, 3, [0, 1])
    return `(${this.x * k} ; ${this.y * k})`
  }

  generateBadAnswers() {
    const k = randint(-3, 3, [0, 1])
    const erreur = randint(1, Math.abs(k) - 1)
    switch (randint(1, 3)) {
      case 1:
        return `(${this.x * k + erreur} ; ${this.y * k})`
      case 2:
        return `(${this.x * k} ; ${this.y * k + erreur})`
      default:
        return `(${this.x * k} ; ${this.y * -k})`
    }
  }
}
