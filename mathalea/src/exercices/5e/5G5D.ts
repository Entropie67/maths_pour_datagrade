import ConnaitreFormulesDePerimetreEtAires from './ConnaitreFormulesDePerimetreEtAires'

export const titre = "Connaitre le cours sur l'aire d'un triangle"
export const dateDePublication = '07/07/2026'

/**
 * @author Éric Elter
 */

export const uuid = 'a803f'

export const refs = {
  'fr-fr': ['5G5D'],
  'fr-2016': ['5M10-2a'],
  'fr-ch': ['NR'],
}
export default class ConnaitreFormulesDePerimetreEtAiresV3 extends ConnaitreFormulesDePerimetreEtAires {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Périmètre du rectangle',
        '2 : Périmètre du carré',
        '3 : Aire du rectangle',
        '4 : Aire du carré',
        '5 : Aire du triangle rectangle',
        '6 : Aire du triangle quelconque',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5-6'
    this.version = '5M10-2a'
  }
}
