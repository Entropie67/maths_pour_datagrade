import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import ExerciceLabyrinthe from '../_Exercice_labyrinthe'
export const titre =
  'Parcourir un labyrinthe des multiples basé sur des critères de divisibilité de 2, 5 ou 10'

export const dateDePublication = '12/07/2026'
export const interactifReady = true

export const uuid = '9ca7f'
export const refs = {
  'fr-fr': ['5N1autoA'],
  'fr-ch': ['9R1NO1D-1', '9R2NO1D-1', '9R3NO1D-1', 'PRQNO08A-14'],
}
/**
 * @author Éric Elter
 */

export default class ExerciceLabyrintheMultiplesDe25et10 extends ExerciceLabyrinthe {
  k!: number
  constructor() {
    super()
    this.orientation = 'horizontal'
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Critère de divisibilité',
      5,
      '1 : Par 2\n2 : Par 5\n3 : Par 10\n4 : Au hasard',
    ]
    this.besoinFormulaire2Numerique = ['Nombre de lignes', 15]
    this.besoinFormulaire3Numerique = ['Nombre de colonnes', 15]
    this.sup2 = 5
    this.sup3 = 7
  }

  nouvelleVersion(): void {
    this.rows = this.sup2
    this.cols = this.sup3
    switch (this.sup) {
      case 1:
        this.k = 2
        break
      case 2:
        this.k = 5
        break
      case 3:
        this.k = 10
        break
      default:
        this.k = choice([2, 5, 10])
    }

    super.nouvelleVersion()
    this.consigne = `Trouver le chemin qui passe par des multiples de ${this.k}.`
    this.consigne += this.consigneDeplacement
  }

  generateGoodAnswers() {
    return randint(11, 50) * this.k
  }

  generateBadAnswers() {
    return randint(11, 50) * this.k + randint(1, this.k - 1)
  }
}
