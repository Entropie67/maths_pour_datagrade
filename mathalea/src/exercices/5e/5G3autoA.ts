import Transformations from '../6e/_Transformations'

export const titre = "Trouver l'image d'un point par une symétrie axiale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const uuid = 'da157'

export const refs = {
  'fr-fr': ['5G3autoA'],
  'fr-2016': ['5G10'],
  'fr-ch': ['NR'],
}
export default class SymetrieAxiale5e extends Transformations {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des transformations',
      'Nombres séparés par des tirets  : \n1 : Symétrie oblique (Diagonale 1)\n2 : Symétrie oblique (Diagonale 2)\n3 : Symétrie horizontale\n4 : Symétrie verticale',
    ]
    this.sup = '1-2-3-4'
  }
}
