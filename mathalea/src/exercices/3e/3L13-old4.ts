// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 0e152 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceEquation1 from '../4e/4L20-old3'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Résoudre une équation du premier degré'
export const dateDeModifImportante = '03/10/2026'
export const uuid = '0e152'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquation3eOld4 extends ExerciceEquation1 {
  constructor() {
    super()
    this.xPlusBEgalCAvecRelatifsNonNuls = true
    this.sup = true
    this.sup2 = 8
    this.sup3 = false
  }
}
