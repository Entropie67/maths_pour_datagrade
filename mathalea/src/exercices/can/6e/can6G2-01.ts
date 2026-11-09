import DenombrerCubes from '../../6e/6G8A-1'
export const interactifReady = true

export const amcType = 'AMCNum'
export const amcReady = true
export const titre = 'Compter les cubes'

/**
 * @author Jean-claude Lhote

 */
export const uuid = '76b93'

export const refs = {
  'fr-fr': ['can6G2-01', '6G8A-flash1'],
  'fr-ch': ['NR'],
}
export default class CompterLesCubesManquant extends DenombrerCubes {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup2 = 1
    this.sup = 1
  }
}
