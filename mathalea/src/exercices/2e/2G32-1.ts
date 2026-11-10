import EqCartDroite from '../1e/1G21-1'
export const titre =
  'Déterminer une équation cartésienne de droite à partir de deux points'
export const dateDeModifImportante = '03/03/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon  + Jean-claude Lhote (interactif) + Gilles Mora
 * Passage en multiMathfield par Éric Elter le 13/05/2026
 */
export const uuid = '1bb3e'

export const refs = {
  'fr-fr': ['2G32-1'],
  'fr-ch': ['1mF2-3'],
}
class EqCart2points extends EqCartDroite {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '2'
    this.besoinFormulaireTexte = false
    this.version = 2
  }
}
export default EqCart2points
