import Equationdetangente from '../1e/1AN11-3'

export const titre =
  'Déterminer une équation de tangente avec calcul de dérivée'
export const interactifReady = true

export const dateDePublication = '22/04/2026'
export const uuid = 'f633c'
export const refs = {
  'fr-fr': ['1Tec-D24'],
  'fr-ch': [],
}

export default class Equationdetangente1Tec extends Equationdetangente {
  constructor() {
    super()
    this.version = '1Tec'
    this.sup = '3'

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Polynôme degré 2',
        '2 : Polynôme degré 3',
        '3 : Mélange',
      ].join('\n'),
    ]
  }
}
