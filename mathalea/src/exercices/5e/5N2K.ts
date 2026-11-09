import ExerciceSimplificationSommeAlgebrique from './SimplificationSommeAlgebrique'
export const dateDePublication = '02/09/2026'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre =
  "Écrire une addition sous la forme d'une expression algébrique sans parenthèses"

export const uuid = '6510a'

export const refs = {
  'fr-fr': ['5N2K'],
  'fr-ch': ['NR'],
}
/**
 * @author Éric Elter
 */

export default class ExerciceSimplificationSommeAlgebriqueSeulement extends ExerciceSimplificationSommeAlgebrique {
  constructor() {
    super()
    this.sup2 = 1
    this.besoinFormulaire4CaseACocher = false
    this.sup4 = false
  }
}
