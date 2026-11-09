import PerimetreOuAireDeCarresRectanglesTriangles from '../bp2/bp2AutoV4'

export const titre =
  'Calculer périmètre et/ou aire de carrés, rectangles et triangles rectangles'
export const dateDePublication = '30/07/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Calculer périmètre et/ou aire de carrés, rectangles et triangles rectangles
 * @author Éric Elter (comme clone de 6M11-1 de Rémi Angot)
 */

export const uuid = '5e598'

export const refs = {
  'fr-fr': ['6M2C-1', 'BP1AUTO104'],
  'fr-2016': ['6M11-1a'],
  'fr-ch': ['NR'],
}
export default class PerimetreOuAireDeCarresRectangles extends PerimetreOuAireDeCarresRectanglesTriangles {
  constructor() {
    super()
    this.sup2 = 2
    this.sup = '1-2'
  }
}
