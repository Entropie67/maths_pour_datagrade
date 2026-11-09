// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 261bf continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PavagesEtTransformations from '../6e/_Pavages_et_transformations'
export const titre = "Trouver le symétrique d'une figure dans un pavage"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Exercice en html seulement. Symétrie centrale dans un pavage.
 * @author Jean-claude Lhote

 */
export const uuid = '261bf'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class PavagesEtDemiTourOld extends PavagesEtTransformations {
  constructor() {
    super()
    this.level = 5
    this.besoinFormulaireNumerique = false
  }
}
