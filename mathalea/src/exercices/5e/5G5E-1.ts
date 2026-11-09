import DefinitionProprietesTriangles from './DefinitionProprietesTriangles'
export const titre =
  "Connaitre notamment la définition d'une hauteur dans un triangle"
export const dateDePublication = '10/06/2026'
export const interactifReady = true

/**
 * Pour les nouveaux programmes de 5ème
 * @author Éric Elter
 */

export const uuid = '1d202'

export const refs = {
  'fr-fr': ['5G5E-1'],
  'fr-2016': ['5G25a'],
  'fr-ch': ['NR'],
}
export default class DefinitionProprietesTrianglesHauteurs extends DefinitionProprietesTriangles {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 1
  }
}
