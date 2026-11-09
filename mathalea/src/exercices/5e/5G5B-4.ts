import DefinitionProprietesTriangles from './DefinitionProprietesTriangles'
export const titre = "Connaitre notamment l'inégalité triangulaire"
export const dateDePublication = '10/06/2026'
export const interactifReady = true

/**
 * Pour les nouveaux programmes de 5ème
 * @author Éric Elter
 */

export const uuid = '3cbb1'

export const refs = {
  'fr-fr': ['5G5B-4'],
  'fr-2016': ['5G25b'],
  'fr-ch': ['NR'],
}
export default class DefinitionProprietesTrianglesInegaliteTriangulaire extends DefinitionProprietesTriangles {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 7
  }
}
