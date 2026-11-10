import ExerciceSimplificationSommeAlgebrique from './SimplificationSommeAlgebrique'
export const dateDePublication = '01/07/2026'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre =
  "Écrire une soustraction sous la forme d'une expression algébrique sans parenthèses puis calculer"

export const uuid = '47868'

export const refs = {
  'fr-fr': ['5N2I-3'],
  'fr-2016': ['5R22-2b'],
  'fr-ch': ['NR'],
}
/**
 * @author Éric Elter
 */

export default class ExerciceSimplificationSommeAlgebriqueSoustraction extends ExerciceSimplificationSommeAlgebrique {
  constructor() {
    super()
    this.besoinFormulaire4CaseACocher = false
    this.sup2 = 2
  }
}
