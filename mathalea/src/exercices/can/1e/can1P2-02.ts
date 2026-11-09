import Decimal from 'decimal.js'
import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une espérance'
export const interactifReady = true

export const dateDePublication = '11/04/2024'
export const uuid = 'b8fc9'
export const refs = {
  'fr-fr': ['can1P2-02', '1Tec-P43'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class esperance extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = new Decimal(5 * this.quotaRandint('a', 1, 5)).div(100)
    const b = new Decimal(5 * this.quotaRandint('b', 1, 5)).div(100)
    const c = new Decimal(a).plus(b).mul(-1).plus(1)
    const listeValeurs = [
      [-2, 0, 1],
      [-1, 0, 1],
      [-2, -1, 0],
      [0, 1, 2],
      [-2, 0, 2],
    ]
    const val = this.quotaChoice('val', listeValeurs)
    this.reponse = texNombre(
      a.mul(val[0]).plus(b.mul(val[1])).plus(c.mul(val[2])),
      2,
    )
    this.question =
      "On donne la loi de probabilité d'une variable aléatoire $X$.<br>"
    this.question +=
      tableauColonneLigne(
        ['x_i', `${val[0]}`, `${val[1]}`, `${sp(4)}${val[2]}${sp(4)}`],
        ['P(X=x_i)'],
        [`${texNombre(a, 2)}`, `${texNombre(b, 2)}`, `${texNombre(c, 2)}`],
      ) + '<br>'

    this.correction = ` On calcule l'espérance mathématique de $X$ : <br>
    $\\begin{aligned}
      E(X) &=${val[0]}\\times ${texNombre(a, 2)} +${ecritureParentheseSiNegatif(val[1])}\\times ${texNombre(b, 2)}+${val[2]}\\times ${texNombre(c, 2)}\\\\
      E(X)&=${miseEnEvidence(this.reponse)}
      \\end{aligned}$
      `

    this.canEnonce =
      tableauColonneLigne(
        ['x_i', `${val[0]}`, `${val[1]}`, `${sp(4)}${val[2]}${sp(4)}`],
        ['P(X=x_i)'],
        [`${texNombre(a, 2)}`, `${texNombre(b, 2)}`, `${texNombre(c, 2)}`],
      ) + '<br>'
    this.canReponseACompleter = '$E(X)=\\ldots$'
    if (!this.interactif) {
      this.question += ' Calculer $E(X)$.'
    } else {
      this.question += '$E(X)=$'
    }
  }
}
