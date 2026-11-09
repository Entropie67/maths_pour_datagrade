import EqCartDroite from '../1e/1G21-1'
export const titre =
  "Déterminer une équation cartésienne de droite à partir d'un point et d'un vecteur directeur"

export const dateDeModifImportante = '03/03/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon  + Jean-claude Lhote (interactif) + Gilles Mora
 * Passage en multiMathfield par Éric Elter le 13/05/2026
 */
export const uuid = '0ec7e'

export const refs = {
  'fr-fr': ['2G32-2'],
  'fr-ch': ['3G97-1'],
}
class EqCartpointVecteur extends EqCartDroite {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '3'
    this.besoinFormulaireTexte = false
    this.version = 2
  }
}
export default EqCartpointVecteur
