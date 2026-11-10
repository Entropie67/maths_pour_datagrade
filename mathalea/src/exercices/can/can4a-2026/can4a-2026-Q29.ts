import { tableau2x2 } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter un tableau de proportionnalité'
export const interactifReady = true

export const uuid = 'xbhcx'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ29 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      // Cas simples avec coefficient multiplicateur entier ou décimal simple
      const listeCas = [
        [4, 15, 10, 6], // 4×15÷10 = 6
        [3, 20, 10, 6], // 3×20÷10 = 6
        [5, 12, 10, 6], // 5×12÷10 = 6
        [6, 15, 10, 9], // 6×15÷10 = 9
        [8, 15, 10, 12], // 8×15÷10 = 12
        [2, 15, 10, 3], // 2×15÷10 = 3
        [7, 20, 10, 14], // 7×20÷10 = 14
        [9, 20, 10, 18], // 9×20÷10 = 18
      ]

      const cas = choice(listeCas)
      a = cas[0]
      c = cas[2]
      b = cas[1]
      d = cas[3]
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = d

    const [L0C0, L0C1, L1C0, L1C1] = [a, '?', c, b].map((el) =>
      Object.assign({}, { content: `${el}`, latex: true }),
    )
    const tableau = tableau2x2(
      { L0C0, L0C1, L1C0, L1C1 },
      this.numeroExercice ?? 0,
      0,
      false,
      'tableauMathlive',
    )

    this.question = `On donne le tableau de proportionnalité : <br>${tableau} `
    this.correction = `On utilise l'égalité des produits en croix :<br>
$${a}\\times ${b} = \\text{?}\\times ${c}$<br>
$${a * b} = \\text{?}\\times ${c}$<br>
$\\text{?} = ${a * b}\\div ${c}$<br>
$\\text{?} = ${miseEnEvidence(texNombre(d, 2))}$`

    this.canReponseACompleter = '$?=\\ldots$'

    this.question += `$\\text{ ? }=$ ${!this.interactif ? ' $\\ldots$' : ''}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 15, 10, 6)
    else this.enonce()
  }
}
