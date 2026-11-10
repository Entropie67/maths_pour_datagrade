import CalculsImagesFonctions from './3F10-2-old'
export const titre =
  'Calculer des images dans des fonctions polynomiales ou rationnelles'
export const dateDePublication = '19/06/2024'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const uuid = '8a78e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class CalculsImagesFonctionsPolynomialesOuRationnelles extends CalculsImagesFonctions {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Polynôme de degré 2 \n2 : Fonction rationnelle \n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Niveau de difficulté',
      5,
      '1 : Que des entiers positifs\n2 : Avec des entiers relatifs\n3 : Avec des antécédents tous négatifs\n4 : Mélange',
    ]
    this.fonctions = 'polynomialesOuRationnelles'
    this.besoinFormulaire2Numerique = false
    this.sup = 3
    this.sup2 = 1
    this.sup3 = 1
  }
}
