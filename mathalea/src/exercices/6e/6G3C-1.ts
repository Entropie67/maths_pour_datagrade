import RegionsDuPlan from './6G2C-1'

export const titre = 'Identifier une région du plan'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '01/11/2026'

/**
 * @author Éric Elter
 */

export const uuid = '25f5e'

export const refs = {
  'fr-fr': ['6G3C-1'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2D-5', '9R2ES2D-5', '9R3ES2D-5'],
}

export default class RegionsDuPlanMediatrices extends RegionsDuPlan {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de régions',
      [
        'Nombres séparés par des tirets :',
        '8 : Médiatrice (une condition)',
        '9 : Demi-plan délimité par une médiatrice (une condition)',
      ].join('\n'),
    ]
    this.sup = '8-9'
  }
}
