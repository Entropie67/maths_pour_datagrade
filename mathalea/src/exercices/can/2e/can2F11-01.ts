import { bleuMathalea } from '../../../lib/colors'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une image avec un quotient'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021 modif le 21/01/24
*/
export const uuid = '8b3a9'

export const refs = {
  'fr-fr': ['can2F11-01', '2F13-flash1'],
  'fr-ch': [],
}
export default class CalculImageQuotient extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, c

    a = randint(1, 5)
    const b = randint(-7, 7, 0)
    c = randint(1, 6)
    const d = randint(-6, 6, [0, b])
    const x = randint(-3, 3, 0)
    while (c * x + d === 0) {
      c = randint(1, 4)
    }
    while (a * x + b === 0) {
      a = randint(1, 4)
    }
    const e = a * x + b
    const f = c * x + d
    const expression = `\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}`
    const maFraction = new FractionEtendue(e, f)
    this.reponse = new FractionEtendue(a * x + b, c * x + d).simplifie()
    this.question = `On considère la fonction ${context.isDiaporama ? '<br>' : ''} $f$ définie par $f(x)= ${expression}$. <br>
        Calculer $f(${x})$.`
    if (this.interactif) {
      this.question += '<br>'
      this.optionsChampTexte = { texteAvant: `$f(${x})=$` }
    }

    this.correction = `$f(${x})=\\dfrac{${a === 1 ? `${x}` : `${a}\\times ${ecritureParentheseSiNegatif(x)}`}${ecritureAlgebrique(b)}}{${c === 1 ? `${x}` : `${c}\\times ${ecritureParentheseSiNegatif(x)}`}${ecritureAlgebrique(d)}}
          =${maFraction.texFraction}${maFraction.texSimplificationAvecEtapes()}$.<br>
          Ainsi, $f(${x})=${miseEnEvidence(maFraction.texFractionSimplifiee)}$.<br><br>`
    this.correction += texteEnCouleur(
      ` Mentalement : <br>
          On calcule le numérateur et le dénominateur pour $x=${x}$, soit
           $ ${a}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${a * x + b}$ et $${c}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}=${c * x + d}$.<br>
           On obtient le quotient que l'on simplifie éventuellement : $${maFraction.texFractionSimplifiee}$.
    `,
      bleuMathalea,
    )
  }
}
