import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un coefficient dans un développement'
export const interactifReady = true

export const dateDePublication = '11/06/2022'

/**
 *
 * @author Gilles Mora

*/
export const uuid = 'cbbbb'

export const refs = {
  'fr-fr': ['can1SD3-04', 'BP1AUTO069'],
  'fr-ch': [],
}
export default class DeveloppementCoeff2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, d
    a = randint(-3, 3, [0])
    b = randint(-3, 3, [0])
    c = randint(-2, 5, [-1, 0])
    d = randint(-2, 5, [0])
    const e = this.quotaRandint('e', 1, 3, [0])
    const f = this.quotaRandint('f', -9, 9, [0])
    if (a * d + b * c === 0) {
      a = randint(-8, 5, [0])
      b = randint(-5, 9, [0])
      c = randint(-5, 5, [0])
      d = randint(-5, 8, [0])
    }
    this.question = `Déterminer le coefficient de $x$ dans le développement réduit de l'expression : <br>
         $ (${reduireAxPlusB(e, f)})^2+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$
       `
    if (f > 0) {
      this.correction = `$\\bullet$ Le coefficient du terme en $x$ dans le développement de
       $(${reduireAxPlusB(e, f)})^2$ est $2\\times ${rienSi1(e)}x\\times ${f}=${2 * e * f}x$. <br>`
    } else {
      this.correction = `$\\bullet$ Le coefficient du terme en $x$ dans le développement de
       $(${reduireAxPlusB(e, f)})^2$ est $-2\\times ${rienSi1(e)}x\\times ${-f}=${2 * e * f}x$.<br>`
    }
    this.correction += `$\\bullet$ Le coefficient du terme en $x$ dans le développement de
    $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$ est la somme des produits :`
    if (c < 0) {
      this.correction += `
     $${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(d)}$ et $${b} \\times (${c}x)$,
     soit  $${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(d)}+${ecritureParentheseSiNegatif(b)} \\times (${rienSi1(c)}x)=
     ${rienSi1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x=${rienSi1(a * d + b * c)}x$.<br>
     `
    } else {
      this.correction += `
     $${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(d)}$ et $${b} \\times ${rienSi1(c)}x$,
     soit  $${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(d)}+${ecritureParentheseSiNegatif(b)} \\times ${rienSi1(c)}x=${a * d}x${ecritureAlgebriqueSauf1(b * c)}x=${rienSi1(a * d + b * c)}x$.<br>
      `
    }
    this.correction += `
     Le terme en $x$ est donc donné par la somme :  $${2 * e * f}x +${a * d + b * c === 1 ? '' : `${ecritureParentheseSiNegatif(a * d + b * c)}`}x=${2 * e * f + a * d + b * c}x$.<br>
     Le coefficient devant $x$ est donc $${miseEnEvidence(miseEnEvidence(2 * e * f + a * d + b * c))}$.`

    this.reponse = 2 * e * f + a * d + b * c
  }
}
