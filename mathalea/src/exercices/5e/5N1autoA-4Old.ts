import TrouverNombreOld from './5N1J-4Old'
export const dateDePublication = '12/07/2026'
export const interactifReady = true

export const titre =
  "Trouver un nombre à l'aide d'un critère de divisibilité par $2$, par $5$ ou par $10$"

/**
 * @author Éric Elter
 */

export const uuid = '54140'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class TrouverNombre2ou5ou10Old extends TrouverNombreOld {
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
