import AjouterPresqueDoubles from './CPCA11'

export const titre = 'Ajouter des presque-doubles inférieurs à $16$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '22/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3ca3c'

export const refs = {
  'fr-fr': ['CPCA11-2'],
  'fr-ch': [],
}
export default class AjouterPresqueDoubles31 extends AjouterPresqueDoubles {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 5
    this.sup2 = 15
  }
}
