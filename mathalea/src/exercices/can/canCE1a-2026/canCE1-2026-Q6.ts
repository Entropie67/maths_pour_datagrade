import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver un nombre compris entre deux autres (QCM)'
export const interactifReady = true

export const uuid = 'baeec'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE1Q6 extends ExerciceCan {
  enonce(
    a?: number,
    b?: number,
    nbre?: number,
    prop2?: number,
    prop3?: number,
  ) {
    if (
      a == null ||
      b == null ||
      nbre == null ||
      prop2 == null ||
      prop3 == null
    ) {
      a = randint(60, 80) * 10 + randint(1, 9)
      b = a + randint(8, 15)
      nbre = a + randint(2, 6)
      prop2 = a - randint(80, 110)
      prop3 = b + randint(10, 90)
    }

    this.question = `Entoure le nombre qui est entre $${a}$ et $${b}$.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$${nbre}$`,
          statut: true,
        },
        {
          texte: `$${prop2}$`,
          statut: false,
        },
        {
          texte: `$${prop3}$`,
          statut: false,
        },
      ],
      options: { vertical: true },
    }
    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = nbre
    this.question += `${monQcm.texte}`
    this.canEnonce = `Entoure le nombre qui est entre $693$ et $706$.`
    this.canReponseACompleter = monQcm.texte

    this.correction =
      monQcm.texteCorr +
      `$${nbre}$ est plus grand que $${a}$ et plus petit que $${b}$, donc le nombre qui est entre $${a}$ et $${b}$ est : $${miseEnEvidence(nbre)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(693, 706, 700, 684, 794)
    else this.enonce()
  }
}
