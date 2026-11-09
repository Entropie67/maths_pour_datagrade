import EqCartDroite from '../1e/1G21-1'
export const titre =
  "Déterminer une équation cartésienne de droite à partir d'un point et d'un vecteur directeur"

export const dateDeModifImportante = '03/03/2025'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon  + Jean-claude Lhote (interactif) + Gilles Mora
 */
export const uuid = '0ec77'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
class EqCartpointVecteurOld extends EqCartDroite {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.spacing = 1.5
    this.sup = 1
    this.version = 3
    this.besoinFormulaireNumerique = [
      'Type de correction :',
      2,
      '1 : Correction avec le cours\n2 : Correction avec la démonstration',
    ]
  }
}
export default EqCartpointVecteurOld
