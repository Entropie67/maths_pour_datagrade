// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f239f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceEquation1 from '../4e/4L20-old2'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Résoudre une équation du premier degré'
export const dateDeModifImportante = '02/04/2024'
export const uuid = 'f239f'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquation3eOld extends ExerciceEquation1 {
  constructor() {
    super()
    this.sup = true
    this.sup2 = 8
    this.sup3 = false
  }
}
