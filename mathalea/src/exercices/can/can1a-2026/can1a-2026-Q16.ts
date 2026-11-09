import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer p dans l'équation réduite d'une droite"
export const interactifReady = true

export const uuid = 'kfw1v'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(m?: number, a?: number, b?: number, nomP?: string): void {
    if (m == null || a == null || b == null || nomP == null) {
      m = randint(-6, -2)
      a = randint(4, 9)
      b = randint(-4, 8, 0)
      nomP = choice(['A', 'B', 'C'])
    }

    const p = b - m * a

    this.reponse = texNombre(p, 0)
    this.question = `$d$ est la droite qui a pour équation $y=${rienSi1(m)}x+p$ et passant par le point $${nomP}(${a}\\,;\\,${b})$.<br>`
    this.correction = `Comme $${nomP}(\\underbrace{${a}}_{x}\\,;\\,\\underbrace{${b}}_{y})$ est sur la droite, ses coordonnées vérifient l'équation de la droite :<br>
    $\\begin{aligned}
    ${b}&=${m}\\times ${ecritureParentheseSiNegatif(a)}+p\\\\
    ${b}&= ${m * a}+p\\\\
    p&=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
    if (this.interactif) {
      this.question += '$p=$'
    } else {
      this.question += '$p=\\ldots$'
    }
    this.canEnonce = `$d$ est la droite qui a pour équation $y=${rienSi1(m)}x+p$ et passant par le point $${nomP}(${a}\\,;\\,${b})$.`
    this.canReponseACompleter = '$p=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-4, 7, -6, 'B')
    else this.enonce()
  }
}
