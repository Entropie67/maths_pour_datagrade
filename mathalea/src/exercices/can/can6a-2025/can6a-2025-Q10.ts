import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Ordre de grandeur'
export const interactifReady = true

export const uuid = '90671'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
const duree: [number, 'm' | 'cm' | 'km', string][] = [
  [2, 'm', "La longueur d'une table de salon peut mesurer :"],
  [70, 'km', 'La distance entre Gisors et Paris est :'],
  [4, 'm', "La hauteur d'une maison peut mesurer :"],
  [10, 'cm', "La hauteur d'une tasse peut mesurer :"],
  [10, 'm', "La profondeur d'un puits peut mesurer :"],
  [30, 'cm', 'Une feuille de papier peut mesurer :'],
  [6, 'km', "La hauteur d'une montagne peut mesurer :"],
  [4, 'm', 'Une voiture peut mesurer :'],
]
export default class Can2025N6Q10 extends ExerciceCan {
  enonce(a?: number, b?: 'm' | 'cm' | 'km', c?: string) {
    if (a == null || b == null || c == null) {
      ;[a, b, c] = choice(duree)
    }
    this.question = `Coche la bonne réponse.<br>
    ${c}`
    this.autoCorrection[0] = {
      enonce: this.question,
      options: { vertical: false },
      propositions: [
        {
          texte: `$${texNombre(a, 1)}\\text{ m}$`,
          statut: b === 'm',
        },
        {
          texte: `$${texNombre(a, 1)}\\text{ cm}$`,
          statut: b === 'cm',
        },
        {
          texte: `$${texNombre(a, 1)}\\text{ km}$`,
          statut: b === 'km',
        },
      ],
    }
    this.formatInteractif = 'qcm'

    const monQcm = propositionsQcm(this, 0)

    this.question += `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr +
      `${c} $${miseEnEvidence(`${texNombre(a, 1)}\\text{ ${b}}`)}$.`
    this.canEnonce = c
    this.canReponseACompleter = `\\faSquare[regular] $${texNombre(a, 1)}\\text{ m}$ <br>\\faSquare[regular] $${texNombre(a, 1)}\\text{ cm}$ <br>\\faSquare[regular] $${texNombre(a, 1)}\\text{ km}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 'm', 'Une voiture peut mesurer :')
    else this.enonce()
  }
}
