import DefinitionProprietesTriangles from '../5e/DefinitionProprietesTriangles'
export const titre =
  "Connaître la définition et la propriété caractéristique de la médiatrice d'un segment"
export const dateDePublication = '10/06/2026'
export const interactifReady = true

/**
 * Pour les nouveaux programmes de 6ème
 * @author Éric Elter
 */

export const uuid = '29407'

export const refs = {
  'fr-fr': ['6G3B-2'],
  'fr-ch': ['NR'],
}
export default class DefinitionProprietesTrianglesMediatrices extends DefinitionProprietesTriangles {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = '2-3-4'
  }
}
