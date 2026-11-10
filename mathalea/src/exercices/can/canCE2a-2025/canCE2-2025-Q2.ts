import Can2025N5Q1 from '../can5a-2025/can5a-2025-Q1'

export const titre = 'Tables de multiplication'
export const interactifReady = true

export const uuid = '5160f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025NCE2Q2 extends Can2025N5Q1 {
  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 7)
    else this.enonce()
  }
}
