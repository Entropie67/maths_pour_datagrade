import Can2025CE2Q5 from '../canCE2a-2025/canCE2-2025-Q5'

export const titre = 'Multiple simple'
export const interactifReady = true

export const uuid = 'c3917'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025NCE2Q1 extends Can2025CE2Q5 {
  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 25)
    else this.enonce()
  }
}
