import TrouverNombre from './5N1J-4Old'
export const dateDePublication = '12/07/2026'
export const dateDeModifImportante = '14/09/2026'
export const interactifReady = true

export const titre =
  "Trouver un nombre à l'aide d'un critère de divisibilité par $2$, par $5$ ou par $10$"

/**
 * @author Éric Elter
 */

export const uuid = '5414e'

export const refs = {
  'fr-fr': ['5N1autoA-4'],
  'fr-ch': ['9R1NO1C-3', '9R2NO1C-3', '9R3NO1C-3', 'PRQNO08A-7'],
}
export default class TrouverNombre2ou5ou10 extends TrouverNombre {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Critères de divisibilité',
      [
        'Nombres séparés par des tirets  :',
        '1 : Par 2',
        '2 : Par 5',
        '3 : Par 10',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.version = '5N1autoA4-4'
  }
}
