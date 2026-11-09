import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const interactifReady = true
export const titre =
  'Additionner ou soustraire des entiers relatifs (écriture simplifiée)'
export const dateDePublication = '04/10/2023'
/**
 * @author  Gilles Mora
 *

 */
export const uuid = '8a835'

export const refs = {
  'fr-fr': ['can5C5-02', '5N2L-flash1'],
  'fr-ch': [],
}
export default class AdditionRelatifBisCAN extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a = this.quotaRandint('a', 1, 10)
    let b = randint(1, 10, a)
    do {
      const k = choice([
        [-1, -1],
        [-1, 1],
        [1, -1],
      ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
      a = a * k[0]
      b = b * k[1]
    } while (a > 0 && a > -b)
    if (this.interactif) {
      this.question = `$${texNombre(a)}${ecritureAlgebrique(b)} =$`
    } else {
      this.question = `Calculer $${texNombre(a)}${ecritureAlgebrique(b)}$.`
    }

    this.correction = `$ ${a}${ecritureAlgebrique(b)} = ${miseEnEvidence(a + b)} $`
    this.reponse = a + b
  }
}
