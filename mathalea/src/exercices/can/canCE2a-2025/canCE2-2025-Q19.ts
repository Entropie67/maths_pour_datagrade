import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Ordre de grandeur'
export const interactifReady = true

export const uuid = 'c9c44'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q19 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([-1, 1]) + randint(1, 4) * 10
      b = randint(3, 6) * 10
    }
    this.autoCorrection[0] = {
      propositions: [
        {
          texte: `$${texNombre(Math.round(a / 10) * 10 * b)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(b * 100 + a)}$`,
          statut: false,
        },
        {
          texte: `$${a + b}$`,
          statut: false,
        },
      ],
      options: { vertical: true },
    }
    const monQcm = propositionsQcm(this, 0)
    this.formatInteractif = 'qcm'
    this.consigne = `Quel est le nombre le plus proche de $${a}\\times ${b}$${sp()}?`
    this.correction = `$${a}$ est proche de $${Math.round(a / 10) * 10}$, donc $${a}\\times ${b}$ est proche de $${Math.round(a / 10) * 10}\\times ${b}$, soit $${miseEnEvidence(texNombre(Math.round(a / 10) * 10 * b, 0))}$.`
    this.canEnonce = this.consigne
    this.question = `${monQcm.texte}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(11, 50)
    else this.enonce()
  }
}
