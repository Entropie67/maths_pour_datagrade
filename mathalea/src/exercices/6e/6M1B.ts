import ConnaitreFormulesDePerimetreEtAires from '../5e/ConnaitreFormulesDePerimetreEtAires'

export const titre = "Connaître la formule du périmètre d'un disque"
export const dateDePublication = '07/07/2026'

/**
 * @author Éric Elter
 */

export const uuid = '2664c'

export const refs = {
  'fr-fr': ['6M1B'],
  'fr-ch': ['NR'],
}
export default class ConnaitreFormulesDePerimetreEtAiresV1 extends ConnaitreFormulesDePerimetreEtAires {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Définition du nombre $\\pi$',
        "2 : Longueur d'un cercle",
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = 3
    this.version = '6M1B'
  }
}
