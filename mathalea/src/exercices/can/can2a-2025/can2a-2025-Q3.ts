import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Développer une expression'
export const interactifReady = true

export const uuid = 'f3208'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Developper extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'Forme développée et réduite de  $(x-2)(x+3)$'
      this.correction = `$\\begin{aligned}
      (x-2)(x+3)&=x^2+3x-2x-6\\\\
      &=${miseEnEvidence('x^2+x-6')}
      \\end{aligned}$`
      this.correction += '<br>Le terme en $x^2$ vient de $x\\times x=x^2$.'
      this.correction +=
        '<br>Le terme en $x$ vient de la somme de $3 \\times x$ et de $-2 \\times x$.'
      this.correction += '<br>Le terme constant vient de $-2\\times 3=6$.'
      this.reponse = {
        reponse: { value: reduirePolynomeDegre3(0, 1, 1, -6, 'x') },
      }
      if (this.interactif) {
        this.question += '<br>$(x-2)(x+3)=$'
      }
    } else {
      const a = 1
      const b = randint(-9, 9, 0)
      const c = 1
      const d = randint(-5, 5, [0, b])
      this.question = `Forme développée et réduite de $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$`
      this.correction = `$\\begin{aligned}
      (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}\\\\
      &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
      \\end{aligned}$`
      this.correction += `<br>Le terme en $x^2$ vient de $x\\times x=${rienSi1(a * c)}x^2$.`
      this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${c === 1 ? '' : `${ecritureParentheseSiNegatif(c)}`}x$.`
      this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}= ${b * d}$.`
      this.reponse = {
        reponse: {
          value: reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d, 'x'),
        },
      }
      if (this.interactif) {
        this.question += `<br>$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=$`
      }
    }
  }
}
