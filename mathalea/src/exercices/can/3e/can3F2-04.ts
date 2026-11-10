import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un antécédent par fonction affine'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '13/10/2022'
/**
 * @author Jean-claude Lhote/Gilles Mora
  * Créé pendant l'été 2021

*/
export const uuid = '83a8a'

export const refs = {
  'fr-fr': ['can3F2-04', 'can2F11-04', '2F13-flash3'],
  'fr-ch': [],
}
export default class CalculAntecedentAffine extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const x = this.quotaRandint('x', -9, 9, [0, 1, -1])
    const m = this.quotaRandint('m', -9, 9, [0, 1, -1])
    const y = randint(-9, 9, [x, 0])
    const nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
    this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${m}x${ecritureAlgebrique(y)}$.<br>
        Quel est l'antécédent de $${m * x + y}$ par la fonction $${nomF}$ ?`
    this.correction = `L'antécédent de $${m * x + y}$ est le nombre $x$ qui a pour image $${m * x + y}$.<br>
     On cherche donc $x$ tel que : <br>
   $${m}x${ecritureAlgebrique(y)}=${m * x + y}$ <br>On obtient $x=\\dfrac{${m * x + y}${ecritureAlgebrique(-y)}}{${m}}=${miseEnEvidence(x)}$.`
    this.reponse = x
  }
}
