import EqCartDroite from '../1e/1G21-1'
export const titre =
  'Déterminer une équation cartésienne de droite à partir de deux points'
export const dateDeModifImportante = '03/03/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon  + Jean-claude Lhote (interactif) + Gilles Mora
 */
export const uuid = '1bb30'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
class EqCart2pointsOld extends EqCartDroite {
  version: number
  constructor() {
    super()
    this.nbQuestions = 1

    this.version = 2
  }
}
export default EqCart2pointsOld
