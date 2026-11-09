import {
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const interactifReady = true
export const titre = 'Additionner des entiers relatifs (avec parenthèses)'
export const dateDePublication = '04/10/2023'
/**
 * @author  Gilles Mora (J'ai repris l'ex 5R20)
 *

 */
export const uuid = 'a7061'

export const refs = {
  'fr-fr': ['can5C5-01', '5N2G-flash1'],
  'fr-ch': ['NR'],
}
export default class AdditionRelatifCAN extends ExerciceSimple {
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
    if (this.interactif) {
      this.question =
        '$ ' +
        ecritureNombreRelatif(a) +
        ' + ' +
        ecritureNombreRelatif(b) +
        '=$'
    } else {
      this.question =
        'Calculer $ ' +
        ecritureNombreRelatif(a) +
        ' + ' +
        ecritureNombreRelatif(b) +
        '$.'
    }

    this.correction =
      '$ ' +
      ecritureNombreRelatifc(a) +
      ' + ' +
      ecritureNombreRelatifc(b) +
      ' = ' +
      miseEnEvidence(texNombre(a + b, 0)) +
      ' $'
    this.reponse = a + b
  }
}
