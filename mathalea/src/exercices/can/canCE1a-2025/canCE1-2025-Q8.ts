import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Ordre de grandeur'
export const interactifReady = true

export const uuid = '8f99d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
const duree: [number, 's' | 'min' | 'h', string][] = [
  [90, 'min', "d'un match de football"],
  [8, 'h', "d'une journée de travail"],
  [2, 'h', "d'un film"],
  [20, 'min', "d'un trajet pour aller à l'école"],
  [13, 's', "d'un $100$ mètres par un athlète"],
  [30, 'min', "de cuisson d'un gâteau"],
  [45, 's', "d'un générique de dessin animé"],
]
export default class Can2025CE1Q8 extends ExerciceCan {
  enonce(a?: number, b?: 's' | 'min' | 'h', c?: string) {
    if (a == null || b == null || c == null) {
      ;[a, b, c] = choice(duree)
    }
    this.question = `Coche la durée possible ${c}.`
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$${texNombre(a, 1)}${sp()}\\text{s}$`,
          statut: b === 's',
        },
        {
          texte: `$${texNombre(a, 1)}${sp()}\\text{min}$`,
          statut: b === 'min',
        },
        {
          texte: `$${texNombre(a, 1)}${sp()}\\text{h}$`,
          statut: b === 'h',
        },
      ],
      options: { vertical: true },
    }
    this.formatInteractif = 'qcm'

    const monQcm = propositionsQcm(this, 0)

    this.question += `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr +
      `La durée possible ${c} est de $${miseEnEvidence(texNombre(a, 1))}$ ${b}.`
    this.canEnonce = `Coche la durée possible ${c}.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(15, 'min', "d'une récréation")
    else this.enonce()
  }
}
