import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver le résultat le plus petit (QCM)'
export const interactifReady = true

export const uuid = '225c1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE1Q2 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      a = randint(4, 7)
      b = randint(4, 7)
      c = randint(4, 8)
      d = randint(4, 8)
      // On s'assure que les deux résultats sont différents
      while (a * b === c * d) {
        d = randint(4, 8)
      }
    }
    const res1 = a * b
    const res2 = c * d
    const plusPetit = Math.min(res1, res2)
    const reponse1 = `$${a}\\times ${b}$`
    const reponse2 = `$${c}\\times ${d}$`
    const plusPetitOperation =
      plusPetit === res1 ? `${a}\\times ${b}` : `${c}\\times ${d}`
    this.question = `Entoure le résultat le plus petit.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: reponse1,
          statut: res1 === plusPetit,
        },
        {
          texte: reponse2,
          statut: res2 === plusPetit,
        },
      ],
      options: { vertical: false },
    }
    this.formatInteractif = 'qcm'
    const monQcm = propositionsQcm(this, 0)
    this.reponse = plusPetit
    this.question += `${monQcm.texte}`
    this.canEnonce = `Coche le résultat le plus petit.`

    this.correction =
      monQcm.texteCorr +
      `$${a}\\times ${b}=${res1}$ et $${c}\\times ${d}=${res2}$.<br>` +
      `Le résultat le plus petit est : $${miseEnEvidence(plusPetitOperation)}$.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 4, 4, 6)
    else this.enonce()
  }
}
