import Decimal from 'decimal.js'
import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une espérance'
export const interactifReady = true

export const uuid = 'd5ba3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Esperance extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: Decimal
    let b: Decimal
    let c: Decimal
    if (this.canOfficielle) {
      a = new Decimal(0.25)
      b = new Decimal(0.25)
      c = new Decimal(0.5)
    } else {
      a = new Decimal(5 * randint(1, 5)).div(100)
      b = new Decimal(5 * randint(1, 5)).div(100)
      c = new Decimal(a).plus(b).mul(-1).plus(1)
    }
    const reponse = c.mul(2).add(b)
    this.question =
      tableauColonneLigne(
        ['x_i', '0', '1', `${sp(4)}2${sp(4)}`],
        ['P(X=x_i)'],
        [`${texNombre(a, 2)}`, `${texNombre(b, 2)}`, `${texNombre(c, 2)}`],
      ) + '<br>'
    this.question += '<br> $E(X)=$'
    this.correction = ` On calcule l'espérance mathématique de $X$ : <br>
    $\\begin{aligned}
      E(X) &=0\\times ${texNombre(a, 2)} +1\\times ${texNombre(b, 2)}+2\\times ${texNombre(c, 2)}\\\\
      &=${miseEnEvidence(texNombre(reponse, 2))}
      \\end{aligned}$
      `
    this.reponse = reponse
    this.canEnonce =
      tableauColonneLigne(
        ['x_i', '0', '1', `${sp(4)}2${sp(4)}`],
        ['P(X=x_i)'],
        [`${texNombre(a, 2)}`, `${texNombre(b, 2)}`, `${texNombre(c, 2)}`],
      ) + '<br>'
    this.canReponseACompleter = '$E(X)=\\ldots$'
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
