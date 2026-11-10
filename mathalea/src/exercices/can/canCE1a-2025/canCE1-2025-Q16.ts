import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer avec des dizaines'
export const interactifReady = true

export const uuid = '40bfb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q16 extends ExerciceCan {
  enonce(a?: number, diz?: number) {
    if (a == null || diz == null) {
      a = 100 + randint(5, 9) * 10 + randint(1, 9)
      diz = randint(2, 5)
    }

    this.reponse = a - 10 * diz
    this.question = `Calcule $${a}-${diz}$ dizaines. `
    this.correction = `$${a}-${diz}$ dizaines est égal à $${a}-\\underbrace{${diz}\\times 10}_{${diz} \\text{ dizaines}}=${miseEnEvidence(a - 10 * diz)}$.`

    this.canEnonce = 'Calcule.'
    this.canReponseACompleter = `$${a}-${diz}$ dizaines $=\\ldots$ `
    if (this.interactif) {
      this.question += ' <br> '
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(159, 5)
    else this.enonce()
  }
}
