import PerimetreOuAireDeCarresRectanglesTriangles from '../bp2/bp2AutoV4'

export const dateDePublication = '07/07/2026'
export const titre =
  'Calculer périmètre de carrés, rectangles et triangles rectangles'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifType = 'multiMathfield'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'ab280'

export const refs = {
  'fr-fr': ['6M1autoE-1'],
  'fr-ch': ['9R1GM1A-5', '9R2GM1A-5', '9R3GM1A-5', 'PRQMG01B-10'],
}
export default class PerimetreDeCarresRectanglesTriangles extends PerimetreOuAireDeCarresRectanglesTriangles {
  constructor() {
    super()
    this.sup2 = 1
    this.sup = 4
  }
}
