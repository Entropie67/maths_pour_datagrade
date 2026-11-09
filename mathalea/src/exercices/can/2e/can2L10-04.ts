import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { shuffle } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
export const titre = 'Développer avec la double distributivité'
export const interactifReady = true

export const dateDePublication = '07/04/2024'
export const dateDeModifImportante = '25/03/2026'
export const uuid = '69fed'
export const refs = {
  'fr-fr': ['can2L10-04', 'BP1AUTO083', '2L11-flash4'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class DeveloppementDouble extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.versionQcmDisponible = true
    this.optionsDeComparaison = { expressionsForcementReduites: true }
  }

  nouvelleVersion() {
    let expression = ''
    switch (this.quotaChoice('type', [1, 2, 3])) {
      case 1: // (ax+b)(cx+d) avec a et c =1
        {
          const a = 1
          const b = randint(-10, 10, 0)
          const c = 1
          const d = randint(-10, 10, [0, b, -b])
          this.reponse = reduirePolynomeDegre3(0, 1, b + d, b * d)
          let tableau = [
            `$${reduirePolynomeDegre3(0, 1, b * d, b * d)}$`,
            `$${reduirePolynomeDegre3(0, 1, b + d, b + d)}$`,
            `$${reduirePolynomeDegre3(0, 2, b * d, b + d)}$`,
          ]
          tableau = shuffle(tableau)
          this.distracteurs = distracteursDistincts(
            this.reponse as string,
            tableau,
            [
              `$${reduirePolynomeDegre3(0, 1, b + d, -b * d)}$`,
              `$${reduirePolynomeDegre3(0, 1, -b - d, b * d)}$`,
              `$${reduirePolynomeDegre3(0, 1, b + d + 1, b * d)}$`,
            ],
          )
          expression = `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})`
          this.question = `Développer et réduire l'expression $${expression}$.`
          this.correction = `$\\begin{aligned}
            (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}\\\\
            &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
            \\end{aligned}$`
          this.correction += `<br>Le terme en $x^2$ vient de $${rienSi1(a)}x\\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}=${rienSi1(a * c)}x^2$.`
          this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}$.`
          this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}= ${b * d}$.`
        }
        break
      case 2: // (ax+b)(cx+d) avec a et c différent de 1
        {
          const a = randint(2, 4)
          const b = randint(-3, 3, 0)
          let c = randint(2, 4)
          const d = randint(-10, 10, [0, b, -b])
          if (a === 2 && c === 2) {
            c = 3
          } // pour éviter a=c=2 car a+b=a*c
          this.reponse = reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d)
          let tableau = [
            `$${reduirePolynomeDegre3(0, a * c, b * d, b * d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * c + a * d, b + d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * c + a * d, b * d)}$`,
            `$${reduirePolynomeDegre3(0, a * c, b * c + a * d, b + d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * d, b + d)}$`,
          ]
          tableau = shuffle(tableau)
          this.distracteurs = distracteursDistincts(
            this.reponse as string,
            tableau,
            [
              `$${reduirePolynomeDegre3(0, a * c, b * c - a * d, b * d)}$`,
              `$${reduirePolynomeDegre3(0, a * c, b * c + a * d, -b * d)}$`,
              `$${reduirePolynomeDegre3(0, a * c, b * c + a * d + 1, b * d)}$`,
            ],
          )
          expression = `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})`
          this.question = `Développer et réduire l'expression $${expression}$.`
          this.correction = `$\\begin{aligned}
            (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}\\\\
            &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
            \\end{aligned}$`
          this.correction += `<br>Le terme en $x^2$ vient de $${rienSi1(a)}x\\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}=${rienSi1(a * c)}x^2$.`
          this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}$.`
          this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}= ${b * d}$.`
        }
        break
      case 3: // (b+ax)(d+cx) avec a et c différent de 1
        {
          const a = randint(1, 2)
          const b = randint(-3, 3, 0)
          const c = randint(1, 2)
          const d = randint(-10, 10, [0, b, -b])
          this.reponse = reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d)
          let tableau = [
            `$${reduirePolynomeDegre3(0, a * c, b * d, b * d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * c + a * d, b + d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * c + a * d, b * d)}$`,
            `$${reduirePolynomeDegre3(0, a * c, b * c + a * d, b + d)}$`,
            `$${reduirePolynomeDegre3(0, a + c, b * d, b + d)}$`,
          ]
          tableau = shuffle(tableau)
          this.distracteurs = distracteursDistincts(
            this.reponse as string,
            tableau,
            [
              `$${reduirePolynomeDegre3(0, a * c, b * c - a * d, b * d)}$`,
              `$${reduirePolynomeDegre3(0, a * c, b * c + a * d, -b * d)}$`,
              `$${reduirePolynomeDegre3(0, a * c, b * c + a * d + 1, b * d)}$`,
            ],
          )
          expression = `(${b}${ecritureAlgebriqueSauf1(a)}x)(${reduireAxPlusB(c, d)})`
          this.question = `Développer et réduire l'expression $${expression}$.`
          this.correction = `$\\begin{aligned}
            (${b}${ecritureAlgebriqueSauf1(a)}x)(${reduireAxPlusB(c, d)})&=${rienSi1(b * c)}x${ecritureAlgebrique(b * d)}${ecritureAlgebriqueSauf1(a * c)}x^2${ecritureAlgebrique(a * d)}x\\\\
            &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
            \\end{aligned}$`
          this.correction += `<br>Le terme en $x^2$ vient de $${rienSi1(a)}x\\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}=${rienSi1(a * c)}x^2$.`
          this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${c === 1 ? 'x' : `${ecritureParentheseSiNegatif(c)}x`}$.`
          this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}= ${b * d}$.`
        }
        break
    }
    if (this.versionQcm) this.reponse = '$' + this.reponse + '$'
    if (!this.versionQcm) {
      this.optionsChampTexte = { texteAvant: `<br>$${expression}=$` }
    }
    this.canEnonce = this.question
    this.canReponseACompleter = ''
  }
}
