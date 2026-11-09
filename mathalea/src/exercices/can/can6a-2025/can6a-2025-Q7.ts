import Can2025CE2Q5 from '../canCE2a-2025/canCE2-2025-Q5'

export const titre = 'Multiple simple'
export const interactifReady = true

export const uuid = 'dce62'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025N62Q7 extends Can2025CE2Q5 {
  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 16)
    else this.enonce()
  }
}
