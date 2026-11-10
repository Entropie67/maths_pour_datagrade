import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir'
export const interactifReady = true

export const uuid = '87e45'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora
 */

const choix: [
  number,
  'mm' | 'dm' | 'cm' | 'm' | 'km',
  'dm' | 'mm' | 'cm' | 'm' | 'km',
  'dm' | 'mm' | 'cm' | 'm' | 'km',
][] = [
  [100, 'cm', 'm', 'mm'],
  [10, 'mm', 'cm', 'dm'],
  [1000, 'm', 'km', 'dm'],
  [1000, 'mm', 'm', 'km'],
  [10, 'mm', 'cm', 'dm'],
  [100, 'mm', 'dm', 'cm'],
  [1000, 'mm', 'm', 'cm'],
]
export default class Can2025CE2Q4 extends ExerciceCan {
  enonce(
    a?: number,
    b?: 'dm' | 'mm' | 'cm' | 'm' | 'km',
    c?: 'dm' | 'mm' | 'cm' | 'm' | 'km',
    d?: 'dm' | 'mm' | 'cm' | 'm' | 'km',
  ) {
    if (a == null || b == null || c == null || d == null) {
      ;[a, b, c, d] = choice(choix)
    }
    this.question = 'Coche la bonne réponse.'
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        {
          texte: `$1 \\text{ ${c}} = ${texNombre(a)} \\text{ ${b}}$`,
          statut: true,
        },
        {
          texte: `$1 \\text{ ${c}} = ${texNombre(a)} \\text{ ${d}}$`,
          statut: false,
        },
      ],
      options: { vertical: true },
    }
    const monQcm = propositionsQcm(this, 0)
    this.formatInteractif = 'qcm'
    this.question += monQcm.texte

    this.reponse = `${texNombre(a, 1)} ${b}` // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.

    this.canEnonce = 'Coche la bonne réponse.'

    this.correction =
      monQcm.texteCorr +
      `$1 \\text{ ${c}} = ${miseEnEvidence(`${texNombre(a)} \\text{ ${b}}`)}$. Pour passer des $\\text{${b}}$ au $\\text{${c}}$, on multiplie par $${texNombre(a, 0)}$.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(100, 'cm', 'm', 'mm')
    else this.enonce()
  }
}
