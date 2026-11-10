import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un nombre dérivé'
export const interactifReady = true

export const dateDePublication = '20/06/2022'

/**
 *
 * @author Gilles Mora

*/
export const uuid = 'a1ba2'

export const refs = {
  'fr-fr': ['can1D1-03'],
  'fr-ch': [],
}
export default class NombreDerivee extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, nbre
    switch (
      this.quotaChoice('type', [1, 2, 3]) //
    ) {
      case 1: // second degre ax^2+bx+c
        a = randint(-5, 5, [0])
        b = randint(-5, 5, [0])
        c = randint(-10, 10, [0])
        nbre = randint(-3, 3)
        this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${reduirePolynomeDegre3(0, a, b, c)}$.<br>
        Déterminer $f'(${nbre})$.`
        this.correction = `$f$ est une fonction polynôme du second degré de la forme $f(x)=ax^2+bx+c$.<br>
    La fonction dérivée est donnée par la somme des dérivées des fonctions $u$ et $v$ définies par $u(x)=${rienSi1(a)}x^2$ et $v(x)=${reduireAxPlusB(b, c)}$.<br>
     Comme $u'(x)=${2 * a}x$ et $v'(x)=${b}$, on obtient  $f'(x)=${reduireAxPlusB(2 * a, b)}$. <br>
     Ainsi, $f'(${nbre})=${2 * a}\\times ${ecritureParentheseSiNegatif(nbre)}${ecritureAlgebrique(b)}=${miseEnEvidence(2 * a * nbre + b)}$.`
        this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${reduirePolynomeDegre3(0, a, b, c)}$.`
        this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        this.reponse = 2 * a * nbre + b
        break

      case 2: // second degre bx+c+ax^2 ou c+ax^2+bx
        a = randint(-5, 5, [0])
        b = randint(-5, 5, [0])
        c = randint(-10, 10, [0])
        nbre = randint(-3, 3)
        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
          $f(x)= ${reduireAxPlusB(b, c)}${ecritureAlgebriqueSauf1(a)}x^2$.<br>
            Déterminer $f'(${nbre})$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${reduireAxPlusB(b, c)}${ecritureAlgebriqueSauf1(a)}x^2$.`
          this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
          $f(x)= ${c}${ecritureAlgebriqueSauf1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$.<br>
            Déterminer $f'(${nbre})$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${c}${ecritureAlgebriqueSauf1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$.`
          this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        }
        this.correction = `$f$ est une fonction polynôme du second degré de la forme $f(x)=ax^2+bx+c$.<br>
    La fonction dérivée est donnée par la somme des dérivées des fonctions $u$ et $v$ définies par $u(x)=${rienSi1(a)}x^2$ et $v(x)=${reduireAxPlusB(b, c)}$.<br>
     Comme $u'(x)=${2 * a}x$ et $v'(x)=${b}$, on obtient  $f'(x)=${reduireAxPlusB(2 * a, b)}$. <br>
     Ainsi, $f'(${nbre})=${2 * a}\\times ${ecritureParentheseSiNegatif(nbre)}${ecritureAlgebrique(b)}=${miseEnEvidence(2 * a * nbre + b)}$.`
        this.reponse = 2 * a * nbre + b

        break

      case 3: // second degre ax^2+c ou c+ax^2
        a = randint(-10, 10, [0])
        c = randint(-10, 10, [0])
        nbre = randint(-5, 5)
        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
          $f(x)= ${reduirePolynomeDegre3(0, a, 0, c)}$.<br>
            Déterminer $f'(${nbre})$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${reduirePolynomeDegre3(0, a, 0, c)}$.`
          this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
          $f(x)= ${c}${ecritureAlgebriqueSauf1(a)}x^2$.<br>
            Déterminer $f'(${nbre})$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)= ${c}${ecritureAlgebriqueSauf1(a)}x^2$.`
          this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        }

        this.correction = `$f$ est une fonction polynôme du second degré de la forme $f(x)=ax^2+b$.<br>
    La fonction dérivée est donnée par la somme des dérivées des fonctions $u$ et $v$ définies par $u(x)=${rienSi1(a)}x^2$ et $v(x)=${c}$.<br>
     Comme $u'(x)=${2 * a}x$ et $v'(x)=0$, on obtient  $f'(x)=${reduireAxPlusB(2 * a, 0)}$. <br>
     Ainsi, $f'(${nbre})=${2 * a}\\times ${ecritureParentheseSiNegatif(nbre)}=${miseEnEvidence(2 * a * nbre)}$.`
        this.reponse = 2 * a * nbre
        break
    }
    if (this.interactif) {
      this.question += '<br>' + `$f'(${nbre})=$`
    }
  }
}
