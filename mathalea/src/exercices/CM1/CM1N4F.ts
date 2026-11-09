import MultiplierDecimauxPar101001000V2 from '../6e/6N2autoC'
export const dateDePublication = '01/02/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = 'Multiplier un nombre décimal par $10$'

/**
 * @author Éric Elter
 */

export const uuid = 'mp45c'

export const refs = {
  'fr-fr': ['CM1N4F'],
  'fr-ch': ['9R1NO6E-2', '9R2NO6E-2', '9R3NO6E-2'],
}
export default class MultiplierDecimauxPar10 extends MultiplierDecimauxPar101001000V2 {
  constructor() {
    super()
    this.sup = 1
    this.besoinFormulaire2Texte = [
      'Type du produit',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entier',
        '2 : Décimal',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '2'
    this.besoinFormulaire3Texte = [
      'Type du facteur autre que la puissance de 10',
      [
        'Nombres séparés par des tirets  :',
        '1 : Décimal, plus petit que 1',
        '2 : Décimal, plus grand que 1',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = '3'
    this.nbQuestions = 3
    this.version = 'CM1'
  }
}
