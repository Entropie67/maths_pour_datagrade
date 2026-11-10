import EqCartDroite from '../1e/1G21-1'
export const titre =
  "Déterminer une équation cartésienne à partir d'un point et de la pente"

export const dateDeModifImportante = '03/03/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon  + Jean-claude Lhote (interactif) + Gilles Mora
 */
export const uuid = 'd1da4'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
class EqCart1pointVectDirOld extends EqCartDroite {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.version = 4
    // this.consigne = 'Déterminer une équation cartésienne de la droite $(AB)$.'
  }
}
export default EqCart1pointVectDirOld
