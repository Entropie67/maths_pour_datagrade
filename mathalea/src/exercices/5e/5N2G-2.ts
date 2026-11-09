import ExerciceSimplificationSommeAlgebrique from './SimplificationSommeAlgebrique'
export const dateDePublication = '01/07/2026'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre =
  "Écrire une addition sous la forme d'une expression algébrique sans parenthèses puis calculer"

export const uuid = '9c5e2'

export const refs = {
  'fr-fr': ['5N2G-2'],
  'fr-2016': ['5R22-2a'],
  'fr-ch': ['9R2NO3D-5', '9R3NO3D-5', '10LCNO2D-2', '10LSNO2D-2', '11CTNO1C-2', 'PRQNO13B-6'],
}
/**
 * @author Éric Elter
 */

export default class ExerciceSimplificationSommeAlgebriqueAddition extends ExerciceSimplificationSommeAlgebrique {
  constructor() {
    super()
    this.sup2 = 1
    this.besoinFormulaire4CaseACocher = false
  }
}
