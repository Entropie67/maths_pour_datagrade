// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 4db23 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 10/10/2026 (commit 57ef1fc8a).
import Proportions from '../2e/2I11-1-old'
export const titre = "Exprimer une proportion sous la forme d'un pourcentage"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '04/04/2022'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export const uuid = '4db23'
export default class ExercicePourcentage5eOld extends Proportions {
  constructor() {
    super()
    this.sup = 2
    this.besoinFormulaireNumerique = false
  }
}
