import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import Trinome from '../../../modules/Trinome'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = 'jn0gl'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q7 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecX
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(b?: number, val?: number): void {
    if (b == null || val == null) {
      b = randint(-6, -1)
      val = randint(-5, -1)
    }
    const p = new Trinome(1, b, 0)

    const resultat = val ** 2 + b * val
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = resultat.toString()
    this.question = `$f(x)=${p.tex}$<br>$f(${val})=\\ldots$`
    this.correction = `$f(${val})=${ecritureParentheseSiNegatif(val)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(val)}=
    ${val ** 2}${ecritureAlgebrique(b * val)}=${resultat}$<br>
    On a donc $f(${val})=${miseEnEvidence(resultat)}$.`
    this.canEnonce = `$f(x)=${p.tex}$`
    this.canReponseACompleter = `$f(${val})=\\ldots$`

    if (this.interactif) {
      this.question = `$f(x)=${p.tex}$<br>$f(${val})=$`
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, -3)
    else this.enonce()
  }
}
