import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer la valeur d'un paramètre pour que le point appartienne à un plan"
export const interactifReady = true

export const uuid = '69jkh'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ28 extends ExerciceCan {
  enonce(
    xM?: number,
    yM?: number,
    a?: number,
    b?: number,
    c?: number,
    d?: number,
  ): void {
    if (
      xM == null ||
      yM == null ||
      a == null ||
      b == null ||
      c == null ||
      d == null
    ) {
      xM = randint(-5, 5)
      yM = randint(-5, 5)
      a = randint(1, 4)
      b = randint(-4, 4, 0)
      c = randint(-4, 4, 0)
      d = randint(-9, 9)
    }

    // Formatage propre de l'équation du plan ax + by + cz + d = 0 avec les fonctions dédiées
    const eqPlanStr = `${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebriqueSauf1(c)}z${d === 0 ? '' : ecritureAlgebrique(d)}=0`

    // Calcul de la valeur de t
    const num = -a * xM - b * yM - d
    const tFraction = new FractionEtendue(num, c).simplifie()

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = tFraction.texFraction

    this.question = `Valeur de $t$ telle que le point $M$ de coordonnées $(${xM}\\;;\\;${yM}\\;;\\;t)$ appartienne au plan d'équation $${eqPlanStr}$`

    // Rédaction de la correction avec l'environnement aligned
    const xMstr = xM < 0 ? `(${xM})` : xM
    const yMstr = yM < 0 ? `(${yM})` : yM
    const constante = a * xM + b * yM + d

    this.correction = `Le point $M$ appartient au plan, donc ses coordonnées vérifient l'équation de ce plan :<br>`

    // Début du bloc aligné
    this.correction += `$\\begin{aligned}`
    this.correction += `${a === 1 ? '' : `${a}\\times`} ${xMstr} ${ecritureAlgebrique(b)}\\times ${yMstr} ${ecritureAlgebriqueSauf1(c)}t ${d === 0 ? '' : ecritureAlgebrique(d)} &= 0\\\\`

    const axM = a * xM
    const byM = b * yM
    this.correction += `${axM} ${ecritureAlgebrique(byM)} ${ecritureAlgebriqueSauf1(c)}t ${d === 0 ? '' : ecritureAlgebrique(d)} &= 0\\\\`

    if (constante !== 0) {
      this.correction += `${constante} ${ecritureAlgebriqueSauf1(c)}t &= 0\\\\`
    }

    this.correction += `${rienSi1(c)}t &= ${-constante}\\\\`
    this.correction += `t &= ${miseEnEvidence(tFraction.texFraction)}
    \\end{aligned}$`

    if (this.interactif) {
      this.question += '<br>$t=$'
    } else {
      this.question += '<br>$t=\\ldots$'
    }

    this.canEnonce = `Valeur de $t$ telle que le point $M$ de coordonnées $(${xM}\\;;\\;${yM}\\;;\\;t)$ appartienne au plan d'équation $${eqPlanStr}$`
    this.canReponseACompleter = '$t=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-1, 2, 2, -1, 3, 5)
    else this.enonce()
  }
}
