import { tableau2x2 } from '../../lib/2d/tableau'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'acaa5'
export const refs = {
  'fr-fr': ['3AutoP02-2'],
  'fr-ch': ['9R1FA1B-5', '9R2FA1B-5', '9R3FA1B-5', 'PRQPF03A-10'],
}
export const interactifReady = true
export const titre =
  'Calculer une quatrième proportionnelle à trois nombres donnés'
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 3
 * @author Jean-Claude Lhote
 */
export default class AutoQ3MetropoleBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      const coeff = choice([2, 3, 4, 5])
      const coeff2 = choice([2, 3, 4, 5], [coeff])
      a = randint(5, 9)
      b = a * coeff
      c = a * coeff2
    }

    this.question = deuxColonnesResp(
      `On considère le tableau de proportionnalité ci-contre.<br>
      Combien vaut $a$ ?`,
      tableau2x2(
        {
          L0C0: {
            content: a.toString(),
            latex: true,
          },
          L0C1: {
            content: b.toString(),
            latex: true,
          },
          L1C0: {
            content: c.toString(),
            latex: true,
          },
          L1C1: {
            content: 'a',
            latex: true,
          },
        },
        this.numeroExercice ?? 0,
        0,
        false,
        '',
      ),
      { largeur1: 60, widthmincol1: '300px', widthmincol2: '200px' },
    )
    this.reponse = texNombre((b * c) / a, 0)
    this.correction = `Pour calculer la quatrième proportionnelle, on utilise la propriété de proportionnalité :<br>
    $\\dfrac{${c}}{${a}} = \\dfrac{a}{${b}}$<br>
    En multipliant en croix, on obtient :<br>
    $${a} \\times a  = ${b} \\times ${c}$<br>
    Donc :<br>
    $a= \\dfrac{${b} \\times ${c}}{${a}}$<br>
    $a = \\dfrac{${texNombre(b * c)}}{${a}} = ${miseEnEvidence(texNombre((b * c) / a, 0))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(6, 18, 12)
    } else {
      this.enonce()
    }
  }
}
