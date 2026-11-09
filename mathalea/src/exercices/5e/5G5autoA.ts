import VocabulaireDesTriangles from './VocabulaireDesTriangles'
export const titre = 'Reconnaître des triangles'
export const interactifReady = true

/**
 * @author Éric Elter (pour le clone)
 */
export const uuid = '7353f'

export const refs = {
  'fr-fr': ['5G5autoA'],
  'fr-2016': ['5G20-1b'],
  'fr-ch': ['NR'],
}
export default class VocabulaireDesTrianglesAvecFigures extends VocabulaireDesTriangles {
  constructor() {
    super()
    this.sup = true
    this.scaleFigureLatex = 0.4
  }
}
