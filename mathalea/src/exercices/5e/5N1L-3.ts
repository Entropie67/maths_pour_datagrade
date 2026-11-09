import { choice } from '../../lib/outils/arrayOutils'
import { contraindreValeur, randint } from '../../modules/outils'
import ExerciceLabyrinthe from '../_Exercice_labyrinthe'
export const titre = 'Parcourir un labyrinthe de nombres premiers'

export const dateDePublication = '30/10/2026'
export const interactifReady = true

export const uuid = 'b7aee'
export const refs = {
  'fr-fr': ['5N1L-3'],
  'fr-2016': ['5A12-3v2'],
  'fr-ch': ['9R2NO1F-9', '9R3NO1F-9', '10CTNO1A-9', 'PRQNO09B-11'],
}
/**
 * @author Rémi Angot
 */

export default class ExerciceLabyrintheNombrePremiers extends ExerciceLabyrinthe {
  consigne =
    'Trouver le chemin qui passe par des nombres premiers.' +
    this.consigneDeplacement

  cols = 6
  rows = 6
  primesBelow100 = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97,
  ]

  max = 100
  primesDisponibles: number[] = this.primesBelow100

  constructor() {
    super()
    this.sup = 100
    this.besoinFormulaireNumerique = ['Nombre maximum', 100]
    this.comment =
      "Nombre maximum : il s'agit du plus grand nombre premier pouvant apparaitre dans la grille."
  }

  nouvelleVersion() {
    this.max = contraindreValeur(10, 100, this.sup, 100)
    this.primesDisponibles = this.primesBelow100.filter((p) => p <= this.max)
    super.nouvelleVersion()
  }

  generateGoodAnswers() {
    return choice(this.primesDisponibles)
  }

  generateBadAnswers() {
    return randint(1, this.max, this.primesDisponibles)
  }
}
