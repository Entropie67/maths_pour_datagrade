import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Additionner des fractions'
export const interactifReady = true

export const uuid = '9bbc7'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class additionnerFrac extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const listeFractions = this.canOfficielle
      ? [[5, 6, 1, 4, 12]]
      : [
          [5, 6, 1, 4, 12],
          [5, 6, 3, 4, 12],
          [7, 6, 3, 4, 12],
          [1, 6, 1, 4, 12],
          [11, 6, 1, 4, 12],
          [5, 9, 1, 6, 18],
          [2, 9, 1, 6, 18],
          [4, 9, 1, 6, 18],
          [4, 9, 5, 6, 18],
          [2, 9, 5, 6, 18],
          [3, 10, 3, 4, 20],
          [7, 10, 3, 4, 20],
          [9, 10, 5, 4, 20],
          [3, 10, 1, 6, 30],
          [7, 10, 5, 6, 30],
        ]
    const a = choice(listeFractions)
    const choix = choice([true, false])
    const b = this.canOfficielle
      ? new FractionEtendue(5, 6)
      : new FractionEtendue(a[0], a[1])
    const c = this.canOfficielle
      ? new FractionEtendue(1, 4)
      : new FractionEtendue(a[2], a[3])
    this.reponse = new FractionEtendue(
      b.n * c.d + c.n * b.d,
      b.d * c.d,
    ).simplifie()
    this.question = `Écrire sous la forme d'une fraction irréductible : <br>
          $${choix ? `${b.texFraction} + ${c.texFraction}=` : `${c.texFraction} + ${b.texFraction}=`}$
             `
    this.correction = `Pour additionner des fractions, on les met au même dénominateur.<br>
  Le plus petit dénominateur commun est $${a[4]}$.<br>
             Ainsi, <br>
           $\\begin{aligned}
           ${choix ? `${b.texFraction} + ${c.texFraction}` : `${c.texFraction} + ${b.texFraction}`}&=
           ${choix ? `\\dfrac{${texNombre((b.n * a[4]) / b.d, 0)}}{${a[4]}} + \\dfrac{${texNombre((c.n * a[4]) / c.d, 0)}}{${a[4]}}` : ` \\dfrac{${texNombre((c.n * a[4]) / c.d, 0)}}{${a[4]}}+\\dfrac{${texNombre((b.n * a[4]) / b.d, 0)}}{${a[4]}} `}\\\\
           &=${miseEnEvidence(`${new FractionEtendue(b.n * c.d + c.n * b.d, b.d * c.d).simplifie().texFraction}`)}\\text{(fraction irréductible)}
           \\end{aligned}$
             
             
            `
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }

    this.canEnonce = `Écrire sous la forme d'une fraction irréductible : <br>
    $${choix ? `${b.texFraction} + ${c.texFraction}` : `${c.texFraction} + ${b.texFraction}`}$
       `
  }
}
