import AngleComplémentaireTriangleRectangle from '../../3e/3AutoG03'
export const titre =
  "Calculer l'angle complémentaire dans un triangle rectangle"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/12/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const uuid = '1b1b7'
export const refs = {
  'fr-fr': ['can4G3-02'],
  'fr-ch': ['NR'],
}
export default class CANAngleTriangleRect extends AngleComplémentaireTriangleRectangle {
  constructor() {
    super()
    this.can = true
    this.nbQuestions = 1
  }
}
