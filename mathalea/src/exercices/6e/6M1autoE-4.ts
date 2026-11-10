import ConnaitreFormulesDePerimetreEtAires from '../5e/ConnaitreFormulesDePerimetreEtAires'

export const titre =
  "Connaître la formule de l'aire d'un carré ou d'un rectangle"
export const dateDePublication = '07/07/2026'

/**
 * @author Éric Elter
 */

export const uuid = 'fcbd9'

export const refs = {
  'fr-fr': ['6M1autoE-4'],
  'fr-ch': ['NR'],
}
export default class ConnaitreFormulesDePerimetreEtAiresV2 extends ConnaitreFormulesDePerimetreEtAires {
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
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3-4'
    this.version = '6M1autoE-4'
  }
}
