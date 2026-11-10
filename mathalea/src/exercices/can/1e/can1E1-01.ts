import SimplifierExponentielles from '../../1e/1AN30-2'
export const titre = 'Simplifier des expressions exponentielles'
export const interactifReady = true

export const dateDePublication = '05/08/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * @author
 */
export const uuid = 'ce463'

export const refs = {
  'fr-fr': ['can1E1-01'],
  'fr-ch': [],
}
class ExpCAN extends SimplifierExponentielles {
  constructor() {
    super()
    this.nbQuestions = 1

    this.sup = 1
    this.sup3 = false
    this.can = true
    this.consigne = ''
  }
}
export default ExpCAN
