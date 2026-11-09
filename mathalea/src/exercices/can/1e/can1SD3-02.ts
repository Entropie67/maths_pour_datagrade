import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une forme canonique'
export const interactifReady = true

export const dateDePublication = '07/06/2022'

/**
 *
 * @author Gilles Mora repris de 1E11-3 de Stéphane

*/
export const uuid = 'd1ad9'

export const refs = {
  'fr-fr': ['can1SD3-02'],
  'fr-ch': [],
}
export default class FormeCanonique extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const alpha = this.quotaRandint('alpha', -3, 3, [0])
    const beta = this.quotaRandint('beta', -5, 5, [0])
    const b = -2 * alpha
    const c = alpha * alpha + beta
    if (c !== 0) {
      if (!this.interactif) {
        this.question = `Soit $f(x)= x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.<br>

       Donner la forme canonique de $f(x)$.`
      } else {
        this.question = `Soit $f(x)= x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.<br>

        La forme canonique de $f(x)$ est :<br> $f(x)=$`
      }
    } else {
      if (!this.interactif) {
        this.question = `Soit
        $f(x)= x^2${ecritureAlgebriqueSauf1(b)}x$.<br>

        Donner la forme canonique de $f(x)$.`
      } else {
        this.question = `Soit
        $f(x)= x^2${ecritureAlgebriqueSauf1(b)}x$.<br>
        
       La forme canonique de $f(x)$ est : $f(x)=$`
      }
    }

    this.correction =
      'La forme canonique est donnée par : $f(x)=a(x-\\alpha)^2+\\beta$.'

    this.correction += `<br> On a $a=1$, et on reconnaît dans $x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$, le début du carré de $(${reduireAxPlusB(1, -alpha)})^2$.`
    this.correction += `<br>On peut donc écrire :  $\\underbrace{x^2${ecritureAlgebriqueSauf1(b)}x}_{(${reduireAxPlusB(1, -alpha)})^2-${(-alpha) ** 2}}${ecritureAlgebrique(c)}
    =(${reduireAxPlusB(1, -alpha)})^2-${(-alpha) ** 2}${ecritureAlgebrique(c)}$.`
    this.correction += '<br>Soit : $f(x)='
    this.reponse = [
      `(x${ecritureAlgebrique(b / 2)})^2${ecritureAlgebrique(beta)}`,
      `${beta}+(x${ecritureAlgebrique(b / 2)})^2`,
    ]
    this.correction += `${miseEnEvidence(this.reponse[0])}$`
  }
}
