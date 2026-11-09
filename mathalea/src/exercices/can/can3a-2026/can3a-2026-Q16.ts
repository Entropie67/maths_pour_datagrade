import { tableau2x2 } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter un tableau de proportionnalité'
export const interactifReady = true

export const uuid = '3fl04'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      // 8 cas : calculs simples MAIS aucune simplification possible
      // Pas de diviseur commun entre les nombres d'une ligne ou colonne
      // Format : [a, b, c, d] où on cherche d avec a×b÷c
      const listeCas = [
        [7, 6, 10, 4.2], // 7×6÷10 = 42÷10 = 4,2 (pas de simplification)
        [9, 4, 10, 3.6], // 9×4÷10 = 36÷10 = 3,6 (pas de simplification)
        [7, 9, 10, 6.3], // 7×9÷10 = 63÷10 = 6,3 (pas de simplification)

        [7, 8, 10, 5.6], // 7×8÷10 = 56÷10 = 5,6 (pas de simplification)

        [7, 4, 10, 2.8], // 7×4÷10 = 28÷10 = 2,8 (pas de simplification)
        [6, 7, 10, 4.2], // 6×7÷10 = 42÷10 = 4,2 (pas de simplification)

        [3, 6, 4, 4.5],
        [5, 6, 4, 7.5],
        [7, 6, 4, 10.5],
      ]

      const cas = choice(listeCas)
      a = cas[0]
      b = cas[1]
      c = cas[2]
      d = cas[3]
    }

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

    this.question += `$\\text{ ? }=$ ${!this.interactif ? ' \\ldots' : ''}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, 3, 10, 2.1)
    else this.enonce()
  }
}
