import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Choisir un nombre vérifiant trois conditions (QCM)'
export const interactifReady = true

export const uuid = 'a12ef'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2026CE1Q5 extends ExerciceCan {
  enonce(
    c?: number,
    d?: number,
    u?: number,
    reference?: number,
    choixConditions?: number,
    prop2?: number,
    prop3?: number,
  ) {
    const situations = [
      // [c, d, u, reference, choixConditions (1:c+d, 2:c+u, 3:d+u), prop2, prop3]
      [3, 6, 3, 354, 2, 353, 303], // Officiel: c=3, u=3, après 354 → 363
      [5, 4, 3, 538, 2, 503, 535], // c=5, u=3, après 538 → 543
      [4, 5, 2, 428, 2, 427, 423], // c=4, u=2, après 428 → 452
      [2, 7, 4, 265, 2, 264, 284], // c=2, u=4, après 265 → 274
      [6, 3, 5, 612, 2, 605, 625], // c=6, u=5, après 612 → 635
      [3, 8, 2, 375, 1, 382, 362], // c=3, d=8, après 375 → 382
      [5, 6, 7, 542, 1, 557, 577], // c=5, d=6, après 542 → 567
      [4, 4, 6, 432, 3, 346, 644], // d=4, u=6, après 432 → 446
      [7, 5, 3, 738, 3, 743, 753], // d=5, u=3, après 738 → 753
      [2, 3, 8, 225, 3, 318, 338], // d=3, u=8, après 225 → 238
    ]

    let situationChoisie
    if (
      c == null ||
      d == null ||
      u == null ||
      reference == null ||
      choixConditions == null
    ) {
      situationChoisie = choice(situations)
      c = situationChoisie[0]
      d = situationChoisie[1]
      u = situationChoisie[2]
      reference = situationChoisie[3]
      choixConditions = situationChoisie[4]
      prop2 = situationChoisie[5]
      prop3 = situationChoisie[6]
    }

    const nbre = c * 100 + d * 10 + u

    let enonce = 'Entoure le nombre qui a '

    if (choixConditions === 1) {
      // Donne centaines et dizaines
      enonce += `$${c}$ pour chiffre des centaines, $${d}$ pour chiffre des dizaines`
    } else if (choixConditions === 2) {
      // Donne centaines et unités
      enonce += `$${c}$ pour chiffre des centaines, $${u}$ pour chiffre des unités`
    } else {
      // Donne dizaines et unités
      enonce += `$${d}$ pour chiffre des dizaines, $${u}$ pour chiffre des unités`
    }

    enonce += ` et qui vient juste après $${reference}$.`

    this.question = enonce
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
    this.canEnonce =
      'Entoure le nombre qui a $3$ pour chiffre des centaines, $3$ pour chiffre des unités et qui vient juste après $354$.'
    this.canReponseACompleter = monQcm.texte

    this.correction =
      monQcm.texteCorr +
      `Le nombre recherché est $${miseEnEvidence(nbre)}$ car il respecte les conditions données et $${nbre}$ vient juste après $${reference}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 6, 3, 354, 2, 353, 303)
    else this.enonce()
  }
}
