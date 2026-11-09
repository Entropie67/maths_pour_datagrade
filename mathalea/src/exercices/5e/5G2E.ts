import ConnaitreFormulesDePerimetreEtAires from './ConnaitreFormulesDePerimetreEtAires'

export const titre = "Connaître le cours sur l'aire d'un disque"
export const dateDePublication = '07/07/2026'

/**
 * @author Éric Elter
 */

export const uuid = '7cc93'

export const refs = {
  'fr-fr': ['5G2E'],
  'fr-2016': ['5M10-2b'],
  'fr-ch': ['NR'],
}
export default class ConnaitreFormulesDePerimetreEtAiresV4 extends ConnaitreFormulesDePerimetreEtAires {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Définition du nombre $\\pi$',
        "2 : Longueur d'un cercle",
        "3 : Aire d'un disque",
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
    this.version = '5M10-2b'
  }
}
