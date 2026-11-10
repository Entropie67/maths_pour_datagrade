// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d02da continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceEquation1 from '../4e/4L20-old2'
export const titre = 'Résoudre une équation du premier degré'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '02/04/2024'
export const uuid = 'd02da'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquation12ndeOld extends ExerciceEquation1 {
  constructor() {
    super()
    this.sup = true
    this.sup2 = '5-6-7'
    this.sup3 = false
  }
}
