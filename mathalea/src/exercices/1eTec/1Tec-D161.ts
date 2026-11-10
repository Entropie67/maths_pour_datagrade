import Tauxvariation from '../1e/1AN10-1'

export const titre = 'Calculer un nombre dérivé à partir de la définition'
export const interactifReady = true

export const dateDePublication = '22/04/2026'
export const uuid = '87382'
export const refs = {
  'fr-fr': ['1Tec-D12'],
  'fr-ch': [],
}

export default class Tauxvariation1Tec extends Tauxvariation {
  constructor() {
    super()
    this.version = '1Tec'
    this.sup = '5'

    this.besoinFormulaireTexte = [
      'Type de fonctions',
      [
        'Nombres séparés par des tirets :',
        '1 : Fonction affine',
        '2 : Fonction carré',
        '3 : Fonction $x^2+bx+c$',
        '4 : Fonction $ax^2+bx+c$ avec $a \\neq 1$',
        '5 : Mélange',
      ].join('\n'),
    ]
  }
}
