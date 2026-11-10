import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { signe } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Réduire une expression littérale'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '23/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '97664'

export const refs = {
  'fr-fr': ['can4L2-04', '2L10-flash2'],
  'fr-ch': [],
}
export default class ReduireExp extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let a, b, c, choix, d, e
    let reponse
    switch (this.quotaRandint('cas', 1, 3)) {
      case 1: // ax+bx+c
        choix = choice([1, 2, 3]) // 1,2
        if (choix === 1) {
          a = randint(1, 10)
          b = randint(1, 10)
          c = randint(1, 10)
          this.question = `Écrire le plus simplement possible : <br>  
          $${rienSi1(a)}x+${rienSi1(b)}x+${texNombre(c)}$.`
          this.correction = `En regroupant les termes en $x$, on obtient : <br>
        $\\begin{aligned}
        ${rienSi1(a)}x+${rienSi1(b)}x+${texNombre(c)}&=(${a}+${b})x+${c}\\\\
        &=${miseEnEvidence(`${texNombre(a + b)}x+${texNombre(c)}`)}
        \\end{aligned}$`
        } else if (choix === 2) {
          a = randint(1, 5)
          b = randint(1, 5)
          c = randint(1, 5)
          this.question = `Écrire le plus simplement possible : <br>
          $${rienSi1(b)}x+${texNombre(c)}+${rienSi1(a)}x$.`
          this.correction = `En regroupant les termes en $x$, on obtient : <br>
        $\\begin{aligned}
        ${rienSi1(b)}x+${texNombre(c)}+${rienSi1(a)}x&=(${a}+${b})x+${c}\\\\
        &=${miseEnEvidence(`${texNombre(a + b)}x+${texNombre(c)}`)}
        \\end{aligned}$`
        } else {
          a = randint(-4, -1)
          b = randint(-4, -1)
          c = randint(1, 10)
          this.question = `Écrire le plus simplement possible : <br>
          $${rienSi1(b)}x+${texNombre(c)}${rienSi1(a)}x$.`
          this.correction = `En regroupant les termes en $x$, on obtient : <br>
          $\\begin{aligned}
          ${rienSi1(b)}x+${texNombre(c)}${rienSi1(a)}x&=(${a}${b})x+${c}\\\\
          &=${miseEnEvidence(`${texNombre(a + b)}x+${texNombre(c)}`)}
          \\end{aligned}$`
        }
        reponse = `${reduireAxPlusB(a + b, c, 'x')}`

        break

      case 2: // ax^2+bx+c+dx^2+/-x
        choix = choice([1, 2]) // 1,2
        if (choix === 1) {
          b = randint(1, 3)
          c = randint(1, 3)
          d = randint(1, 5)
          e = choice([-1, 1])
          a = randint(1, 4, d)
          this.question = `Écrire le plus simplement possible : <br>
          $${rienSi1(a)}x^2+${rienSi1(b)}x+${texNombre(c)}+${rienSi1(d)}x^2${signe(e)}x$.`
          if (b + e === 0) {
            this.correction = `En regroupant les termes en $x$ et les termes en $x^2$, on obtient : <br>
            $\\begin{aligned}
            ${rienSi1(a)}x^2+${rienSi1(b)}x+${texNombre(c)}+${rienSi1(d)}x^2+x&=(${a} + ${d})x^2+(${b}${ecritureAlgebrique(e)})x+${texNombre(c)}\\\\
            &=${miseEnEvidence(`${rienSi1(a + d)}x^2+${texNombre(c)}`)}
            \\end{aligned}$`
            reponse = `${texNombre(a + d)}x^2+${texNombre(c)}`
          } else {
            this.correction = `En regroupant les termes en $x$ et les termes en $x^2$, on obtient : <br>
            $\\begin{aligned}
            ${rienSi1(a)}x^2+${rienSi1(b)}x+${texNombre(c)}+${rienSi1(d)}x^2+x&=(${a} + ${d})x^2+(${b}${ecritureAlgebrique(e)})x+${texNombre(c)}\\\\
            &=${miseEnEvidence(`${rienSi1(a + d)}x^2+${rienSi1(b + e)}x+${texNombre(c)}`)}
            \\end{aligned}$`
          }
        } else {
          b = randint(-5, -2)
          c = randint(1, 5)
          d = randint(-5, -2)
          e = choice([-1, 1])
          a = randint(-5, 5, 0)
          this.question = `Écrire le plus simplement possible : <br>
          $${rienSi1(a)}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}${ecritureAlgebrique(d)}x^2${signe(e)}x$.`

          if (a + d === 0) {
            this.correction = `En regroupant les termes en $x$ et les termes en $x^2$, on obtient : <br>
            $\\begin{aligned}
            ${rienSi1(a)}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}${ecritureAlgebrique(d)}x^2+x&=
            (${a}${ecritureAlgebrique(d)})x^2+(${b}${ecritureAlgebrique(e)})x${ecritureAlgebrique(c)}\\\\
            &=${miseEnEvidence(`${ecritureAlgebrique(b + e)}x+${texNombre(c)}`)}\\end{aligned}$`
            reponse = `${rienSi1(b + e)}x+${texNombre(c)}`
          } else {
            this.correction = `En regroupant les termes en $x$ et les termes en $x^2$, on obtient : <br>
            $\\begin{aligned}
            ${rienSi1(a)}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}${ecritureAlgebrique(d)}x^2+x&=(${a}${ecritureAlgebrique(d)})x^2+(${b}${ecritureAlgebrique(e)})x${ecritureAlgebrique(c)}\\\\
            &=${miseEnEvidence(`${rienSi1(a + d)}x^2${ecritureAlgebriqueSauf1(b + e)}x+${texNombre(c)}`)}
            \\end{aligned}$`
          }
        }
        reponse = `${reduirePolynomeDegre3(0, a + d, b + e, c, 'x')}`
        break

      case 3: // ax*bx ou ax*b
      default:
        choix = choice([1, 2]) // 1,2
        if (choix === 1) {
          a = randint(-9, 9, 0)
          b = randint(-9, 9, [0, -1, 1])
          if (b > 0) {
            this.question = `Écrire le plus simplement possible : <br> 
            $${rienSi1(a)}x\\times${b}x$.`
          } else {
            this.question = `Écrire le plus simplement possible : <br>$${rienSi1(a)}x\\times(${b}x)$.`
          }
          if (b > 0) {
            this.correction = `On a : <br>
            $\\begin{aligned}
            ${rienSi1(a)}x\\times${b}x&=(${texNombre(a)}\\times  ${ecritureParentheseSiNegatif(b)})x^2\\\\
            &=${miseEnEvidence(`${texNombre(a * b)}x^2`)}
            \\end{aligned}$`
          } else {
            this.correction = `On a : <br>
              $\\begin{aligned}
              ${rienSi1(a)}x\\times (${b}x)&=(${texNombre(a)}\\times  ${ecritureParentheseSiNegatif(b)})x^2\\\\
              &=${miseEnEvidence(`${texNombre(a * b)}x^2`)}\\end{aligned}$`
          }
          reponse = `${reduirePolynomeDegre3(0, a * b, 0, 0, 'x')}`
        }
        if (choix === 2) {
          a = randint(-9, 9, 0)
          b = randint(-9, 9, [0, -1, 1])
          this.question = `Écrire le plus simplement possible : <br>
          $${rienSi1(a)}x\\times${ecritureParentheseSiNegatif(b)}$.`
          this.correction = `$${rienSi1(a)}x\\times${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(`${texNombre(a * b)}x`)}$`
          reponse = `${reduireAxPlusB(a * b, 0, 'x')}`
        }
        break
    }
    this.reponse = reponse
  }
}
