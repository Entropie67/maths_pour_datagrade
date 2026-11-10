import ArrondirUnDecimal from '../6e/6N1K-1'
export const titre =
  "Donner la partie entière ou l'arrondi à l'entier d'un nombre décimal"
export const interactifReady = true

export const dateDePublication = '02/02/2026'
export const uuid = '46mp9'
export const refs = {
  'fr-fr': ['CM1N3K', 'CM2N3K-1'],
  'fr-ch': ['9R1NO2D-9', '9R2NO2D-9', '9R3NO2D-9', 'PRQNO05A-12'],
}
export default class ArrondirUnDecimalCM1 extends ArrondirUnDecimal {
  constructor() {
    super()
    this.version = 'CM1'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Partie entière',
        "2 : Arrondi à l'entier",
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = ['Nombre de décimales', 3]
    this.sup2 = 1
    this.besoinFormulaire3Texte = [
      'Encadrement du nombre',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entre 1 et 10',
        '2 : Entre 11 et 100',
        '3 : Entre 101 et 1 000',
        '4 : Entre 1 001 et 10 000',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = '2'
  }
}
