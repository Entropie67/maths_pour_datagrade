import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer le coefficient directeur d'une droite (calcul)"
export const interactifReady = true

export const uuid = 'czskl'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(xP?: number, yP?: number, xQ?: number, yQ?: number): void {
    if (xP == null || yP == null || xQ == null || yQ == null) {
      xP = randint(1, 9)
      yP = randint(1, 9)
      xQ = randint(1, 9, xP)
      yQ = randint(1, 9, yP)
    }

    const m = new FractionEtendue(yQ - yP, xQ - xP)

    this.reponse = m

    this.question = `Coefficient directeur de la droite $(PQ)$ avec $P(${xP}\\,;\\,${yP})$ et $Q(${xQ}\\,;\\,${yQ})$`

    if (yQ === yP) {
      this.correction = `Comme $y_P=y_Q$, la droite $(PQ)$ est horizontale, son coefficient directeur est nul.<br>
      Ainsi, $m=${miseEnEvidence('0')}$`
    } else {
      this.correction = `Le coefficient directeur $m$ de la droite $(PQ)$ est donné par la formule : $\\dfrac{y_Q-y_P}{x_Q-x_P}$.<br>
      $\\begin{aligned}
      m&=\\dfrac{${yQ}-${ecritureParentheseSiNegatif(yP)}}{${xQ}-${ecritureParentheseSiNegatif(xP)}}\\\\
      &= \\dfrac{${yQ - yP}}{${xQ - xP}}\\\\
      &=${miseEnEvidence(m.texFractionSimplifiee)}
      \\end{aligned}$`
    }

    this.canReponseACompleter = '$m=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, 4, 5, 2)
    else this.enonce()
  }
}
