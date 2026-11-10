import NotationScientifique from '../../4e/4C32'
export const titre = "Donner l'écriture scientifique"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '20/09/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * @author
 */
export const uuid = '74fc9'

export const refs = {
  'fr-fr': ['can3C2-05', '2N42-flash1'],
  'fr-ch': ['NR'],
}
class NotSci extends NotationScientifique {
  can: boolean
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup2 = 3
    this.can = true
  }
}
export default NotSci
