import { randint } from '../../../modules/outils'
import Can2025CE2Q1 from './canCE2-2025-Q1'

export const titre = 'Complément à la centaine supérieure'
export const interactifReady = true

export const uuid = '5514f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q9 extends Can2025CE2Q1 {
  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce(350, 500)
    } else {
      const a = randint(2, 6) * 100 + randint(2, 6) * 10
      const b = Math.round(Math.ceil(a / 100) * 100) + randint(1, 2) * 100
      this.enonce(a, b)
    }
  }
}
