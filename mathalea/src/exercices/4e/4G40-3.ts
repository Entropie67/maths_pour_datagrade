import ExprimerCosSinTan from '../3e/3G30-1'

export const titre = 'Exprimer le cosinus en fonction des côtés du triangle'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '23/09/2025'
export const uuid = '86cd4'
export const refs = {
  'fr-fr': ['4G40-3', '3AutoG13-2'],
  'fr-ch': [],
}

export default class ExprimerCos extends ExprimerCosSinTan {
  constructor() {
    super()
    this.besoinFormulaire2Texte = false
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Donner 1 rapport trigonométrique\n2 : Donner 2 rapports trigonométriques\n3 : Deux triangles imbriqués, donner un rapport de deux manières différentes',
    ]
    this.sup2 = '1'
  }
}
