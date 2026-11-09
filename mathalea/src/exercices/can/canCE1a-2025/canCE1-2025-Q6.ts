import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver un nombre (QCM)'
export const interactifReady = true

export const uuid = 'e6d64'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2025CE2Q6 extends ExerciceCan {
  enonce(a?: number, b?: number, nbre?: number) {
    if (a == null || b == null || nbre == null) {
      a = randint(6, 8) * 100 + 9 * 10 + randint(1, 9)
      b = a + 10
      nbre = a + randint(3, 9)
    }
    this.question = `Coche le nombre qui est entre $${a}$ et $${b}$.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$${nbre}$`,
          statut: true,
        },
        {
          texte: `$${a - 9}$`,
          statut: false,
        },
        {
          texte: `$${b + 80}$`,
          statut: false,
        },
      ],
      options: { vertical: false },
    }
    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = nbre // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.
    this.question += `${monQcm.texte}`
    this.canEnonce = `Coche le nombre qui est entre $${a}$ et $${b}$.`

    this.correction =
      monQcm.texteCorr +
      `$${nbre}$ est plus petit que $${b}$ et plus grand que $${a}$, donc le nombre qui est entre $${a}$ et $${b}$ est : $${miseEnEvidence(nbre)}$.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(794, 804, 799)
    else this.enonce()
  }
}
