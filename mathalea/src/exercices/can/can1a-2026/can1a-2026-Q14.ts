import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner le nombre de solutions d'une équation du second degré"
export const interactifReady = true

export const uuid = '32mx4'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, c?: number): void {
    if (a == null || b == null || c == null) {
      a = randint(1, 3) * choice([-1, 1])
      b = randint(-4, 4, 0)
      c = randint(-4, 4, 0)
    }

    const d = b * b - 4 * a * c
    const introCorr = `Le nombre de solutions est donné par le signe du discriminant $\\Delta$ :<br>`

    this.question = `Donner le nombre de solutions réelles de l'équation $${reduirePolynomeDegre3(0, a, b, c)}=0$.`

    if (d < 0) {
      this.reponse = 0
      this.correction =
        introCorr +
        `
    $\\Delta =b^2-4ac=${ecritureParentheseSiNegatif(b)}^2 - 4 \\times ${ecritureParentheseSiNegatif(a)} \\times ${ecritureParentheseSiNegatif(c)}=${miseEnEvidence(d)}$.<br>
    Comme $${d}$ est strictement négatif, le nombre de solutions de l'équation est $${miseEnEvidence('0')}$.`
    }
    if (d > 0) {
      this.reponse = 2
      this.correction =
        introCorr +
        `
    $\\Delta =b^2-4ac=${ecritureParentheseSiNegatif(b)}^2 - 4 \\times ${ecritureParentheseSiNegatif(a)} \\times ${ecritureParentheseSiNegatif(c)}=${miseEnEvidence(d)}$.<br>
    Comme $${d}$ est strictement positif, le nombre de solutions de l'équation est $${miseEnEvidence('2')}$.`
    }
    if (d === 0) {
      this.reponse = 1
      this.correction =
        introCorr +
        `
    $\\Delta =b^2-4ac=${ecritureParentheseSiNegatif(b)}^2 - 4 \\times ${ecritureParentheseSiNegatif(a)} \\times ${ecritureParentheseSiNegatif(c)}=${miseEnEvidence(d)}$.<br>
    Comme $\\Delta$ est nul, le nombre de solutions de l'équation est $${miseEnEvidence('1')}$.`
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, -1, 4)
    else this.enonce()
  }
}
