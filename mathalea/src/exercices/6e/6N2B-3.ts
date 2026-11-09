import MultiplierUnDecimalParPuissanceDeDix from './6AutoN4'
export const interactifReady = true

export const titre = 'Multiplier un décimal par $0{,}1$, $0{,}01$, $0{,}001$'
export const dateDePublication = '25/09/2026'

/**
 * @author Éric Elter
 */

export const uuid = '80304'

export const refs = {
  'fr-fr': ['6N2B-3'],
  'fr-ch': ['NR'],
}
export default class MultiplierUnDecimalParPuissanceDeDixNegative extends MultiplierUnDecimalParPuissanceDeDix {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = false
    this.sup2 = 2
    this.besoinFormulaire4CaseACocher = false
  }
}
