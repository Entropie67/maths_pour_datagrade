import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import ExerciceSimple from '../../ExerciceSimple'

export const interactifReady = true
export const titre = 'Multiplier des entiers relatifs'
export const dateDePublication = '04/10/2023'
/**
 * @author  Gilles Mora (J'ai repris l'ex 4C10-3)
 *

 */
export const uuid = '1ae99'

export const refs = {
  'fr-fr': ['can4C1-03'],
  'fr-ch': ['NR'],
}
export default class MultiplicationRelatifCAN extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.sup = 10
  }

  nouvelleVersion() {
    let a = this.quotaRandint('a', 1, this.sup)
    let b = this.quotaRandint('b', 1, this.sup)
    const k = this.quotaChoice('k', [
      [-1, -1],
      [-1, 1],
      [1, -1],
    ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
    a = a * k[0]
    b = b * k[1]
    if (a === 1) {
      a = -1
    }
    if (b === 1) {
      b = -1
    }
    if (this.quotaChoice('booleen', [true, false])) {
      if (this.interactif) {
        this.question =
          '$ ' + a + ' \\times  ' + ecritureParentheseSiNegatif(b) + ' =$'
      } else {
        this.question =
          'Calculer $ ' +
          a +
          ' \\times  ' +
          ecritureParentheseSiNegatif(b) +
          '$.'
      }
      this.correction =
        '$ ' +
        a +
        ' \\times  ' +
        ecritureParentheseSiNegatif(b) +
        ' = ' +
        miseEnEvidence(a * b) +
        ' $'
    } else {
      if (this.interactif) {
        this.question =
          '$ ' +
          ecritureNombreRelatif(a) +
          ' \\times  ' +
          ecritureNombreRelatif(b) +
          ' =$'
      } else {
        this.question =
          'Calculer $ ' +
          ecritureNombreRelatif(a) +
          ' \\times  ' +
          ecritureNombreRelatif(b) +
          ' $.'
      }
      this.correction =
        '$ ' +
        ecritureNombreRelatifc(a) +
        ' \\times  ' +
        ecritureNombreRelatifc(b) +
        ' = ' +
        miseEnEvidence(ecritureNombreRelatif(a * b)) +
        ' $'
    }

    this.reponse = a * b
  }
}
